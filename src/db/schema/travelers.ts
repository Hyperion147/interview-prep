import { boolean, date, index, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { agents } from "./auth";
import { leads } from "./leads";
import { visaApplications } from "./visas";

export const travelerGroupStatusEnum = pgEnum("traveler_group_status", ["prospect", "active", "completed", "cancelled"]);
export const travelerDocumentStatusEnum = pgEnum("traveler_document_status", ["requested", "uploaded", "approved", "rejected", "expired"]);
export const visaChecklistStatusEnum = pgEnum("visa_checklist_status", ["missing", "uploaded", "under_review", "approved", "rejected", "not_required"]);

export const travelerGroups = pgTable("traveler_groups", {
    id: uuid("id").defaultRandom().primaryKey(),
    leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
    name: varchar("name", { length: 180 }).notNull(),
    customerEmail: varchar("customer_email", { length: 254 }).notNull(),
    status: travelerGroupStatusEnum("status").default("prospect").notNull(),
    assignedAgentId: uuid("assigned_agent_id").references(() => agents.id, { onDelete: "set null" }),
    emergencyContact: jsonb("emergency_contact").$type<{ name?: string; phone?: string; relationship?: string }>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [index("traveler_groups_email_idx").on(table.customerEmail), index("traveler_groups_lead_idx").on(table.leadId)]).enableRLS();

export const travelers = pgTable("travelers", {
    id: uuid("id").defaultRandom().primaryKey(),
    groupId: uuid("group_id").notNull().references(() => travelerGroups.id, { onDelete: "cascade" }),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    email: varchar("email", { length: 254 }),
    phone: varchar("phone", { length: 30 }),
    relationship: varchar("relationship", { length: 60 }).default("traveler").notNull(),
    dateOfBirth: date("date_of_birth", { mode: "string" }),
    nationality: varchar("nationality", { length: 100 }),
    passportLast4: varchar("passport_last4", { length: 4 }),
    passportCountry: varchar("passport_country", { length: 100 }),
    passportExpiry: date("passport_expiry", { mode: "string" }),
    preferences: jsonb("preferences").$type<{ dietary?: string[]; accessibility?: string[]; hotel?: string; airline?: string; seat?: string }>().default({}).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [index("travelers_group_idx").on(table.groupId)]).enableRLS();

export const travelerDocuments = pgTable("traveler_documents", {
    id: uuid("id").defaultRandom().primaryKey(),
    travelerId: uuid("traveler_id").notNull().references(() => travelers.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 100 }).notNull(),
    label: varchar("label", { length: 180 }).notNull(),
    status: travelerDocumentStatusEnum("status").default("requested").notNull(),
    storagePath: text("storage_path"),
    expiresAt: date("expires_at", { mode: "string" }),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [index("traveler_documents_traveler_idx").on(table.travelerId)]).enableRLS();

export const visaChecklistItems = pgTable("visa_checklist_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    visaApplicationId: uuid("visa_application_id").notNull().references(() => visaApplications.id, { onDelete: "cascade" }),
    travelerId: uuid("traveler_id").references(() => travelers.id, { onDelete: "set null" }),
    label: varchar("label", { length: 180 }).notNull(),
    required: boolean("required").default(true).notNull(),
    status: visaChecklistStatusEnum("status").default("missing").notNull(),
    storagePath: text("storage_path"),
    rejectionReason: text("rejection_reason"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [index("visa_checklist_application_idx").on(table.visaApplicationId)]).enableRLS();
