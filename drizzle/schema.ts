import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  boolean,
  mysqlEnum,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "manager", "viewer"])
    .default("user")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Service requests — tracks client service requests.
 * (Simplified for assessment purposes.)
 */
export const serviceRequests = mysqlTable("service_requests", {
  id: int("id").autoincrement().primaryKey(),
  clientName: varchar("clientName", { length: 200 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"])
    .default("open")
    .notNull(),
  assignedTo: int("assignedTo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = typeof serviceRequests.$inferInsert;

/**
 * Service request notes — internal notes for service requests.
 * These notes are admin-only and never visible to clients.
 */
export const serviceRequestNotes = mysqlTable("service_request_notes", {
  id: int("id").autoincrement().primaryKey(),
  serviceRequestId: int("serviceRequestId").notNull(),
  authorId: int("authorId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ServiceRequestNote = typeof serviceRequestNotes.$inferSelect;
export type InsertServiceRequestNote = typeof serviceRequestNotes.$inferInsert;
