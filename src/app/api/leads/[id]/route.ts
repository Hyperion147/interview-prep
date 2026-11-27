import { eq } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema/leads";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.id, id))
    .limit(1);
  return lead
    ? Response.json(lead)
    : Response.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  try {
    const [updated] = await db
      .update(leads)
      .set({
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        destination: body.destination,
        status: body.status,
        source: body.source,
        travelers: Number(body.travelers ?? 1),
        estimatedValue: String(body.estimatedValue ?? 0),
        notes: body.notes ? body.notes : null,
        nextFollowUpAt: body.nextFollowUpAt
          ? new Date(body.nextFollowUpAt)
          : null,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, id))
      .returning();
    return updated
      ? Response.json(updated)
      : Response.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    console.error("Failed to update lead:", error);
    return Response.json({ error: "Failed to update lead" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [deleted] = await db
    .delete(leads)
    .where(eq(leads.id, id))
    .returning({ id: leads.id });
  return deleted
    ? Response.json(deleted)
    : Response.json({ error: "Not found" }, { status: 404 });
}
