import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { leadAiInsightHistory, leadAutomation } from "@/db/schema/whatsapp";
import { canAccess } from "@/lib/auth/authorization";
import { generateLeadInsight } from "@/lib/crm/lead-ai";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
    if (!(await canAccess("leads:read"))) return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    const [[insight], history] = await Promise.all([
        db.select().from(leadAutomation).where(eq(leadAutomation.leadId, id)).limit(1),
        db.select().from(leadAiInsightHistory).where(eq(leadAiInsightHistory.leadId, id)).orderBy(desc(leadAiInsightHistory.createdAt)).limit(20),
    ]);
    return Response.json({ insight: insight ?? null, history });
}

export async function PATCH(request: Request, context: Context) {
    if (!(await canAccess("leads:write"))) return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    const body = await request.json().catch(() => null) as { historyId?: unknown; editedReply?: unknown } | null;
    if (typeof body?.historyId !== "string") return Response.json({ error: "Invalid insight" }, { status: 400 });
    const editedReply = typeof body.editedReply === "string" ? body.editedReply.trim().slice(0, 1500) : null;
    const [updated] = await db.update(leadAiInsightHistory).set({ acceptedAt: new Date(), editedReply })
        .where(and(eq(leadAiInsightHistory.id, body.historyId), eq(leadAiInsightHistory.leadId, id))).returning();
    if (!updated) return Response.json({ error: "Insight not found" }, { status: 404 });
    return Response.json(updated);
}

export async function POST(_request: Request, context: Context) {
    if (!(await canAccess("leads:write"))) return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    try {
        const insight = await generateLeadInsight(id);
        return insight ? Response.json(insight) : Response.json({ error: "Lead not found" }, { status: 404 });
    } catch (error) {
        console.error("Lead summary failed", error);
        return Response.json({ error: "Gemini could not summarize this lead" }, { status: 502 });
    }
}
