import {
    index,
    integer,
    jsonb,
    numeric,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

export const packageCategoryEnum = pgEnum("package_category", [
    "domestic",
    "international",
]);
export const packageStatusEnum = pgEnum("package_status", [
    "draft",
    "active",
    "inactive",
]);

export const travelPackages = pgTable(
    "travel_packages",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        name: varchar("name", { length: 180 }).notNull(),
        category: packageCategoryEnum("category").notNull(),
        country: varchar("country", { length: 120 }).notNull(),
        state: varchar("state", { length: 120 }).notNull(),
        city: varchar("city", { length: 120 }).notNull(),
        description: text("description").notNull(),
        region: varchar("region", { length: 120 }).default("India").notNull(),
        locationLabel: varchar("location_label", { length: 180 })
            .default("")
            .notNull(),
        imageUrl: varchar("image_url", { length: 600 })
            .default(
                "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1200",
            )
            .notNull(),
        hotel: varchar("hotel", { length: 180 })
            .default("Premium accommodation")
            .notNull(),
        rating: numeric("rating", { precision: 2, scale: 1 })
            .default("4.5")
            .notNull(),
        features: jsonb("features").$type<string[]>().default([]).notNull(),
        durationDays: integer("duration_days").notNull(),
        durationNights: integer("duration_nights").notNull(),
        price: numeric("price", { precision: 12, scale: 2 }).notNull(),
        status: packageStatusEnum("status").default("draft").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("packages_category_idx").on(table.category),
        index("packages_location_idx").on(
            table.country,
            table.state,
            table.city,
        ),
        index("packages_status_idx").on(table.status),
    ],
);

export type TravelPackageRow = typeof travelPackages.$inferSelect;
export type NewTravelPackageRow = typeof travelPackages.$inferInsert;
