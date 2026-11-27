import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { travelPackages } from "@/db/schema/packages";

export async function GET() {
    try {
        const rows = await db
            .select()
            .from(travelPackages)
            .where(eq(travelPackages.status, "active"))
            .orderBy(asc(travelPackages.name));
        return Response.json(rows, {
            headers: {
                "Cache-Control":
                    "public, max-age=60, stale-while-revalidate=300",
            },
        });
    } catch (error) {
        console.error("GET public packages failed", error);
        return Response.json(
            { error: "Unable to load packages" },
            { status: 500 },
        );
    }
}
