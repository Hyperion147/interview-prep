import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { travelerDocuments, travelers } from "@/db/schema/travelers";
import { canAccess } from "@/lib/auth/authorization";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    if (!(await canAccess("leads:write"))) return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    const body = await request.json();
    const [traveler] = await db.select({ id: travelers.id }).from(travelers).where(and(eq(travelers.id, body.travelerId), eq(travelers.groupId, id))).limit(1);
    if (!traveler) return Response.json({ error: "Traveler not found" }, { status: 404 });
    const label = String(body.label ?? "").trim();
    if (!label) return Response.json({ error: "Document label is required" }, { status: 400 });
    const [document] = await db.insert(travelerDocuments).values({ travelerId: traveler.id, label: label.slice(0,180), type: String(body.type ?? "other").slice(0,100) }).returning();
    return Response.json(document, { status: 201 });
}
