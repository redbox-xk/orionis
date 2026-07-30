import { Router } from "express";
import { db } from "@workspace/db";
import { vulnerabilitiesTable } from "@workspace/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

router.get("/vulnerabilities", async (req, res) => {
  const { severity, status, assetId } = req.query as Record<string, string>;

  let q = db.select().from(vulnerabilitiesTable).$dynamic();
  if (severity) q = q.where(eq(vulnerabilitiesTable.severity, severity)) as typeof q;
  if (status) q = q.where(eq(vulnerabilitiesTable.status, status)) as typeof q;
  if (assetId) q = q.where(eq(vulnerabilitiesTable.assetId, assetId)) as typeof q;

  const rows = await q.orderBy(sql`discovered_at desc`);
  res.json(rows);
});

router.post("/vulnerabilities", async (req, res) => {
  const { assetId, cveId, title, description, severity, cvssScore, cvssVector, status, remediation, remediationDays } = req.body;
  if (!title || !severity) return res.status(400).json({ message: "title and severity are required" });

  const row = await db.insert(vulnerabilitiesTable).values({
    id: randomUUID(),
    assetId, cveId, title, description,
    severity, cvssScore, cvssVector,
    status: status || "open",
    remediation, remediationDays,
  }).returning();

  res.status(201).json(row[0]);
});

router.get("/vulnerabilities/stats", async (_req, res) => {
  const [counts] = await db.select({
    critical: sql<number>`count(*) filter (where severity = 'CRITICAL')`,
    high: sql<number>`count(*) filter (where severity = 'HIGH')`,
    medium: sql<number>`count(*) filter (where severity = 'MEDIUM')`,
    low: sql<number>`count(*) filter (where severity = 'LOW')`,
    open: sql<number>`count(*) filter (where status = 'open')`,
    inProgress: sql<number>`count(*) filter (where status = 'in_progress')`,
    resolved: sql<number>`count(*) filter (where status = 'resolved')`,
    total: count(),
  }).from(vulnerabilitiesTable);

  res.json({
    bySeverity: {
      critical: Number(counts.critical),
      high: Number(counts.high),
      medium: Number(counts.medium),
      low: Number(counts.low),
    },
    byStatus: {
      open: Number(counts.open),
      inProgress: Number(counts.inProgress),
      resolved: Number(counts.resolved),
    },
    total: Number(counts.total),
  });
});

router.get("/vulnerabilities/:id", async (req, res) => {
  const rows = await db.select().from(vulnerabilitiesTable).where(eq(vulnerabilitiesTable.id, req.params.id));
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
});

router.patch("/vulnerabilities/:id", async (req, res) => {
  const { status, remediation, remediationDays, cvssScore } = req.body;
  const rows = await db
    .update(vulnerabilitiesTable)
    .set({ status, remediation, remediationDays, cvssScore, updatedAt: new Date() })
    .where(eq(vulnerabilitiesTable.id, req.params.id))
    .returning();
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
});

export default router;
