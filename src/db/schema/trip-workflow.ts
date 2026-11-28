import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { leads } from "./leads";

export const tripWorkflow = pgTable("trip_workflow", {
    leadId: uuid("lead_id")
        .primaryKey()
        .references(() => leads.id, { onDelete: "cascade" }),
    customerEmail: text("customer_email").notNull(),
    itinerary: text("itinerary").notNull(),
    total: integer("total").notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    stage: text("stage", {
        enum: ["proposed", "accepted", "booked", "paid"],
    }).notNull(),
    reminderId: uuid("reminder_id"),
}).enableRLS();
