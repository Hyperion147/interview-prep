import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { visaChecklistItems } from "@/db/schema/travelers";
import { visaApplications } from "@/db/schema/visas";
import { canAccess } from "@/lib/auth/authorization";

type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
    if (!(await canAccess("visas:manage"))) return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    return Response.json(await db.select().from(visaChecklistItems).where(eq(visaChecklistItems.visaApplicationId, id)).orderBy(asc(visaChecklistItems.createdAt)));
}
export async function POST(request: Request, context: Context) {
    if (!(await canAccess("visas:manage"))) return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params; const body = await request.json(); const label = String(body.label ?? "").trim();
    if (!label || label.length > 180) return Response.json({ error: "Enter a checklist label" }, { status: 400 });
    const [item] = await db.insert(visaChecklistItems).values({ visaApplicationId: id, label, required: body.required !== false, dueAt: body.dueAt ? new Date(body.dueAt) : null }).returning();
    return Response.json(item, { status: 201 });
}
export async function PATCH(request: Request, context: Context) {
    if (!(await canAccess("visas:manage"))) return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params; const body = await request.json();
    if (typeof body.itemId !== "string") return Response.json({ error: "Invalid item" }, { status: 400 });
    const statuses = ["missing","uploaded","under_review","approved","rejected","not_required"];
    if (!statuses.includes(body.status)) return Response.json({ error: "Invalid status" }, { status: 400 });
    const [item] = await db.update(visaChecklistItems).set({ status: body.status, rejectionReason: body.status === "rejected" ? String(body.rejectionReason ?? "Action required").slice(0,1000) : null, reviewedAt: ["approved","rejected"].includes(body.status) ? new Date() : null, updatedAt: new Date() }).where(and(eq(visaChecklistItems.id, body.itemId), eq(visaChecklistItems.visaApplicationId, id))).returning();
    if (!item) return Response.json({ error: "Not found" }, { status: 404 });
    const [counts] = await db.select({
        total: sql<number>`count(*) filter (where ${visaChecklistItems.required} and ${visaChecklistItems.status} <> 'not_required')::int`,
        approved: sql<number>`count(*) filter (where ${visaChecklistItems.required} and ${visaChecklistItems.status} = 'approved')::int`,
        ready: sql<number>`count(*) filter (where ${visaChecklistItems.required} and ${visaChecklistItems.status} in ('uploaded','under_review','approved'))::int`,
    }).from(visaChecklistItems).where(eq(visaChecklistItems.visaApplicationId, id));
    const progress = counts.total ? Math.round((counts.approved / counts.total) * 100) : 0;
    const documentStatus = counts.total > 0 && counts.approved === counts.total ? "verified" : counts.ready > 0 ? "partial" : "pending";
    await db.update(visaApplications).set({ progress, documentStatus, updatedAt: new Date() }).where(eq(visaApplications.id, id));
    return Response.json(item);
}
