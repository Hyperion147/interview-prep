import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { leads } from "./leads";

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
