import { Router } from "express";
import { db } from "@workspace/db";
import { workflowsTable, workflowExecutionsTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

router.get("/workflows/executions/list", async (_req, res) => {
  const rows = await db.select().from(workflowExecutionsTable).orderBy(sql`started_at desc`).limit(20);
  res.json(rows);
});

router.get("/workflows", async (_req, res) => {
  const rows = await db.select().from(workflowsTable).orderBy(sql`created_at desc`);
  res.json(rows);
});

router.post("/workflows", async (req, res) => {
  const { name, description, triggerType, triggerConfig, steps, status } = req.body;
  if (!name || !triggerType) return res.status(400).json({ message: "name and triggerType are required" });

  const row = await db.insert(workflowsTable).values({
    id: randomUUID(),
    name, description, triggerType,
    triggerConfig: triggerConfig || {},
    steps: steps || [],
    status: status || "active",
  }).returning();

  res.status(201).json(row[0]);
});

router.get("/workflows/:id", async (req, res) => {
  const rows = await db.select().from(workflowsTable).where(eq(workflowsTable.id, req.params.id));
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
});

router.patch("/workflows/:id", async (req, res) => {
  const { name, description, triggerConfig, steps, status } = req.body;
  const rows = await db
    .update(workflowsTable)
    .set({ name, description, triggerConfig, steps, status, updatedAt: new Date() })
    .where(eq(workflowsTable.id, req.params.id))
    .returning();
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
});

router.delete("/workflows/:id", async (req, res) => {
  await db.delete(workflowsTable).where(eq(workflowsTable.id, req.params.id));
  res.status(204).send();
});

router.post("/workflows/:id/execute", async (req, res) => {
  const workflow = await db.select().from(workflowsTable).where(eq(workflowsTable.id, req.params.id));
  if (!workflow.length) return res.status(404).json({ message: "Not found" });

  const exec = await db.insert(workflowExecutionsTable).values({
    id: randomUUID(),
    workflowId: req.params.id,
    status: "running",
    currentStep: "step-1",
  }).returning();

  // Simulate async completion
  setTimeout(async () => {
    await db.update(workflowExecutionsTable)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(workflowExecutionsTable.id, exec[0].id));
  }, 2000);

  res.json({ executionId: exec[0].id, status: "running", workflowId: req.params.id });
});

router.get("/workflows/executions/list", async (_req, res) => {
  const rows = await db.select().from(workflowExecutionsTable).orderBy(sql`started_at desc`).limit(20);
  res.json(rows);
});

export default router;
