import { pgTable, text, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aiInteractionsTable = pgTable("ai_interactions", {
  id: text("id").primaryKey(),
  agentType: text("agent_type").notNull(), // ciso, analyst, hunter, engineer, compliance, responder
  sessionId: text("session_id"),
  input: text("input").notNull(),
  output: text("output").notNull(),
  reasoning: text("reasoning"),
  confidence: real("confidence"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAiInteractionSchema = createInsertSchema(aiInteractionsTable).omit({ createdAt: true });
export type InsertAiInteraction = z.infer<typeof insertAiInteractionSchema>;
export type AiInteraction = typeof aiInteractionsTable.$inferSelect;
