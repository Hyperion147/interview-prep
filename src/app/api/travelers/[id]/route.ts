import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
    travelerDocuments,
    travelerGroups,
    travelers,
} from "@/db/schema/travelers";
import { visaApplications } from "@/db/schema/visas";
import { canAccess } from "@/lib/auth/authorization";

export async function GET(
    _request: Request,
    context: { params: Promise<{ id: string }> },
) {
    if (!(await canAccess("leads:read")))
        return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    const [[group], members] = await Promise.all([
        db
            .select()
            .from(travelerGroups)
            .where(eq(travelerGroups.id, id))
            .limit(1),
        db
            .select()
            .from(travelers)
            .where(eq(travelers.groupId, id))
            .orderBy(asc(travelers.fullName)),
    ]);
    if (!group)
        return Response.json(
            { error: "Traveler group not found" },
            { status: 404 },
        );
    const memberIds = members.map((member) => member.id);
    const documents = memberIds.length
        ? await db
              .select()
              .from(travelerDocuments)
              .where(inArray(travelerDocuments.travelerId, memberIds))
        : [];
    const visas = await db
        .select()
        .from(visaApplications)
        .where(eq(visaApplications.email, group.customerEmail));
    return Response.json({ group, members, documents, visas });
}

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> },
) {
    if (!(await canAccess("leads:write")))
        return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    const body = await request.json();
    const statuses = ["prospect", "active", "completed", "cancelled"] as const;
    const update: Partial<typeof travelerGroups.$inferInsert> = {
        updatedAt: new Date(),
    };
    if (typeof body.name === "string" && body.name.trim())
        update.name = body.name.trim().slice(0, 180);
    if (typeof body.status === "string" && statuses.includes(body.status))
        update.status = body.status;
    if (body.emergencyContact && typeof body.emergencyContact === "object")
        update.emergencyContact = body.emergencyContact;
    const [group] = await db
        .update(travelerGroups)
        .set(update)
        .where(eq(travelerGroups.id, id))
        .returning();
    return group
        ? Response.json(group)
        : Response.json({ error: "Traveler group not found" }, { status: 404 });
}
