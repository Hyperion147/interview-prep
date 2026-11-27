import { boolean, index, jsonb, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const appRoleEnum = pgEnum("app_role", ["user", "admin", "agent"]);
export const accountStatusEnum = pgEnum("account_status", ["invited", "active", "suspended"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: varchar("email", { length: 254 }).notNull(),
  fullName: varchar("full_name", { length: 160 }),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  role: appRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [uniqueIndex("users_email_idx").on(table.email)]);

export const admins = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: uuid("auth_user_id").unique(),
  email: varchar("email", { length: 254 }).notNull(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  role: appRoleEnum("role").default("admin").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [uniqueIndex("admins_email_idx").on(table.email)]);

export const agents = pgTable("agents", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: uuid("auth_user_id").unique(),
  createdByAdminId: uuid("created_by_admin_id").references(() => admins.id, { onDelete: "set null" }),
  email: varchar("email", { length: 254 }).notNull(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  role: appRoleEnum("role").default("agent").notNull(),
  status: accountStatusEnum("status").default("invited").notNull(),
  permissions: jsonb("permissions").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [uniqueIndex("agents_email_idx").on(table.email), index("agents_status_idx").on(table.status)]);

export type AgentRow = typeof agents.$inferSelect;
export type NewAgentRow = typeof agents.$inferInsert;
