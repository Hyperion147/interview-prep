import { db } from "@/db";
import { leadAutomation } from "@/db/schema/whatsapp";
import { canAccess } from "@/lib/auth/authorization";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    if (!(await canAccess("leads:write"))) return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    const body = await request.json().catch(() => null) as { autoReplyEnabled?: unknown; handoffRequired?: unknown; markViewed?: unknown } | null;
    if (!body || (typeof body.autoReplyEnabled !== "boolean" && typeof body.handoffRequired !== "boolean" && body.markViewed !== true)) {
        return Response.json({ error: "Invalid automation settings" }, { status: 400 });
    }
    const values = {
        ...(typeof body.autoReplyEnabled === "boolean" ? { autoReplyEnabled: body.autoReplyEnabled } : {}),
        ...(typeof body.handoffRequired === "boolean" ? { handoffRequired: body.handoffRequired } : {}),
        ...(body.markViewed === true ? { lastViewedAt: new Date() } : {}),
        updatedAt: new Date(),
    };
    const [saved] = await db.insert(leadAutomation).values({ leadId: id, ...values })
        .onConflictDoUpdate({ target: leadAutomation.leadId, set: values }).returning();
    return Response.json(saved);
}
