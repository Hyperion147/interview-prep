import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { agents } from "@/db/schema/auth";
import { followUps } from "@/db/schema/follow-ups";
import { leads } from "@/db/schema/leads";
import { leadActivities, leadAiInsightHistory, leadAutomation, whatsappMessages } from "@/db/schema/whatsapp";
import { canAccess } from "@/lib/auth/authorization";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
    if (!(await canAccess("leads:read"))) return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    const [[lead], [automation], messages, history, activities, tasks, agentRows] = await Promise.all([
        db.select().from(leads).where(eq(leads.id, id)).limit(1),
        db.select().from(leadAutomation).where(eq(leadAutomation.leadId, id)).limit(1),
        db.select().from(whatsappMessages).where(eq(whatsappMessages.leadId, id)).orderBy(asc(whatsappMessages.createdAt)).limit(200),
        db.select().from(leadAiInsightHistory).where(eq(leadAiInsightHistory.leadId, id)).orderBy(desc(leadAiInsightHistory.createdAt)).limit(20),
        db.select().from(leadActivities).where(eq(leadActivities.leadId, id)).orderBy(desc(leadActivities.createdAt)).limit(50),
        db.select().from(followUps).where(eq(followUps.leadId, id)).orderBy(desc(followUps.createdAt)).limit(20),
        db.select({ id: agents.id, fullName: agents.fullName }).from(agents).where(eq(agents.status, "active")),
    ]);
    if (!lead) return Response.json({ error: "Lead not found" }, { status: 404 });
    return Response.json({ lead, automation, messages, history, activities, tasks, agents: agentRows });
}

export async function PATCH(request: Request, context: Context) {
    if (!(await canAccess("leads:write"))) return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!body) return Response.json({ error: "Invalid update" }, { status: 400 });
    const values = {
        ...(body.inboxStatus === "open" || body.inboxStatus === "done" ? { inboxStatus: body.inboxStatus as "open" | "done" } : {}),
        ...(typeof body.important === "boolean" ? { important: body.important } : {}),
        ...(typeof body.assignedAgentId === "string" || body.assignedAgentId === null ? { assignedAgentId: body.assignedAgentId as string | null } : {}),
        ...(body.markViewed === true ? { lastViewedAt: new Date() } : {}),
        updatedAt: new Date(),
    };
    const [saved] = await db.insert(leadAutomation).values({ leadId: id, ...values })
        .onConflictDoUpdate({ target: leadAutomation.leadId, set: values }).returning();
    if ("assignedAgentId" in values) await db.insert(leadActivities).values({ leadId: id, kind: "assignment", body: values.assignedAgentId ? "Conversation assigned" : "Conversation unassigned", metadata: { assignedAgentId: values.assignedAgentId } });
    return Response.json(saved);
}
