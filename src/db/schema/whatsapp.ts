import {
    boolean,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { leads } from "./leads";
import { agents } from "./auth";

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
export const inboxStatusEnum = pgEnum("inbox_status", ["open", "done"]);
export const leadActivityKindEnum = pgEnum("lead_activity_kind", [
    "note",
    "ai_summary",
    "stage_change",
    "assignment",
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
    inboxStatus: inboxStatusEnum("inbox_status").default("open").notNull(),
    important: boolean("important").default(false).notNull(),
    assignedAgentId: uuid("assigned_agent_id").references(() => agents.id, {
        onDelete: "set null",
    }),
    leadScore: integer("lead_score").default(0).notNull(),
    scoreReasons: jsonb("score_reasons").$type<string[]>().default([]).notNull(),
    promptVersion: text("prompt_version"),
    model: text("model"),
    lastInboundAt: timestamp("last_inbound_at", { withTimezone: true }),
    lastOutboundAt: timestamp("last_outbound_at", { withTimezone: true }),
    summarizedAt: timestamp("summarized_at", { withTimezone: true }),
    lastViewedAt: timestamp("last_viewed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
}).enableRLS();

export const leadAiInsightHistory = pgTable(
    "lead_ai_insight_history",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
        summary: text("summary").notNull(),
        intent: text("intent").notNull(),
        sentiment: text("sentiment").notNull(),
        priority: text("priority").notNull(),
        missingDetails: jsonb("missing_details").$type<string[]>().default([]).notNull(),
        suggestedReply: text("suggested_reply").notNull(),
        editedReply: text("edited_reply"),
        extractedDetails: jsonb("extracted_details").$type<Record<string, unknown>>().default({}).notNull(),
        leadScore: integer("lead_score").default(0).notNull(),
        scoreReasons: jsonb("score_reasons").$type<string[]>().default([]).notNull(),
        model: text("model").notNull(),
        promptVersion: text("prompt_version").notNull(),
        acceptedAt: timestamp("accepted_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [index("lead_ai_history_lead_idx").on(table.leadId, table.createdAt)],
).enableRLS();

export const leadActivities = pgTable(
    "lead_activities",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
        kind: leadActivityKindEnum("kind").notNull(),
        body: text("body").notNull(),
        metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [index("lead_activities_lead_idx").on(table.leadId, table.createdAt)],
).enableRLS();

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
