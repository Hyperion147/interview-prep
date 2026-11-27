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
  try {
    const [updated] = await db.update(visaApplications).set({
      applicantName: body.applicantName,
      email: body.email,
      phone: body.phone,
      passportNumber: body.passportNumber,
      destinationCountry: body.destinationCountry,
      visaType: body.visaType,
      status: body.status,
      documentStatus: body.documentStatus,
      progress: Number(body.progress ?? 0),
      applicationValue: String(body.applicationValue ?? 0),
      notes: body.notes ? body.notes : null,
      submittedAt: body.submittedAt ? new Date(body.submittedAt) : null,
      updatedAt: new Date(),
    }).where(eq(visaApplications.id, id)).returning();
    return updated ? Response.json(updated) : Response.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    console.error("Failed to update visa application:", error);
    return Response.json({ error: "Failed to update visa application" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [deleted] = await db.delete(visaApplications).where(eq(visaApplications.id, id)).returning({ id: visaApplications.id });
  return deleted ? Response.json(deleted) : Response.json({ error: "Not found" }, { status: 404 });
}
