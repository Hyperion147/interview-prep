import { desc } from "drizzle-orm";
import { db } from "@/db";
import { visaApplications } from "@/db/schema/visas";

export async function GET() {
  return Response.json(await db.select().from(visaApplications).orderBy(desc(visaApplications.createdAt)));
}

export async function POST(request: Request) {
  const body = await request.json();
  const [created] = await db.insert(visaApplications).values({
    ...body,
    applicationValue: String(body.applicationValue ?? 0),
    submittedAt: body.submittedAt ? new Date(body.submittedAt) : null,
  }).returning();
  return Response.json(created, { status: 201 });
}
