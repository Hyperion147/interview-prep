import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema/leads";
import { leadAutomation } from "@/db/schema/whatsapp";
import { canAccess } from "@/lib/auth/authorization";

export async function GET() {
    if (!(await canAccess("leads:read")))
        return Response.json({ error: "Forbidden" }, { status: 403 });
    const rows = await db
        .select({
            id: leads.id,
            fullName: leads.fullName,
            email: leads.email,
            phone: leads.phone,
            destination: leads.destination,
            status: leads.status,
            source: leads.source,
            travelers: leads.travelers,
            estimatedValue: leads.estimatedValue,
            notes: leads.notes,
            nextFollowUpAt: leads.nextFollowUpAt,
            createdAt: leads.createdAt,
            updatedAt: leads.updatedAt,
            handoffRequired: sql<boolean>`coalesce(${leadAutomation.handoffRequired}, false)`,
            aiPriority: leadAutomation.priority,
            unreadWhatsApp: sql<number>`(
            select count(*)::int from whatsapp_messages wm
            where wm.lead_id = ${leads.id}
              and wm.direction = 'inbound'
              and wm.created_at > coalesce(${leadAutomation.lastViewedAt}, to_timestamp(0))
        )`,
            lastWhatsAppMessage: sql<string | null>`(
            select wm.body from whatsapp_messages wm
            where wm.lead_id = ${leads.id}
            order by wm.created_at desc limit 1
        )`,
            whatsappDeliveryFailed: sql<boolean>`exists(
            select 1 from whatsapp_messages wm
            where wm.lead_id = ${leads.id} and wm.status = 'failed'
        )`,
        })
        .from(leads)
        .leftJoin(leadAutomation, eq(leadAutomation.leadId, leads.id))
        .orderBy(desc(leads.createdAt));
    return Response.json(rows);
}

export async function POST(request: Request) {
    if (!(await canAccess("leads:write")))
        return Response.json({ error: "Forbidden" }, { status: 403 });
    const body = await request.json();
    try {
        const [created] = await db
            .insert(leads)
            .values({
                fullName: body.fullName,
                email: body.email,
                phone: body.phone,
                destination: body.destination,
                status: body.status ?? "new",
                source: body.source ?? "website",
                travelers: Number(body.travelers ?? 1),
                estimatedValue: String(body.estimatedValue ?? 0),
                notes: body.notes ? body.notes : null,
                nextFollowUpAt: body.nextFollowUpAt
                    ? new Date(body.nextFollowUpAt)
                    : null,
            })
            .returning();
        return Response.json(created, { status: 201 });
    } catch (error) {
        console.error("Failed to create lead:", error);
        return Response.json(
            { error: "Failed to create lead" },
            { status: 400 },
        );
    }
}
