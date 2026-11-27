import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { followUps } from "@/db/schema/follow-ups";
import { leads } from "@/db/schema/leads";
import { followUpValues } from "@/lib/follow-up-values";
import { canAccess } from "@/lib/auth/authorization";

export async function GET() {
    if (!(await canAccess("follow-ups:manage")))
        return Response.json({ error: "Forbidden" }, { status: 403 });
    try {
        const rows = await db
            .select({
                id: followUps.id,
                leadId: followUps.leadId,
                leadName: leads.fullName,
                leadEmail: leads.email,
                title: followUps.title,
                scheduledAt: followUps.scheduledAt,
                status: followUps.status,
                channel: followUps.channel,
                priority: followUps.priority,
                notes: followUps.notes,
                outcome: followUps.outcome,
                completedAt: followUps.completedAt,
                createdAt: followUps.createdAt,
                updatedAt: followUps.updatedAt,
            })
            .from(followUps)
            .leftJoin(leads, eq(followUps.leadId, leads.id))
            .orderBy(asc(followUps.scheduledAt));
        return Response.json(rows);
    } catch (error) {
        console.error("GET follow-ups failed", error);
        return Response.json(
            { error: "Unable to load follow-ups" },
            { status: 500 },
        );
    }
}
export async function POST(request: Request) {
    if (!(await canAccess("follow-ups:manage")))
        return Response.json({ error: "Forbidden" }, { status: 403 });
    try {
        const [created] = await db
            .insert(followUps)
            .values(followUpValues(await request.json()))
            .returning();
        return Response.json(created, { status: 201 });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unable to create follow-up";
        return Response.json({ error: message }, { status: 400 });
    }
}
