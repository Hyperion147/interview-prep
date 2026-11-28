import { db } from "@/db";
import { travelers } from "@/db/schema/travelers";
import { canAccess } from "@/lib/auth/authorization";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    if (!(await canAccess("leads:write"))) return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    const body = await request.json();
    const fullName = String(body.fullName ?? "").trim();
    if (!fullName) return Response.json({ error: "Traveler name is required" }, { status: 400 });
    const [traveler] = await db.insert(travelers).values({
        groupId: id, fullName: fullName.slice(0, 160),
        email: String(body.email ?? "").trim().toLowerCase().slice(0, 254) || null,
        phone: String(body.phone ?? "").trim().slice(0, 30) || null,
        relationship: String(body.relationship ?? "traveler").trim().slice(0, 60) || "traveler",
        nationality: String(body.nationality ?? "").trim().slice(0, 100) || null,
        passportLast4: String(body.passportLast4 ?? "").replace(/\s/g, "").slice(-4) || null,
        passportCountry: String(body.passportCountry ?? "").trim().slice(0, 100) || null,
        passportExpiry: body.passportExpiry || null,
        preferences: body.preferences ?? {},
    }).returning();
    return Response.json(traveler, { status: 201 });
}
