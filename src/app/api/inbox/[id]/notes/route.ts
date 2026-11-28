import { db } from "@/db";
import { leadActivities } from "@/db/schema/whatsapp";
import { canAccess } from "@/lib/auth/authorization";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    if (!(await canAccess("leads:write"))) return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    const body = await request.json().catch(() => null) as { note?: unknown } | null;
    const note = typeof body?.note === "string" ? body.note.trim() : "";
    if (!note || note.length > 2000) return Response.json({ error: "Enter a note up to 2,000 characters" }, { status: 400 });
    const [created] = await db.insert(leadActivities).values({ leadId: id, kind: "note", body: note }).returning();
    return Response.json(created, { status: 201 });
}
