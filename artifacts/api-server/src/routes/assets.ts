import { Router } from "express";
import { db } from "@workspace/db";
import { assetsTable } from "@workspace/db/schema";
import { eq, sql, ilike, or, count } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

router.get("/assets", async (req, res) => {
  const { search, type, status, criticality } = req.query as Record<string, string>;
  let query = db.select().from(assetsTable).$dynamic();

  const filters: ReturnType<typeof eq>[] = [];
  if (type) filters.push(eq(assetsTable.type, type));
  if (status) filters.push(eq(assetsTable.status, status));
  if (criticality) filters.push(eq(assetsTable.criticality, parseInt(criticality)));
  if (search) {
    filters.push(
      or(ilike(assetsTable.name, `%${search}%`), ilike(assetsTable.hostname ?? assetsTable.name, `%${search}%`))!
    );
  }

  if (filters.length > 0) {
    const { where } = await import("drizzle-orm");
    // Apply filters using sql and
    let q = db.select().from(assetsTable);
    for (const f of filters) {
      q = q.where(f) as typeof q;
    }
    const rows = await q.orderBy(sql`discovered_at desc`);
    return res.json(rows);
  }

  const rows = await db.select().from(assetsTable).orderBy(sql`discovered_at desc`);
  res.json(rows);
});

router.post("/assets", async (req, res) => {
  const { name, type, ipAddresses, hostname, os, version, criticality, ownerId, metadata } = req.body;
  if (!name || !type) return res.status(400).json({ message: "name and type are required" });

  const asset = await db.insert(assetsTable).values({
    id: randomUUID(),
    name, type,
    ipAddresses: ipAddresses || [],
    hostname, os, version,
    criticality: criticality ?? 3,
    ownerId, metadata,
    status: "active",
  }).returning();

  res.status(201).json(asset[0]);
});

router.get("/assets/stats", async (_req, res) => {
  const byType = await db
    .select({ type: assetsTable.type, count: count() })
    .from(assetsTable)
    .groupBy(assetsTable.type);

  const byCriticality = await db
    .select({ level: assetsTable.criticality, count: count() })
    .from(assetsTable)
    .groupBy(assetsTable.criticality)
    .orderBy(assetsTable.criticality);

  const byStatus = await db
    .select({ status: assetsTable.status, count: count() })
    .from(assetsTable)
    .groupBy(assetsTable.status);

  res.json({
    byType: byType.map((r) => ({ type: r.type, count: Number(r.count) })),
    byCriticality: byCriticality.map((r) => ({ level: r.level, count: Number(r.count) })),
    byStatus: byStatus.map((r) => ({ status: r.status, count: Number(r.count) })),
  });
});

router.get("/assets/:id", async (req, res) => {
  const rows = await db.select().from(assetsTable).where(eq(assetsTable.id, req.params.id));
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
});

router.patch("/assets/:id", async (req, res) => {
  const { name, type, ipAddresses, hostname, os, version, criticality, status, ownerId } = req.body;
  const rows = await db
    .update(assetsTable)
    .set({ name, type, ipAddresses, hostname, os, version, criticality, status, ownerId, lastSeen: new Date() })
    .where(eq(assetsTable.id, req.params.id))
    .returning();
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
});

router.delete("/assets/:id", async (req, res) => {
  await db.delete(assetsTable).where(eq(assetsTable.id, req.params.id));
  res.status(204).send();
});

export default router;
