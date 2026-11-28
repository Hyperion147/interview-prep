import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema/leads";
import { leadAutomation, whatsappMessages } from "@/db/schema/whatsapp";
import { canAccess } from "@/lib/auth/authorization";
import { sendWhatsAppTemplate, sendWhatsAppText, whatsappConfigured } from "@/lib/whatsapp/cloud-api";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
    if (!(await canAccess("leads:read"))) return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    const [messages, [automation]] = await Promise.all([
        db.select().from(whatsappMessages).where(eq(whatsappMessages.leadId, id)).orderBy(asc(whatsappMessages.createdAt)).limit(100),
        db.select().from(leadAutomation).where(eq(leadAutomation.leadId, id)).limit(1),
    ]);
    return Response.json({ configured: whatsappConfigured(), messages, automation: automation ?? null });
}

export async function POST(request: Request, context: Context) {
    if (!(await canAccess("leads:write"))) return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    const body = await request.json().catch(() => null) as { message?: unknown; templateName?: unknown; language?: unknown } | null;
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const templateName = typeof body?.templateName === "string" ? body.templateName.trim() : "";
    if ((!message && !templateName) || message.length > 1500 || !/^[a-z0-9_]*$/.test(templateName)) {
        return Response.json({ error: "Enter a valid message or approved template name" }, { status: 400 });
    }
    const [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    if (!lead) return Response.json({ error: "Lead not found" }, { status: 404 });
    const phone = lead.phone.replace(/\D/g, "");
    if (!/^\d{7,15}$/.test(phone)) return Response.json({ error: "Lead phone number is invalid" }, { status: 400 });
    try {
        const providerId = templateName
            ? await sendWhatsAppTemplate(phone, templateName, typeof body?.language === "string" ? body.language : "en_US")
            : await sendWhatsAppText(phone, message);
        const now = new Date();
        const [saved] = await db.transaction(async (tx) => {
            const result = await tx.insert(whatsappMessages).values({
                id: providerId, leadId: id, direction: "outbound", status: "sent",
                body: templateName ? `[Template: ${templateName}]` : message,
                providerTimestamp: now,
            }).returning();
            await tx.insert(leadAutomation).values({ leadId: id, handoffRequired: false, lastOutboundAt: now })
                .onConflictDoUpdate({ target: leadAutomation.leadId, set: { handoffRequired: false, lastOutboundAt: now, updatedAt: now } });
            return result;
        });
        return Response.json(saved, { status: 201 });
    } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : "Unable to send WhatsApp message" }, { status: 502 });
    }
}
