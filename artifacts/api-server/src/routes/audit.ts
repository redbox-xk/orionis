import { Router } from "express";
import { db } from "@workspace/db";
import { auditLogsTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/audit/logs", async (req, res) => {
  const { resourceType, userId, action } = req.query as Record<string, string>;

  let q = db.select().from(auditLogsTable).$dynamic();
  if (resourceType) q = q.where(eq(auditLogsTable.resourceType, resourceType)) as typeof q;
  if (userId) q = q.where(eq(auditLogsTable.userId, userId)) as typeof q;

  const rows = await q.orderBy(sql`created_at desc`).limit(100);
  res.json(rows);
});

export default router;
