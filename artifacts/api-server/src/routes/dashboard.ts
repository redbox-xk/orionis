import { Router } from "express";
import { db } from "@workspace/db";
import {
  assetsTable, vulnerabilitiesTable, threatsTable, incidentsTable,
  auditLogsTable
} from "@workspace/db/schema";
import { sql, count, eq } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (_req, res) => {
  const [assetCount] = await db.select({ c: count() }).from(assetsTable);
  const [vulnCounts] = await db.select({
    critical: sql<number>`count(*) filter (where severity = 'CRITICAL')`,
    high: sql<number>`count(*) filter (where severity = 'HIGH')`,
    medium: sql<number>`count(*) filter (where severity = 'MEDIUM')`,
    low: sql<number>`count(*) filter (where severity = 'LOW')`,
    total: count(),
  }).from(vulnerabilitiesTable);
  const [threatCounts] = await db.select({
    active: sql<number>`count(*) filter (where status = 'active')`,
    investigating: sql<number>`count(*) filter (where status = 'investigating')`,
    resolved: sql<number>`count(*) filter (where status = 'resolved')`,
  }).from(threatsTable);
  const [incidentCounts] = await db.select({
    open: sql<number>`count(*) filter (where status = 'open')`,
    inProgress: sql<number>`count(*) filter (where status = 'in_progress')`,
    closed: sql<number>`count(*) filter (where status = 'closed')`,
  }).from(incidentsTable);

  // Security score: simple heuristic
  const criticals = Number(vulnCounts.critical) || 0;
  const highs = Number(vulnCounts.high) || 0;
  const score = Math.max(20, Math.min(99, 100 - criticals * 5 - highs * 2));

  res.json({
    securityScore: score,
    assetsTotal: Number(assetCount.c),
    vulnerabilities: {
      critical: Number(vulnCounts.critical),
      high: Number(vulnCounts.high),
      medium: Number(vulnCounts.medium),
      low: Number(vulnCounts.low),
      total: Number(vulnCounts.total),
    },
    threats: {
      active: Number(threatCounts.active),
      investigating: Number(threatCounts.investigating),
      resolved: Number(threatCounts.resolved),
    },
    incidents: {
      open: Number(incidentCounts.open),
      inProgress: Number(incidentCounts.inProgress),
      closed: Number(incidentCounts.closed),
    },
    complianceAverage: 76.4,
    meanTimeToDetect: "4h 12m",
    meanTimeToRespond: "18h 37m",
  });
});

router.get("/dashboard/activity", async (_req, res) => {
  const logs = await db
    .select()
    .from(auditLogsTable)
    .orderBy(sql`created_at desc`)
    .limit(20);

  const items = logs.map((l) => ({
    id: l.id,
    type: l.resourceType || "system",
    title: l.action,
    severity: l.success ? "LOW" : "HIGH",
    timestamp: l.createdAt.toISOString(),
    resourceId: l.resourceId,
  }));

  res.json(items);
});

export default router;
