import { Router } from "express";
import { db } from "@workspace/db";
import { threatsTable } from "@workspace/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

router.get("/threats", async (req, res) => {
  const { severity, status, type } = req.query as Record<string, string>;

  let q = db.select().from(threatsTable).$dynamic();
  if (severity) q = q.where(eq(threatsTable.severity, severity)) as typeof q;
  if (status) q = q.where(eq(threatsTable.status, status)) as typeof q;
  if (type) q = q.where(eq(threatsTable.type, type)) as typeof q;

  const rows = await q.orderBy(sql`created_at desc`);
  res.json(rows);
});

router.post("/threats", async (req, res) => {
  const { threatId, type, severity, sourceIp, targetAssetId, description, indicators, mitreTechniques, score, status } = req.body;
  if (!type || !severity) return res.status(400).json({ message: "type and severity are required" });

  const row = await db.insert(threatsTable).values({
    id: randomUUID(),
    threatId: threatId || `THR-${Date.now()}`,
    type, severity, sourceIp, targetAssetId, description,
    indicators, mitreTechniques: mitreTechniques || [],
    score, status: status || "investigating",
  }).returning();

  res.status(201).json(row[0]);
});

router.get("/threats/stats", async (_req, res) => {
  const [counts] = await db.select({
    critical: sql<number>`count(*) filter (where severity = 'CRITICAL')`,
    high: sql<number>`count(*) filter (where severity = 'HIGH')`,
    medium: sql<number>`count(*) filter (where severity = 'MEDIUM')`,
    low: sql<number>`count(*) filter (where severity = 'LOW')`,
    active: sql<number>`count(*) filter (where status = 'active')`,
    investigating: sql<number>`count(*) filter (where status = 'investigating')`,
    resolved: sql<number>`count(*) filter (where status = 'resolved')`,
    total: count(),
  }).from(threatsTable);

  res.json({
    bySeverity: {
      critical: Number(counts.critical),
      high: Number(counts.high),
      medium: Number(counts.medium),
      low: Number(counts.low),
    },
    byStatus: {
      active: Number(counts.active),
      investigating: Number(counts.investigating),
      resolved: Number(counts.resolved),
    },
    total: Number(counts.total),
  });
});

router.get("/threats/:id", async (req, res) => {
  const rows = await db.select().from(threatsTable).where(eq(threatsTable.id, req.params.id));
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
});

router.patch("/threats/:id", async (req, res) => {
  const { status, description } = req.body;
  const rows = await db
    .update(threatsTable)
    .set({ status, description, updatedAt: new Date() })
    .where(eq(threatsTable.id, req.params.id))
    .returning();
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
});

export default router;
