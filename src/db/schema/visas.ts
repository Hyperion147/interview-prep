import { index, integer, numeric, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const visaStatusEnum = pgEnum("visa_status", ["draft", "processed", "published"]);
export const documentStatusEnum = pgEnum("document_status", ["pending", "partial", "submitted", "verified"]);

export const visaApplications = pgTable("visa_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  applicantName: varchar("applicant_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  passportNumber: varchar("passport_number", { length: 40 }).notNull(),
  destinationCountry: varchar("destination_country", { length: 120 }).notNull(),
  visaType: varchar("visa_type", { length: 100 }).notNull(),
  status: visaStatusEnum("status").default("draft").notNull(),
  documentStatus: documentStatusEnum("document_status").default("pending").notNull(),
  progress: integer("progress").default(0).notNull(),
  applicationValue: numeric("application_value", { precision: 12, scale: 2 }).default("0").notNull(),
  notes: text("notes"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("visa_status_idx").on(table.status),
  index("visa_document_status_idx").on(table.documentStatus),
  index("visa_passport_idx").on(table.passportNumber),
  index("visa_created_at_idx").on(table.createdAt),
]);

export type VisaApplicationRow = typeof visaApplications.$inferSelect;
export type NewVisaApplicationRow = typeof visaApplications.$inferInsert;
