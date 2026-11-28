import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema/leads";
import { travelerGroups, travelers } from "@/db/schema/travelers";
import { canAccess } from "@/lib/auth/authorization";

export async function GET() {
    if (!(await canAccess("leads:read"))) return Response.json({ error: "Forbidden" }, { status: 403 });
    const rows = await db.select({
        id: travelerGroups.id, name: travelerGroups.name, customerEmail: travelerGroups.customerEmail,
        status: travelerGroups.status, leadId: travelerGroups.leadId, destination: leads.destination,
        memberCount: sql<number>`(select count(*)::int from travelers where group_id=${travelerGroups.id})`,
        missingDocuments: sql<number>`(select count(*)::int from traveler_documents d join travelers t on t.id=d.traveler_id where t.group_id=${travelerGroups.id} and d.status in ('requested','rejected','expired'))`,
    }).from(travelerGroups).leftJoin(leads, eq(leads.id, travelerGroups.leadId)).orderBy(asc(travelerGroups.name));
    return Response.json(rows);
}

export async function POST(request: Request) {
    if (!(await canAccess("leads:write"))) return Response.json({ error: "Forbidden" }, { status: 403 });
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const customerEmail = String(body.customerEmail ?? "").trim().toLowerCase();
    const primaryName = String(body.primaryName ?? name).trim();
    if (!name || !primaryName || !customerEmail.includes("@")) {
        return Response.json({ error: "Name, primary traveler and a valid email are required" }, { status: 400 });
    }
    const result = await db.transaction(async (tx) => {
        const [group] = await tx.insert(travelerGroups).values({
            name: name.slice(0, 180), customerEmail: customerEmail.slice(0, 254),
            leadId: typeof body.leadId === "string" && body.leadId ? body.leadId : null,
            emergencyContact: body.emergencyContact ?? {},
        }).returning();
        await tx.insert(travelers).values({
            groupId: group.id, fullName: primaryName.slice(0, 160), email: customerEmail,
            phone: String(body.phone ?? "").slice(0, 30) || null, relationship: "primary", isPrimary: true,
        });
        return group;
    });
    return Response.json(result, { status: 201 });
}
