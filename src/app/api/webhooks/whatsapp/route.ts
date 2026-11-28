import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema/leads";
import { whatsappEvents } from "@/db/schema/whatsapp";
import { followUps } from "@/db/schema/follow-ups";
import { captureEnquiry } from "@/lib/crm/intake";

type Incoming = {
    id: string;
    from: string;
    timestamp: string;
    text?: { body?: string };
};
type Payload = {
    entry?: {
        changes?: {
            value?: {
                metadata?: { phone_number_id?: string };
                messages?: Incoming[];
            };
        }[];
    }[];
};

export function GET(request: Request) {
    const params = new URL(request.url).searchParams;
    const token = process.env.WHATSAPP_VERIFY_TOKEN;
    return token &&
        params.get("hub.mode") === "subscribe" &&
        params.get("hub.verify_token") === token
        ? new Response(params.get("hub.challenge"))
        : new Response(null, { status: 403 });
}

async function qualify(message: string) {
    if (!process.env.GEMINI_API_KEY) throw new Error("Gemini unavailable");
    const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/interactions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GEMINI_API_KEY,
            },
            body: JSON.stringify({
                model,
                store: false,
                system_instruction:
                    "You are TravelDesk’s automated travel assistant. Reply in at most three short sentences. Only discuss travel or TravelDesk. Ask for missing destination, dates and group size. Never promise bookings, visa approvals, prices, or availability. Never request payment details or identity documents. Decline other topics.",
                input: message.slice(0, 1500),
            }),
            signal: AbortSignal.timeout(8000),
        },
    );
    if (!response.ok) throw new Error("Gemini unavailable");
    const data: {
        steps?: { type: string; content?: { type: string; text?: string }[] }[];
    } = await response.json();
    const reply = data.steps
        ?.filter((step) => step.type === "model_output")
        .flatMap((step) => step.content ?? [])
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join(" ")
        .trim();
    if (!reply) throw new Error("Empty Gemini response");
    return reply.slice(0, 600);
}

async function handle(
    message: Incoming,
    numberId: string,
    token: string,
    version: string,
) {
    if (!/^\d{7,15}$/.test(message.from) || typeof message.id !== "string")
        return;
    const body = message.text?.body;
    const age = Date.now() - Number(message.timestamp) * 1000;
    const handoff =
        !body ||
        /\b(agent|human|refund|complaint|payment|cancel)\b/i.test(body) ||
        !Number.isFinite(age) ||
        age < -60_000 ||
        age >= 24 * 60 * 60 * 1000;
    const lead = await captureEnquiry(
        {
            fullName: "WhatsApp enquiry",
            email: "",
            phone: message.from,
            destination: "To be confirmed",
            source: "other",
        },
        message.id,
        handoff,
        body,
    );
    if (!lead || handoff) return;

    try {
        const reply = await qualify(body);
        const result = await fetch(
            `https://graph.facebook.com/${version}/${numberId}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: message.from,
                    type: "text",
                    text: { body: `TravelDesk assistant: ${reply}` },
                }),
                signal: AbortSignal.timeout(5000),
            },
        );
        if (!result.ok) throw new Error("WhatsApp send rejected");
    } catch {
        await db.transaction(async (tx) => {
            await tx
                .update(whatsappEvents)
                .set({ status: "needs_review" })
                .where(eq(whatsappEvents.id, message.id));
            await tx.insert(followUps).values({
                leadId: lead.id,
                title: "Review unsuccessful WhatsApp reply",
                channel: "whatsapp",
                priority: "high",
                scheduledAt: new Date(),
                notes: body.slice(0, 1500),
            });
        });
        return;
    }
    await db.transaction(async (tx) => {
        await tx
            .update(whatsappEvents)
            .set({ status: "replied" })
            .where(eq(whatsappEvents.id, message.id));
        if (lead.status === "new") {
            await tx
                .update(leads)
                .set({ status: "contacted" })
                .where(and(eq(leads.id, lead.id), eq(leads.status, "new")));
        }
    });
}

export async function POST(request: Request) {
    const {
        WHATSAPP_APP_SECRET: secret,
        WHATSAPP_ACCESS_TOKEN: token,
        WHATSAPP_PHONE_NUMBER_ID: phoneId,
        WHATSAPP_GRAPH_VERSION: version,
    } = process.env;
    if (
        !secret ||
        !token ||
        !phoneId ||
        !version ||
        !/^v\d+\.\d+$/.test(version) ||
        !/^\d+$/.test(phoneId)
    ) {
        return new Response(null, { status: 503 });
    }
    const raw = Buffer.from(await request.arrayBuffer());
    const signature = request.headers.get("x-hub-signature-256") ?? "";
    const expected =
        "sha256=" + createHmac("sha256", secret).update(raw).digest("hex");
    if (
        !/^sha256=[a-f0-9]{64}$/.test(signature) ||
        !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    ) {
        return new Response(null, { status: 403 });
    }
    try {
        const payload: Payload = JSON.parse(raw.toString("utf8"));
        for (const entry of payload.entry ?? []) {
            for (const change of entry.changes ?? []) {
                if (change.value?.metadata?.phone_number_id !== phoneId)
                    continue;
                for (const message of change.value.messages ?? [])
                    await handle(message, phoneId, token, version);
            }
        }
        return new Response("OK");
    } catch {
        return new Response(null, { status: 500 });
    }
}
