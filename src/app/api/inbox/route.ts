import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { agents } from "@/db/schema/auth";
import { leads } from "@/db/schema/leads";
import { leadAutomation } from "@/db/schema/whatsapp";
import { canAccess } from "@/lib/auth/authorization";

export async function GET() {
    if (!(await canAccess("leads:read")))
        return Response.json({ error: "Forbidden" }, { status: 403 });
    const conversations = await db
        .select({
            id: leads.id,
            fullName: leads.fullName,
            phone: leads.phone,
            destination: leads.destination,
            status: leads.status,
            assignedAgentId: leadAutomation.assignedAgentId,
            assignedAgentName: agents.fullName,
            inboxStatus: sql<string>`coalesce(${leadAutomation.inboxStatus}, 'open')`,
            important: sql<boolean>`coalesce(${leadAutomation.important}, false)`,
            handoffRequired: sql<boolean>`coalesce(${leadAutomation.handoffRequired}, false)`,
            leadScore: sql<number>`coalesce(${leadAutomation.leadScore}, 0)`,
            aiPriority: leadAutomation.priority,
            summary: leadAutomation.summary,
            lastViewedAt: leadAutomation.lastViewedAt,
            lastMessage: sql<
                string | null
            >`(select body from whatsapp_messages where lead_id=${leads.id} order by created_at desc limit 1)`,
            lastMessageAt: sql<Date | null>`(select created_at from whatsapp_messages where lead_id=${leads.id} order by created_at desc limit 1)`,
            lastDirection: sql<
                string | null
            >`(select direction::text from whatsapp_messages where lead_id=${leads.id} order by created_at desc limit 1)`,
            unreadCount: sql<number>`(select count(*)::int from whatsapp_messages where lead_id=${leads.id} and direction='inbound' and created_at > coalesce(${leadAutomation.lastViewedAt}, to_timestamp(0)))`,
        })
        .from(leads)
        .innerJoin(leadAutomation, eq(leadAutomation.leadId, leads.id))
        .leftJoin(agents, eq(agents.id, leadAutomation.assignedAgentId))
        .orderBy(
            desc(
                sql`(select created_at from whatsapp_messages where lead_id=${leads.id} order by created_at desc limit 1)`,
            ),
        );
    return Response.json(conversations);
}
