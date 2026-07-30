import { Router } from "express";
import { db } from "@workspace/db";
import { incidentsTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

router.get("/incidents", async (req, res) => {
  const { severity, status, category } = req.query as Record<string, string>;

  let q = db.select().from(incidentsTable).$dynamic();
  if (severity) q = q.where(eq(incidentsTable.severity, severity)) as typeof q;
  if (status) q = q.where(eq(incidentsTable.status, status)) as typeof q;
  if (category) q = q.where(eq(incidentsTable.category, category)) as typeof q;

  const rows = await q.orderBy(sql`created_at desc`);
  res.json(rows);
});

router.post("/incidents", async (req, res) => {
  const { title, description, severity, status, category, affectedAssets, assignedTo, responsePlan } = req.body;
  if (!title || !severity) return res.status(400).json({ message: "title and severity are required" });

  const row = await db.insert(incidentsTable).values({
    id: randomUUID(),
    title, description, severity,
    status: status || "open",
    category, affectedAssets: affectedAssets || [],
    assignedTo, responsePlan,
    aiAnalysis: {
      summary: "AI analysis pending — agent has been notified.",
      recommendations: [],
      confidence: 0,
    },
  }).returning();

  res.status(201).json(row[0]);
});

router.get("/incidents/:id", async (req, res) => {
  const rows = await db.select().from(incidentsTable).where(eq(incidentsTable.id, req.params.id));
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
});

router.patch("/incidents/:id", async (req, res) => {
  const { title, description, severity, status, assignedTo, responsePlan, aiAnalysis } = req.body;
  const rows = await db
    .update(incidentsTable)
    .set({
      title, description, severity, status, assignedTo, responsePlan, aiAnalysis,
      updatedAt: new Date(),
      resolvedAt: status === "resolved" || status === "closed" ? new Date() : undefined,
    })
    .where(eq(incidentsTable.id, req.params.id))
    .returning();
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
});

export default router;
