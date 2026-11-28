import {
    index,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { leads } from "./leads";

export const followUpStatusEnum = pgEnum("follow_up_status", [
    "scheduled",
    "completed",
    "cancelled",
    "missed",
]);
export const followUpChannelEnum = pgEnum("follow_up_channel", [
    "call",
    "email",
    "whatsapp",
    "meeting",
]);
export const followUpPriorityEnum = pgEnum("follow_up_priority", [
    "low",
    "medium",
    "high",
]);

export const followUps = pgTable(
    "follow_ups",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        leadId: uuid("lead_id").references(() => leads.id, {
            onDelete: "set null",
        }),
        title: text("title").notNull(),
        scheduledAt: timestamp("scheduled_at", {
            withTimezone: true,
        }).notNull(),
        status: followUpStatusEnum("status").default("scheduled").notNull(),
        channel: followUpChannelEnum("channel").default("call").notNull(),
        priority: followUpPriorityEnum("priority").default("medium").notNull(),
        notes: text("notes"),
        outcome: text("outcome"),
        completedAt: timestamp("completed_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("follow_ups_lead_idx").on(table.leadId),
        index("follow_ups_scheduled_idx").on(table.scheduledAt),
        index("follow_ups_status_idx").on(table.status),
    ],
);

export type FollowUpRow = typeof followUps.$inferSelect;
export type NewFollowUpRow = typeof followUps.$inferInsert;
