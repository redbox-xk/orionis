import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const incidentsTable = pgTable("incidents", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  severity: text("severity").notNull(), // CRITICAL, HIGH, MEDIUM, LOW
  status: text("status").notNull().default("open"), // open, in_progress, resolved, closed
  category: text("category"),
  affectedAssets: jsonb("affected_assets").$type<string[]>().default([]),
  assignedTo: text("assigned_to"),
  aiAnalysis: jsonb("ai_analysis").$type<Record<string, unknown>>(),
  responsePlan: text("response_plan"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export const insertIncidentSchema = createInsertSchema(incidentsTable).omit({ createdAt: true, updatedAt: true });
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidentsTable.$inferSelect;
