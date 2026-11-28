import {
    boolean,
    index,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { leads } from "./leads";

export const whatsappDirectionEnum = pgEnum("whatsapp_direction", [
    "inbound",
    "outbound",
]);
export const whatsappMessageStatusEnum = pgEnum("whatsapp_message_status", [
    "received",
    "queued",
    "sent",
    "delivered",
    "read",
    "failed",
]);

export const whatsappEvents = pgTable("whatsapp_events", {
    id: text("id").primaryKey(),
    leadId: uuid("lead_id").references(() => leads.id, {
        onDelete: "set null",
    }),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
}).enableRLS();

export const whatsappMessages = pgTable(
    "whatsapp_messages",
    {
        id: text("id").primaryKey(),
        leadId: uuid("lead_id")
            .notNull()
            .references(() => leads.id, { onDelete: "cascade" }),
        direction: whatsappDirectionEnum("direction").notNull(),
        status: whatsappMessageStatusEnum("status").notNull(),
        body: text("body").notNull(),
        error: text("error"),
        providerTimestamp: timestamp("provider_timestamp", {
            withTimezone: true,
        }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("whatsapp_messages_lead_idx").on(table.leadId, table.createdAt),
        index("whatsapp_messages_status_idx").on(table.status),
    ],
).enableRLS();

export const leadAutomation = pgTable("lead_automation", {
    leadId: uuid("lead_id")
        .primaryKey()
        .references(() => leads.id, { onDelete: "cascade" }),
    autoReplyEnabled: boolean("auto_reply_enabled").default(true).notNull(),
    handoffRequired: boolean("handoff_required").default(false).notNull(),
    summary: text("summary"),
    intent: text("intent"),
    sentiment: text("sentiment"),
    priority: text("priority"),
    missingDetails: jsonb("missing_details").$type<string[]>().default([]).notNull(),
    suggestedReply: text("suggested_reply"),
    extractedDetails: jsonb("extracted_details")
        .$type<{
            destination?: string;
            travelers?: number;
            budget?: number;
            travelDates?: string;
        }>()
        .default({})
        .notNull(),
    lastInboundAt: timestamp("last_inbound_at", { withTimezone: true }),
    lastOutboundAt: timestamp("last_outbound_at", { withTimezone: true }),
    summarizedAt: timestamp("summarized_at", { withTimezone: true }),
    lastViewedAt: timestamp("last_viewed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
}).enableRLS();

export const crmAutomationSettings = pgTable("crm_automation_settings", {
    id: text("id").primaryKey().default("default"),
    whatsappAutoReplyEnabled: boolean("whatsapp_auto_reply_enabled")
        .default(true)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
}).enableRLS();
