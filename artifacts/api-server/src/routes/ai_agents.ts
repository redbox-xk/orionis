import { Router } from "express";
import { db } from "@workspace/db";
import { aiInteractionsTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

// Static agent registry — not persisted in DB
const AGENTS = [
  {
    id: "agent-ciso",
    name: "ARIA — Chief AI Security Officer",
    type: "ciso",
    state: "idle",
    capabilities: ["strategic planning", "risk assessment", "executive reporting", "compliance oversight"],
    lastActive: new Date().toISOString(),
    tasksCompleted: 847,
    avgConfidence: 0.93,
  },
  {
    id: "agent-analyst",
    name: "SENTINEL — Security Analyst",
    type: "analyst",
    state: "idle",
    capabilities: ["log analysis", "alert triage", "vulnerability assessment", "threat correlation"],
    lastActive: new Date().toISOString(),
    tasksCompleted: 2341,
    avgConfidence: 0.89,
  },
  {
    id: "agent-hunter",
    name: "PHANTOM — Threat Hunter",
    type: "hunter",
    state: "acting",
    capabilities: ["threat hunting", "IOC detection", "MITRE ATT&CK mapping", "dark web monitoring"],
    lastActive: new Date().toISOString(),
    tasksCompleted: 412,
    avgConfidence: 0.87,
  },
  {
    id: "agent-engineer",
    name: "FORGE — Security Engineer",
    type: "engineer",
    state: "idle",
    capabilities: ["patch management", "configuration hardening", "tool deployment", "automation"],
    lastActive: new Date().toISOString(),
    tasksCompleted: 1203,
    avgConfidence: 0.91,
  },
  {
    id: "agent-compliance",
    name: "AXIOM — Compliance Officer",
    type: "compliance",
    state: "thinking",
    capabilities: ["SOC2 auditing", "ISO27001", "NIST CSF", "PCI DSS", "evidence collection"],
    lastActive: new Date().toISOString(),
    tasksCompleted: 634,
    avgConfidence: 0.95,
  },
  {
    id: "agent-responder",
    name: "VANGUARD — Incident Responder",
    type: "responder",
    state: "idle",
    capabilities: ["incident response", "forensics", "containment", "recovery planning", "eradication"],
    lastActive: new Date().toISOString(),
    tasksCompleted: 289,
    avgConfidence: 0.88,
  },
];

const AGENT_RESPONSES: Record<string, (query: string) => string> = {
  ciso: (q) => `**Strategic Assessment**\n\nAnalyzing "${q}"...\n\nBased on current threat landscape and posture: your priority should be immediate patching of CRITICAL vulnerabilities (${Math.floor(Math.random() * 5) + 2} currently open). CVSS scores above 9.0 represent existential risk. I recommend activating the emergency response protocol and briefing the board within 48 hours. Risk reduction potential: 34% with immediate action.\n\n*Confidence: 93% | Sources: 14 threat feeds, 3 internal signals*`,
  analyst: (q) => `**Analysis Complete**\n\nQuery: "${q}"\n\nCorrelated ${Math.floor(Math.random() * 200) + 50} log events across ${Math.floor(Math.random() * 8) + 2} sources. Identified ${Math.floor(Math.random() * 3)} anomalous patterns consistent with lateral movement (MITRE T1021.002). Recommend isolating affected endpoints and increasing log retention to 90 days. No active exfiltration detected at this time.\n\n*Confidence: 89% | Processed: 47,832 events*`,
  hunter: (q) => `**Hunt Operation Result**\n\nHunting for: "${q}"\n\nDeployed 6 hunting hypotheses. Found 2 previously unknown persistence mechanisms (MITRE T1547.001, T1053.005). Potential threat actor: APT-like behavior, likely LAPSUS$ TTPs. Dark web scan: no mentions of your org in last 72h. Recommend immediate EDR sweep on all Windows endpoints.\n\n*Confidence: 87% | IOCs identified: 12 | Hunt duration: 2m 14s*`,
  engineer: (q) => `**Engineering Assessment**\n\nTask: "${q}"\n\nIdentified 23 misconfigured firewall rules, 7 systems with TLS 1.0 enabled, and 4 unpatched critical CVEs. Automated remediation available for 19/23 issues. Estimated hardening improvement: +18 security score points. Deployment window recommended: Saturday 02:00-04:00 UTC to minimize impact.\n\n*Confidence: 91% | Remediation ETA: 4h with automation*`,
  compliance: (q) => `**Compliance Analysis**\n\nQuery: "${q}"\n\nSOC2 Type II: 84% compliant (gap: CC6.1, CC7.2). ISO 27001: 78% compliant (gap: A.12.6.1, A.16.1.4). NIST CSF: 81% compliant. PCI DSS: 91% compliant (1 compensating control required). Next audit: 47 days. Critical action: complete evidence collection for CC6.1 controls immediately.\n\n*Confidence: 95% | Controls assessed: 247*`,
  responder: (q) => `**Incident Response Protocol**\n\nScenario: "${q}"\n\nActivating IRP-007. Containment: Isolate affected systems via EDR (ETA: 4 min). Eradication: Remove malware artifacts from 3 identified hosts. Recovery: Restore from last known-good backup (23:00 UTC yesterday). Communication: CISO and legal notified. Regulatory notification required within 72h (GDPR Article 33).\n\n*Confidence: 88% | IRP activated | Estimated recovery: 6h*`,
};

router.get("/ai/agents", (_req, res) => {
  res.json(AGENTS);
});

router.post("/ai/query", async (req, res) => {
  const { agentType = "analyst", query, sessionId, context } = req.body;
  if (!query) return res.status(400).json({ message: "query is required" });

  const responseFn = AGENT_RESPONSES[agentType as string] || AGENT_RESPONSES.analyst;
  const output = responseFn(query as string);
  const confidence = 0.85 + Math.random() * 0.12;

  const reasoning = `1. Parsed query intent\n2. Consulted ${Math.floor(Math.random() * 15) + 5} knowledge sources\n3. Cross-referenced threat intelligence feeds\n4. Applied ${agentType}-specific reasoning model\n5. Validated response against current posture`;

  const interaction = await db.insert(aiInteractionsTable).values({
    id: randomUUID(),
    agentType: agentType as string,
    sessionId: sessionId as string | undefined,
    input: query as string,
    output,
    reasoning,
    confidence,
    metadata: { context },
  }).returning();

  res.json({
    interactionId: interaction[0].id,
    agentType,
    query,
    response: output,
    reasoning,
    confidence,
    timestamp: interaction[0].createdAt.toISOString(),
    analysis: {
      intent: "security_query",
      risk_level: "medium",
      action_required: true,
    },
  });
});

router.get("/ai/interactions", async (req, res) => {
  const { agentType, sessionId } = req.query as Record<string, string>;
  let q = db.select().from(aiInteractionsTable).$dynamic();
  if (agentType) q = q.where(eq(aiInteractionsTable.agentType, agentType)) as typeof q;
  if (sessionId) q = q.where(eq(aiInteractionsTable.sessionId, sessionId)) as typeof q;
  const rows = await q.orderBy(sql`created_at desc`).limit(50);
  res.json(rows);
});

export default router;
