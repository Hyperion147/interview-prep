import {
    date,
    index,
    integer,
    pgTable,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

export const chatbotDailyUsage = pgTable(
    "chatbot_daily_usage",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        identityKey: varchar("identity_key", { length: 180 }).notNull(),
        deviceId: uuid("device_id").notNull(),
        authUserId: uuid("auth_user_id"),
        usageDate: date("usage_date", { mode: "string" }).notNull(),
        requestCount: integer("request_count").default(0).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        uniqueIndex("chatbot_usage_identity_date_idx").on(
            table.identityKey,
            table.usageDate,
        ),
        index("chatbot_usage_device_idx").on(table.deviceId),
        index("chatbot_usage_user_idx").on(table.authUserId),
    ],
);
