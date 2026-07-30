import { pgTable, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vulnerabilitiesTable = pgTable("vulnerabilities", {
  id: text("id").primaryKey(),
  assetId: text("asset_id"),
  cveId: text("cve_id"),
  title: text("title").notNull(),
  description: text("description"),
  severity: text("severity").notNull(), // CRITICAL, HIGH, MEDIUM, LOW
  cvssScore: real("cvss_score"),
  cvssVector: text("cvss_vector"),
  status: text("status").notNull().default("open"), // open, in_progress, resolved
  remediation: text("remediation"),
  remediationDays: integer("remediation_days"),
  discoveredAt: timestamp("discovered_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export const insertVulnerabilitySchema = createInsertSchema(vulnerabilitiesTable).omit({ discoveredAt: true, updatedAt: true });
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;
export type Vulnerability = typeof vulnerabilitiesTable.$inferSelect;
