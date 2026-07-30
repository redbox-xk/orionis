import { Router } from "express";
import { db } from "@workspace/db";
import { reportsTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

router.get("/reports", async (_req, res) => {
  const rows = await db.select().from(reportsTable).orderBy(sql`created_at desc`);
  res.json(rows);
});

router.post("/reports/generate", async (req, res) => {
  const { type, format } = req.body;
  if (!type) return res.status(400).json({ message: "type is required" });

  const titles: Record<string, string> = {
    security_assessment: "Security Assessment Report",
    compliance: "Compliance Status Report",
    executive: "Executive Summary Report",
    threat_intel: "Threat Intelligence Briefing",
    incident: "Incident Report",
  };

  const row = await db.insert(reportsTable).values({
    id: randomUUID(),
    title: `${titles[type as string] || "Security Report"} — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
    type: type as string,
    generatedBy: "system",
    format: (format as string) || "pdf",
    status: "generating",
    data: { generatedAt: new Date().toISOString(), type },
  }).returning();

  // Simulate report generation
  setTimeout(async () => {
    await db.update(reportsTable)
      .set({ status: "ready" })
      .where(eq(reportsTable.id, row[0].id));
  }, 3000);

  res.status(202).json(row[0]);
});

router.get("/reports/:id", async (req, res) => {
  const rows = await db.select().from(reportsTable).where(eq(reportsTable.id, req.params.id));
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
});

export default router;
