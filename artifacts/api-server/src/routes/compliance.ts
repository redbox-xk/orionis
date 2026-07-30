import { Router } from "express";
import { db } from "@workspace/db";
import { complianceControlsTable, complianceFrameworksTable } from "@workspace/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

router.get("/compliance/frameworks", async (_req, res) => {
  const rows = await db.select().from(complianceFrameworksTable).orderBy(complianceFrameworksTable.name);
  res.json(rows);
});

router.get("/compliance/controls", async (req, res) => {
  const { framework, status } = req.query as Record<string, string>;
  let q = db.select().from(complianceControlsTable).$dynamic();
  if (framework) q = q.where(eq(complianceControlsTable.framework, framework)) as typeof q;
  if (status) q = q.where(eq(complianceControlsTable.status, status)) as typeof q;
  const rows = await q.orderBy(complianceControlsTable.controlId);
  res.json(rows);
});

router.post("/compliance/controls", async (req, res) => {
  const { framework, controlId, description, requirements, status } = req.body;
  if (!framework || !controlId) return res.status(400).json({ message: "framework and controlId are required" });

  const row = await db.insert(complianceControlsTable).values({
    id: randomUUID(),
    framework, controlId, description, requirements,
    status: status || "not_started",
  }).returning();

  res.status(201).json(row[0]);
});

router.patch("/compliance/controls/:id", async (req, res) => {
  const { status, evidence, description } = req.body;
  const rows = await db
    .update(complianceControlsTable)
    .set({ status, evidence, description, lastAssessed: new Date() })
    .where(eq(complianceControlsTable.id, req.params.id))
    .returning();
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
});

router.get("/compliance/summary", async (_req, res) => {
  const frameworks = await db.select().from(complianceFrameworksTable);
  const [totals] = await db.select({
    total: count(),
    compliant: sql<number>`count(*) filter (where status = 'compliant')`,
    inProgress: sql<number>`count(*) filter (where status = 'in_progress')`,
    nonCompliant: sql<number>`count(*) filter (where status = 'non_compliant')`,
  }).from(complianceControlsTable);

  const avgScore = frameworks.reduce((acc, f) => acc + f.score, 0) / (frameworks.length || 1);

  res.json({
    frameworks,
    overallScore: Math.round(avgScore),
    totalControls: Number(totals.total),
    compliantControls: Number(totals.compliant),
    inProgressControls: Number(totals.inProgress),
    nonCompliantControls: Number(totals.nonCompliant),
  });
});

export default router;
