import { eq } from "drizzle-orm";
import { db } from "@/db";
import { leadAutomation } from "@/db/schema/whatsapp";
import { canAccess } from "@/lib/auth/authorization";
import { generateLeadInsight } from "@/lib/crm/lead-ai";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
    if (!(await canAccess("leads:read"))) return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    const [insight] = await db.select().from(leadAutomation).where(eq(leadAutomation.leadId, id)).limit(1);
    return Response.json(insight ?? null);
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
