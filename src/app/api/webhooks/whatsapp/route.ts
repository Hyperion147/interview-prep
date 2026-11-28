import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/db";
import { followUps } from "@/db/schema/follow-ups";
import { leads } from "@/db/schema/leads";
import { leadAutomation, whatsappEvents, whatsappMessages } from "@/db/schema/whatsapp";
import { captureEnquiry } from "@/lib/crm/intake";
import { generateLeadInsight } from "@/lib/crm/lead-ai";
import { sendWhatsAppText } from "@/lib/whatsapp/cloud-api";

type Incoming = { id: string; from: string; timestamp: string; type?: string; text?: { body?: string }; button?: { text?: string }; interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } } };
type Status = { id?: string; status?: string; timestamp?: string; errors?: Array<{ title?: string; message?: string }> };
type Payload = { entry?: Array<{ changes?: Array<{ value?: { metadata?: { phone_number_id?: string }; messages?: Incoming[]; statuses?: Status[] } }> }> };
const statusOrder = ["queued", "sent", "delivered", "read", "failed"] as const;

export function GET(request: Request) {
    const params = new URL(request.url).searchParams;
    const token = process.env.WHATSAPP_VERIFY_TOKEN;
    return token && params.get("hub.mode") === "subscribe" && params.get("hub.verify_token") === token
        ? new Response(params.get("hub.challenge")) : new Response(null, { status: 403 });
}

function messageBody(message: Incoming) {
    return message.text?.body?.trim() || message.button?.text?.trim()
        || message.interactive?.button_reply?.title?.trim()
        || message.interactive?.list_reply?.title?.trim() || "";
}

function needsImmediateHandoff(body: string, message: Incoming) {
    const age = Date.now() - Number(message.timestamp) * 1000;
    return !body || !["text", "button", "interactive"].includes(message.type ?? "text")
        || /\b(agent|human|refund|complaint|payment|cancel|emergency|unsafe)\b/i.test(body)
        || !Number.isFinite(age) || age < -60_000 || age >= 24 * 60 * 60 * 1000;
}

async function flagForHandoff(leadId: string, messageId: string, body: string, title: string) {
    const now = new Date();
    await db.transaction(async (tx) => {
        await tx.update(whatsappEvents).set({ status: "needs_review" }).where(eq(whatsappEvents.id, messageId));
        await tx.insert(leadAutomation).values({ leadId, handoffRequired: true, autoReplyEnabled: false, lastInboundAt: now })
            .onConflictDoUpdate({ target: leadAutomation.leadId, set: { handoffRequired: true, autoReplyEnabled: false, lastInboundAt: now, updatedAt: now } });
        await tx.insert(followUps).values({ leadId, title, channel: "whatsapp", priority: "high", scheduledAt: now, notes: body.slice(0, 1500) });
    });
}

async function handleMessage(message: Incoming) {
    if (!/^\d{7,15}$/.test(message.from) || !message.id) return;
    const body = messageBody(message);
    const handoff = needsImmediateHandoff(body, message);
    const lead = await captureEnquiry({
        fullName: "WhatsApp enquiry", email: "", phone: message.from,
        destination: "To be confirmed", source: "other",
    }, message.id, handoff, body);
    if (!lead) return;
    const receivedAt = Number.isFinite(Number(message.timestamp)) ? new Date(Number(message.timestamp) * 1000) : new Date();
    await db.transaction(async (tx) => {
        await tx.insert(whatsappMessages).values({
            id: message.id, leadId: lead.id, direction: "inbound", status: "received",
            body: body || `[Unsupported WhatsApp ${message.type ?? "message"}]`, providerTimestamp: receivedAt,
        }).onConflictDoNothing();
        await tx.insert(leadAutomation).values({ leadId: lead.id, lastInboundAt: receivedAt, handoffRequired: handoff })
            .onConflictDoUpdate({ target: leadAutomation.leadId, set: { lastInboundAt: receivedAt, ...(handoff ? { handoffRequired: true, autoReplyEnabled: false } : {}), updatedAt: new Date() } });
    });
    if (handoff) return;

    let insight;
    try {
        insight = await generateLeadInsight(lead.id);
    } catch (error) {
        console.error("WhatsApp lead analysis failed", error);
        await flagForHandoff(lead.id, message.id, body, "Review WhatsApp enquiry — AI unavailable");
        return;
    }
    if (insight?.handoffRequired) {
        await flagForHandoff(lead.id, message.id, body, "Human response required on WhatsApp");
        return;
    }
    const [automation] = await db.select().from(leadAutomation).where(eq(leadAutomation.leadId, lead.id)).limit(1);
    if (!automation?.autoReplyEnabled || !automation.suggestedReply) return;
    try {
        const providerId = await sendWhatsAppText(message.from, automation.suggestedReply);
        const now = new Date();
        await db.transaction(async (tx) => {
            await tx.insert(whatsappMessages).values({ id: providerId, leadId: lead.id, direction: "outbound", status: "sent", body: automation.suggestedReply!, providerTimestamp: now });
            await tx.update(whatsappEvents).set({ status: "replied" }).where(eq(whatsappEvents.id, message.id));
            await tx.update(leadAutomation).set({ lastOutboundAt: now }).where(eq(leadAutomation.leadId, lead.id));
            await tx.update(leads).set({ status: "contacted", updatedAt: now }).where(and(eq(leads.id, lead.id), eq(leads.status, "new")));
        });
    } catch (error) {
        console.error("WhatsApp auto-reply failed", error);
        await flagForHandoff(lead.id, message.id, body, "Send WhatsApp reply manually");
    }
}

async function handleStatus(status: Status) {
    if (!status.id || !status.status || !statusOrder.includes(status.status as (typeof statusOrder)[number])) return;
    const next = status.status as (typeof statusOrder)[number];
    const [current] = await db.select({ status: whatsappMessages.status }).from(whatsappMessages).where(eq(whatsappMessages.id, status.id)).limit(1);
    if (!current || (next !== "failed" && statusOrder.indexOf(next) < statusOrder.indexOf(current.status as (typeof statusOrder)[number]))) return;
    await db.update(whatsappMessages).set({
        status: next,
        error: next === "failed" ? status.errors?.map((error) => error.message ?? error.title).filter(Boolean).join("; ").slice(0, 1000) || "Delivery failed" : null,
        updatedAt: status.timestamp ? new Date(Number(status.timestamp) * 1000) : new Date(),
    }).where(eq(whatsappMessages.id, status.id));
}

export async function POST(request: Request) {
    const secret = process.env.WHATSAPP_APP_SECRET;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!secret || !phoneId) return new Response(null, { status: 503 });
    const raw = Buffer.from(await request.arrayBuffer());
    const signature = request.headers.get("x-hub-signature-256") ?? "";
    const expected = `sha256=${createHmac("sha256", secret).update(raw).digest("hex")}`;
    if (!/^sha256=[a-f0-9]{64}$/.test(signature) || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return new Response(null, { status: 403 });
    try {
        const payload = JSON.parse(raw.toString("utf8")) as Payload;
        after(async () => {
            try {
                for (const entry of payload.entry ?? []) for (const change of entry.changes ?? []) {
                    if (change.value?.metadata?.phone_number_id !== phoneId) continue;
                    for (const status of change.value.statuses ?? []) await handleStatus(status);
                    for (const message of change.value.messages ?? []) await handleMessage(message);
                }
            } catch (error) {
                console.error("WhatsApp background processing failed", error);
            }
        });
        return new Response("OK");
    } catch (error) {
        console.error("WhatsApp webhook failed", error);
        return new Response(null, { status: 500 });
    }
}
