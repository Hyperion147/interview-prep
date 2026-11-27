import { desc } from "drizzle-orm";
import { db } from "@/db";
import { visaApplications } from "@/db/schema/visas";
import { canAccess } from "@/lib/auth/authorization";

export async function GET() {
    if (!(await canAccess("visas:manage")))
        return Response.json({ error: "Forbidden" }, { status: 403 });
    return Response.json(
        await db
            .select()
            .from(visaApplications)
            .orderBy(desc(visaApplications.createdAt)),
    );
}

export async function POST(request: Request) {
    if (!(await canAccess("visas:manage")))
        return Response.json({ error: "Forbidden" }, { status: 403 });
    const body = await request.json();
    const [created] = await db
        .insert(visaApplications)
        .values({
            ...body,
            applicationValue: String(body.applicationValue ?? 0),
            submittedAt: body.submittedAt ? new Date(body.submittedAt) : null,
        })
        .returning();
    return Response.json(created, { status: 201 });
}
