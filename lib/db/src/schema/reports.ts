import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reportsTable = pgTable("reports", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // security_assessment, compliance, executive, threat_intel, incident
  generatedBy: text("generated_by"),
  data: jsonb("data").$type<Record<string, unknown>>(),
  filePath: text("file_path"),
  format: text("format").default("json"), // json, pdf, csv
  status: text("status").notNull().default("generating"), // generating, ready, failed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({ createdAt: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
