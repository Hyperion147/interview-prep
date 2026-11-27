import { eq } from "drizzle-orm";
import { db } from "@/db";
import { agents } from "@/db/schema/auth";
import { requireAdmin } from "@/lib/auth/authorization";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    if (!(await requireAdmin()))
        return Response.json(
            { error: "Admin access required" },
            { status: 403 },
        );
    const { id } = await params;
    const body = await request.json();
    const [updated] = await db
        .update(agents)
        .set({
            fullName: String(body.fullName).trim(),
            phone: body.phone ? String(body.phone) : null,
            status: body.status,
            permissions: Array.isArray(body.permissions)
                ? body.permissions.map(String)
                : [],
            updatedAt: new Date(),
        })
        .where(eq(agents.id, id))
        .returning();
    return updated
        ? Response.json(updated)
        : Response.json({ error: "Agent not found" }, { status: 404 });
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    if (!(await requireAdmin()))
        return Response.json(
            { error: "Admin access required" },
            { status: 403 },
        );
    const { id } = await params;
    const [agent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, id))
        .limit(1);
    if (!agent)
        return Response.json({ error: "Agent not found" }, { status: 404 });
    if (agent.authUserId) {
        const { error } = await createAdminClient().auth.admin.deleteUser(
            agent.authUserId,
        );
        if (error)
            return Response.json({ error: error.message }, { status: 400 });
    }
    await db.delete(agents).where(eq(agents.id, id));
    return Response.json({ id });
}
