import {
    index,
    integer,
    numeric,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

export const leadStatusEnum = pgEnum("lead_status", [
    "new",
    "contacted",
    "qualified",
    "proposal_sent",
    "won",
    "lost",
]);

export const leadSourceEnum = pgEnum("lead_source", [
    "website",
    "referral",
    "social_media",
    "walk_in",
    "phone",
    "other",
]);

export const leads = pgTable(
    "leads",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        fullName: varchar("full_name", { length: 160 }).notNull(),
        email: varchar("email", { length: 254 }).notNull(),
        phone: varchar("phone", { length: 30 }).notNull(),
        destination: varchar("destination", { length: 120 }).notNull(),
        status: leadStatusEnum("status").default("new").notNull(),
        source: leadSourceEnum("source").default("website").notNull(),
        travelers: integer("travelers").default(1).notNull(),
        estimatedValue: numeric("estimated_value", { precision: 12, scale: 2 })
            .default("0")
            .notNull(),
        notes: text("notes"),
        nextFollowUpAt: timestamp("next_follow_up_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("leads_status_idx").on(table.status),
        index("leads_email_idx").on(table.email),
        index("leads_created_at_idx").on(table.createdAt),
        index("leads_follow_up_idx").on(table.nextFollowUpAt),
    ],
);

export type LeadRow = typeof leads.$inferSelect;
export type NewLeadRow = typeof leads.$inferInsert;
