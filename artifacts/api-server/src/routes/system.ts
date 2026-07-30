import { Router } from "express";
import { db } from "@workspace/db";
import { assetsTable, vulnerabilitiesTable, threatsTable, incidentsTable } from "@workspace/db/schema";
import { count, sql } from "drizzle-orm";

const router = Router();

router.get("/system/metrics", async (_req, res) => {
  const [assets] = await db.select({ c: count() }).from(assetsTable);
  const [vulns] = await db.select({ c: count() }).from(vulnerabilitiesTable);
  const [threats] = await db.select({ c: count() }).from(threatsTable);
  const [incidents] = await db.select({ c: count() }).from(incidentsTable);

  res.json({
    assetsMonitored: Number(assets.c),
    vulnerabilitiesTracked: Number(vulns.c),
    threatsDetected: Number(threats.c),
    incidentsManaged: Number(incidents.c),
    agentsActive: 6,
    eventsProcessedToday: 847293 + Math.floor(Math.random() * 10000),
    alertsTriaged: 2341 + Math.floor(Math.random() * 100),
    meanTimeToDetect: "4h 12m",
    meanTimeToRespond: "18h 37m",
    uptime: "99.97%",
    compliance: {
      SOC2: 84,
      ISO27001: 78,
      NIST: 81,
      PCI: 91,
      CIS: 73,
    },
  });
});

router.get("/system/status", async (_req, res) => {
  res.json({
    status: "operational",
    services: [
      { name: "Threat Detection Engine", status: "operational", latency: "12ms" },
      { name: "AI Agent Cluster", status: "operational", latency: "43ms" },
      { name: "Log Ingestion Pipeline", status: "operational", latency: "8ms" },
      { name: "SIEM Integration", status: "degraded", latency: "340ms" },
      { name: "Threat Intel Feeds", status: "operational", latency: "89ms" },
      { name: "Compliance Engine", status: "operational", latency: "22ms" },
      { name: "Vulnerability Scanner", status: "operational", latency: "156ms" },
      { name: "Notification Service", status: "operational", latency: "5ms" },
    ],
    lastChecked: new Date().toISOString(),
  });
});

export default router;
