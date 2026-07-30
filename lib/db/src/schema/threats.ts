import { pgTable, text, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const threatsTable = pgTable("threats", {
  id: text("id").primaryKey(),
  threatId: text("threat_id").notNull().unique(),
  type: text("type").notNull(),
  severity: text("severity").notNull(), // CRITICAL, HIGH, MEDIUM, LOW
  sourceIp: text("source_ip"),
  targetAssetId: text("target_asset_id"),
  description: text("description"),
  indicators: jsonb("indicators").$type<Record<string, unknown>>(),
  mitreTechniques: jsonb("mitre_techniques").$type<string[]>().default([]),
  score: real("score"),
  status: text("status").notNull().default("investigating"), // investigating, active, resolved
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export const insertThreatSchema = createInsertSchema(threatsTable).omit({ createdAt: true, updatedAt: true });
export type InsertThreat = z.infer<typeof insertThreatSchema>;
export type Threat = typeof threatsTable.$inferSelect;
