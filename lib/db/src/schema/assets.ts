import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const assetsTable = pgTable("assets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // server, endpoint, cloud, network, database
  ipAddresses: jsonb("ip_addresses").$type<string[]>().default([]),
  hostname: text("hostname"),
  os: text("os"),
  version: text("version"),
  criticality: integer("criticality").notNull().default(3),
  ownerId: text("owner_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  discoveredAt: timestamp("discovered_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeen: timestamp("last_seen", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("active"),
});

export const insertAssetSchema = createInsertSchema(assetsTable).omit({ discoveredAt: true, lastSeen: true });
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assetsTable.$inferSelect;
