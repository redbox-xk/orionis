import { pgTable, text, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const complianceControlsTable = pgTable("compliance_controls", {
  id: text("id").primaryKey(),
  framework: text("framework").notNull(), // SOC2, ISO27001, NIST, CIS, PCI
  controlId: text("control_id").notNull(),
  description: text("description"),
  requirements: jsonb("requirements").$type<Record<string, unknown>>(),
  status: text("status").notNull().default("not_started"), // not_started, in_progress, compliant, non_compliant
  evidence: jsonb("evidence").$type<Record<string, unknown>>(),
  lastAssessed: timestamp("last_assessed", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const complianceFrameworksTable = pgTable("compliance_frameworks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  score: real("score").notNull().default(0),
  status: text("status").notNull().default("not_started"),
  totalControls: text("total_controls").notNull().default("0"),
  compliantControls: text("compliant_controls").notNull().default("0"),
  lastAssessed: timestamp("last_assessed", { withTimezone: true }),
});

export const insertComplianceControlSchema = createInsertSchema(complianceControlsTable).omit({ createdAt: true });
export type InsertComplianceControl = z.infer<typeof insertComplianceControlSchema>;
export type ComplianceControl = typeof complianceControlsTable.$inferSelect;
export type ComplianceFramework = typeof complianceFrameworksTable.$inferSelect;
