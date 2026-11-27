import { eq } from "drizzle-orm";
import { db } from "@/db";
import { travelPackages } from "@/db/schema/packages";
import { canAccess } from "@/lib/auth/authorization";

const categories = ["domestic", "international"] as const;
const statuses = ["draft", "active", "inactive"] as const;

function updateValues(body: Record<string, unknown>) {
    const category = String(body.category) as (typeof categories)[number];
    const status = String(body.status) as (typeof statuses)[number];
    const durationDays = Number(body.durationDays);
    const durationNights = Number(body.durationNights);
    const price = Number(body.price);
    const rating = Number(body.rating ?? 4.5);
    if (!categories.includes(category) || !statuses.includes(status))
        throw new Error("Invalid category or status");
    if (
        [body.name, body.country, body.state, body.city, body.description].some(
            (value) => !String(value ?? "").trim(),
        )
    )
        throw new Error("All package fields are required");
    if (
        !Number.isFinite(price) ||
        price < 0 ||
        durationDays < 1 ||
        durationNights < 0 ||
        rating < 0 ||
        rating > 5
    )
        throw new Error("Invalid price or duration");
    return {
        name: String(body.name).trim(),
        category,
        country: String(body.country).trim(),
        state: String(body.state).trim(),
        city: String(body.city).trim(),
        description: String(body.description).trim(),
        region: String(body.region ?? "India").trim(),
        locationLabel: String(
            body.locationLabel ?? `${String(body.city)}, ${String(body.state)}`,
        ).trim(),
        imageUrl: String(
            body.imageUrl ??
                "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1200",
        ).trim(),
        hotel: String(body.hotel ?? "Premium accommodation").trim(),
        rating: String(rating),
        features: Array.isArray(body.features)
            ? body.features
                  .map(String)
                  .map((value) => value.trim())
                  .filter(Boolean)
            : [],
        durationDays,
        durationNights,
        price: String(price),
        status,
        updatedAt: new Date(),
    };
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    if (!(await canAccess("packages:manage")))
        return Response.json({ error: "Forbidden" }, { status: 403 });
    try {
        const { id } = await params;
        const [updated] = await db
            .update(travelPackages)
            .set(updateValues(await request.json()))
            .where(eq(travelPackages.id, id))
            .returning();
        return updated
            ? Response.json(updated)
            : Response.json({ error: "Package not found" }, { status: 404 });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unable to update package";
        console.error("PATCH /api/packages failed", error);
        return Response.json({ error: message }, { status: 400 });
    }
}
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    if (!(await canAccess("packages:manage")))
        return Response.json({ error: "Forbidden" }, { status: 403 });
    try {
        const { id } = await params;
        const [deleted] = await db
            .delete(travelPackages)
            .where(eq(travelPackages.id, id))
            .returning({ id: travelPackages.id });
        return deleted
            ? Response.json(deleted)
            : Response.json({ error: "Package not found" }, { status: 404 });
    } catch (error) {
        console.error("DELETE /api/packages failed", error);
        return Response.json(
            { error: "Unable to delete package" },
            { status: 500 },
        );
    }
}
