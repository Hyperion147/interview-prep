const categories = ["domestic", "international"] as const;
const statuses = ["draft", "active", "inactive"] as const;

function isOneOf<T extends string>(
    values: readonly T[],
    value: string,
): value is T {
    return values.includes(value as T);
}

function requiredString(
    body: Record<string, unknown>,
    key: string,
    label: string,
) {
    const value = body[key];
    if (typeof value !== "string" || !value.trim()) {
        throw new Error(`${label} is required`);
    }
    return value.trim();
}

export function parsePackageInput(value: unknown) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Invalid package payload");
    }

    const body = value as Record<string, unknown>;
    const category = requiredString(body, "category", "Category");
    const status = requiredString(body, "status", "Status");
    if (!isOneOf(categories, category)) {
        throw new Error("Invalid package category");
    }
    if (!isOneOf(statuses, status)) {
        throw new Error("Invalid package status");
    }

    const durationDays = Number(body.durationDays);
    const durationNights = Number(body.durationNights);
    const price = Number(body.price);
    const rating = Number(body.rating);
    if (
        !Number.isInteger(durationDays) ||
        durationDays < 1 ||
        !Number.isInteger(durationNights) ||
        durationNights < 0
    ) {
        throw new Error("Duration must contain valid whole numbers");
    }
    if (!Number.isFinite(price) || price < 0) {
        throw new Error("Price must be a valid positive amount");
    }
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
        throw new Error("Rating must be between 0 and 5");
    }

    const imageUrl = requiredString(body, "imageUrl", "Cover image URL");
    try {
        const url = new URL(imageUrl);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
            throw new Error();
        }
    } catch {
        throw new Error("Cover image must be a valid HTTP URL");
    }

    const features = Array.isArray(body.features)
        ? body.features
              .filter(
                  (feature): feature is string => typeof feature === "string",
              )
              .map((feature) => feature.trim())
              .filter(Boolean)
        : [];

    return {
        name: requiredString(body, "name", "Package name"),
        category,
        country: requiredString(body, "country", "Country"),
        state: requiredString(body, "state", "State or province"),
        city: requiredString(body, "city", "City"),
        description: requiredString(body, "description", "Description"),
        region: requiredString(body, "region", "Display region"),
        locationLabel: requiredString(body, "locationLabel", "Location label"),
        imageUrl,
        hotel: requiredString(body, "hotel", "Hotel or accommodation"),
        rating: String(rating),
        features,
        durationDays,
        durationNights,
        price: String(price),
        status,
    };
}
