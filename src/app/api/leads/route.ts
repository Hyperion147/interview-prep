import { desc } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema/leads";
import { canAccess } from "@/lib/auth/authorization";

export async function GET() {
    if (!(await canAccess("leads:read")))
        return Response.json({ error: "Forbidden" }, { status: 403 });
    const rows = await db.select().from(leads).orderBy(desc(leads.createdAt));
    return Response.json(rows);
}

export async function POST(request: Request) {
    if (!(await canAccess("leads:write")))
        return Response.json({ error: "Forbidden" }, { status: 403 });
    const body = await request.json();
    try {
        const [created] = await db
            .insert(leads)
            .values({
                fullName: body.fullName,
                email: body.email,
                phone: body.phone,
                destination: body.destination,
                status: body.status ?? "new",
                source: body.source ?? "website",
                travelers: Number(body.travelers ?? 1),
                estimatedValue: String(body.estimatedValue ?? 0),
                notes: body.notes ? body.notes : null,
                nextFollowUpAt: body.nextFollowUpAt
                    ? new Date(body.nextFollowUpAt)
                    : null,
            })
            .returning();
        return Response.json(created, { status: 201 });
    } catch (error) {
        console.error("Failed to create lead:", error);
        return Response.json(
            { error: "Failed to create lead" },
            { status: 400 },
        );
    }
}
