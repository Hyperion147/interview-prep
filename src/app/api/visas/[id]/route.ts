import { eq } from "drizzle-orm";
import { db } from "@/db";
import { visaApplications } from "@/db/schema/visas";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [application] = await db.select().from(visaApplications).where(eq(visaApplications.id, id)).limit(1);
  return application ? Response.json(application) : Response.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const [updated] = await db.update(visaApplications).set({ ...body, applicationValue: String(body.applicationValue ?? 0), submittedAt: body.submittedAt ? new Date(body.submittedAt) : null, updatedAt: new Date() }).where(eq(visaApplications.id, id)).returning();
  return updated ? Response.json(updated) : Response.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [deleted] = await db.delete(visaApplications).where(eq(visaApplications.id, id)).returning({ id: visaApplications.id });
  return deleted ? Response.json(deleted) : Response.json({ error: "Not found" }, { status: 404 });
}
