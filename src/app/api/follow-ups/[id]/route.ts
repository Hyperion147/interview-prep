import { eq } from "drizzle-orm";
import { db } from "@/db";
import { followUps } from "@/db/schema/follow-ups";
import { followUpValues } from "@/lib/follow-up-values";
import { canAccess } from "@/lib/auth/authorization";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    if (!(await canAccess("follow-ups:manage")))
        return Response.json({ error: "Forbidden" }, { status: 403 });
    try {
        const { id } = await params;
        const [updated] = await db
            .update(followUps)
            .set({
                ...followUpValues(await request.json()),
                updatedAt: new Date(),
            })
            .where(eq(followUps.id, id))
            .returning();
        return updated
            ? Response.json(updated)
            : Response.json({ error: "Follow-up not found" }, { status: 404 });
    } catch (error) {
        return Response.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unable to update follow-up",
            },
            { status: 400 },
        );
    }
}
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    if (!(await canAccess("follow-ups:manage")))
        return Response.json({ error: "Forbidden" }, { status: 403 });
    try {
        const { id } = await params;
        const [deleted] = await db
            .delete(followUps)
            .where(eq(followUps.id, id))
            .returning({ id: followUps.id });
        return deleted
            ? Response.json(deleted)
            : Response.json({ error: "Follow-up not found" }, { status: 404 });
    } catch {
        return Response.json(
            { error: "Unable to delete follow-up" },
            { status: 500 },
        );
    }
}
