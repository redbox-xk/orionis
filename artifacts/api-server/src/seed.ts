/**
 * ORIONIS demo seed — realistic security platform data
 * Run once: pnpm --filter @workspace/api-server run seed
 */
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import {
  assetsTable, vulnerabilitiesTable, threatsTable, incidentsTable,
  complianceControlsTable, complianceFrameworksTable,
  workflowsTable, reportsTable, auditLogsTable,
} from "@workspace/db/schema";

async function seed() {
  console.log("🌱  Seeding ORIONIS demo data…");

  // ─── Assets ─────────────────────────────────────────────────────────────────
  const assets = await db.insert(assetsTable).values([
    { id: randomUUID(), name: "prod-web-01", type: "server", ipAddresses: ["10.0.1.10"], hostname: "prod-web-01.corp.internal", os: "Ubuntu 22.04 LTS", version: "22.04", criticality: 5, status: "active" },
    { id: randomUUID(), name: "prod-db-primary", type: "database", ipAddresses: ["10.0.2.20"], hostname: "prod-db-01.corp.internal", os: "Ubuntu 22.04 LTS", version: "22.04", criticality: 5, status: "active" },
    { id: randomUUID(), name: "prod-api-gateway", type: "server", ipAddresses: ["10.0.1.11", "10.0.1.12"], hostname: "api-gw.corp.internal", os: "Alpine Linux 3.18", version: "3.18", criticality: 5, status: "active" },
    { id: randomUUID(), name: "k8s-control-plane-01", type: "server", ipAddresses: ["10.0.3.10"], hostname: "k8s-cp-01.corp.internal", os: "Ubuntu 22.04 LTS", version: "22.04", criticality: 5, status: "active" },
    { id: randomUUID(), name: "dev-workstation-jsmith", type: "endpoint", ipAddresses: ["192.168.1.45"], hostname: "jsmith-mbp.corp.local", os: "macOS 14.4", version: "14.4", criticality: 3, status: "active" },
    { id: randomUUID(), name: "dev-workstation-alee", type: "endpoint", ipAddresses: ["192.168.1.62"], hostname: "alee-mbp.corp.local", os: "macOS 14.3", version: "14.3", criticality: 3, status: "active" },
    { id: randomUUID(), name: "corp-firewall-edge", type: "network", ipAddresses: ["203.0.113.1", "10.0.0.1"], hostname: "fw-edge.corp.internal", os: "FortiOS 7.4", version: "7.4", criticality: 5, status: "active" },
    { id: randomUUID(), name: "backup-storage-nas", type: "server", ipAddresses: ["10.0.5.10"], hostname: "nas-01.corp.internal", os: "TrueNAS SCALE", version: "23.10", criticality: 4, status: "active" },
    { id: randomUUID(), name: "aws-prod-vpc-egress", type: "cloud", ipAddresses: ["54.204.20.10"], hostname: null, os: null, version: null, criticality: 4, status: "active" },
    { id: randomUUID(), name: "monitoring-prometheus", type: "server", ipAddresses: ["10.0.4.10"], hostname: "prometheus.corp.internal", os: "Ubuntu 20.04 LTS", version: "20.04", criticality: 2, status: "active" },
    { id: randomUUID(), name: "jenkins-ci-server", type: "server", ipAddresses: ["10.0.4.20"], hostname: "jenkins.corp.internal", os: "CentOS Stream 9", version: "9", criticality: 4, status: "active" },
    { id: randomUUID(), name: "legacy-win-fileserver", type: "server", ipAddresses: ["10.0.6.30"], hostname: "wfs-01.corp.local", os: "Windows Server 2019", version: "2019", criticality: 3, status: "active" },
  ]).returning();

  console.log(`  ✔  ${assets.length} assets`);

  // ─── Vulnerabilities ─────────────────────────────────────────────────────────
  const vulns = await db.insert(vulnerabilitiesTable).values([
    { id: randomUUID(), assetId: assets[0].id, cveId: "CVE-2024-21626", title: "runc container escape via /proc/self/fd", description: "A file descriptor leak in runc allows container breakout to host filesystem.", severity: "CRITICAL", cvssScore: 9.8, cvssVector: "CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H", status: "open", remediation: "Upgrade runc to 1.1.12+", remediationDays: 1 },
    { id: randomUUID(), assetId: assets[3].id, cveId: "CVE-2024-3094", title: "XZ Utils supply chain backdoor", description: "Malicious code injected into XZ Utils 5.6.0-5.6.1 in systemd-based Linux distros.", severity: "CRITICAL", cvssScore: 10.0, cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H", status: "open", remediation: "Downgrade XZ Utils to 5.4.x", remediationDays: 1 },
    { id: randomUUID(), assetId: assets[1].id, cveId: "CVE-2024-0232", title: "SQLite integer overflow in session extension", description: "Integer overflow vulnerability in SQLite session extension allows heap corruption.", severity: "HIGH", cvssScore: 8.1, cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H", status: "in_progress", remediation: "Upgrade SQLite to 3.45.0+", remediationDays: 7 },
    { id: randomUUID(), assetId: assets[10].id, cveId: "CVE-2024-23897", title: "Jenkins arbitrary file read via CLI", description: "Jenkins CLI allows unauthenticated reading of arbitrary files on the Jenkins controller.", severity: "CRITICAL", cvssScore: 9.8, cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H", status: "open", remediation: "Upgrade Jenkins to 2.442+", remediationDays: 1 },
    { id: randomUUID(), assetId: assets[11].id, cveId: "CVE-2024-26169", title: "Windows Error Reporting privilege escalation", description: "Elevation of privilege vulnerability in Windows Error Reporting Service.", severity: "HIGH", cvssScore: 7.8, cvssVector: "CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H", status: "open", remediation: "Apply Microsoft KB5037768 update", remediationDays: 30 },
    { id: randomUUID(), assetId: assets[2].id, cveId: "CVE-2023-44487", title: "HTTP/2 rapid reset DoS (Nginx)", description: "HTTP/2 rapid reset attack enables denial-of-service at layer 7.", severity: "HIGH", cvssScore: 7.5, cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H", status: "resolved", remediation: "Upgrade Nginx to 1.25.3+ or apply patch", remediationDays: 7 },
    { id: randomUUID(), assetId: assets[0].id, cveId: "CVE-2024-6387", title: "regreSSHion — OpenSSH async signal handler RCE", description: "Race condition in OpenSSH signal handler allows unauthenticated remote code execution.", severity: "CRITICAL", cvssScore: 9.8, cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H", status: "in_progress", remediation: "Upgrade OpenSSH to 9.8p1", remediationDays: 3 },
    { id: randomUUID(), assetId: assets[4].id, cveId: null, title: "Unencrypted credentials in shell history", description: "Plaintext API keys found in ~/.bash_history and ~/.zsh_history on developer workstation.", severity: "MEDIUM", cvssScore: 6.5, cvssVector: null, status: "open", remediation: "Rotate all credentials, implement secrets management policy", remediationDays: 14 },
    { id: randomUUID(), assetId: assets[6].id, cveId: "CVE-2024-21762", title: "Fortinet SSL-VPN out-of-bounds write RCE", description: "Out-of-bounds write vulnerability allows unauthenticated remote code execution on FortiOS.", severity: "CRITICAL", cvssScore: 9.8, cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H", status: "open", remediation: "Upgrade FortiOS to 7.4.3+", remediationDays: 1 },
    { id: randomUUID(), assetId: assets[8].id, cveId: null, title: "AWS S3 bucket publicly readable", description: "Prod backup bucket has ACL set to public-read. Contains database snapshots.", severity: "CRITICAL", cvssScore: 9.1, cvssVector: null, status: "open", remediation: "Set bucket ACL to private, enable Block Public Access", remediationDays: 1 },
    { id: randomUUID(), assetId: assets[1].id, cveId: null, title: "PostgreSQL MD5 password hashing", description: "Database configured to use MD5 for password hashing (deprecated, broken).", severity: "MEDIUM", cvssScore: 5.9, cvssVector: null, status: "in_progress", remediation: "Migrate to SCRAM-SHA-256 in pg_hba.conf", remediationDays: 30 },
    { id: randomUUID(), assetId: assets[9].id, cveId: null, title: "Prometheus metrics endpoint exposed externally", description: "Prometheus /metrics endpoint accessible without authentication from internet.", severity: "LOW", cvssScore: 3.1, cvssVector: null, status: "open", remediation: "Restrict access to internal network, add authentication", remediationDays: 30 },
  ]).returning();

  console.log(`  ✔  ${vulns.length} vulnerabilities`);

  // ─── Threats ─────────────────────────────────────────────────────────────────
  const threats = await db.insert(threatsTable).values([
    { id: randomUUID(), threatId: "THR-2024-0847", type: "brute_force", severity: "HIGH", sourceIp: "185.220.101.47", targetAssetId: assets[0].id, description: "Sustained SSH brute-force from Tor exit node. 2,847 failed authentication attempts in 4 hours.", indicators: { "attempts": 2847, "duration_hours": 4, "source_asn": "AS4766" }, mitreTechniques: ["T1110.001", "T1190"], score: 82, status: "investigating" },
    { id: randomUUID(), threatId: "THR-2024-0848", type: "lateral_movement", severity: "CRITICAL", sourceIp: "10.0.1.45", targetAssetId: assets[1].id, description: "Anomalous internal SMB traffic pattern consistent with lateral movement. Possible compromise of workstation 10.0.1.45.", indicators: { "protocol": "SMB", "shares_accessed": 12, "new_connections": 7 }, mitreTechniques: ["T1021.002", "T1078"], score: 94, status: "active" },
    { id: randomUUID(), threatId: "THR-2024-0849", type: "data_exfiltration", severity: "CRITICAL", sourceIp: "10.0.2.20", targetAssetId: assets[8].id, description: "Unusual outbound data transfer detected. 48GB transferred to unknown external endpoint in 30 minutes.", indicators: { "bytes_transferred": 51539607552, "destination": "195.123.247.89", "protocol": "HTTPS" }, mitreTechniques: ["T1041", "T1048"], score: 97, status: "active" },
    { id: randomUUID(), threatId: "THR-2024-0846", type: "malware", severity: "HIGH", sourceIp: "192.168.1.45", targetAssetId: assets[4].id, description: "Endpoint detection triggered. Cobalt Strike beacon signature detected on developer workstation.", indicators: { "hash": "a1b2c3d4e5f6...", "process": "svchost.exe", "c2_ip": "103.75.189.12" }, mitreTechniques: ["T1055", "T1071.001", "T1059.003"], score: 88, status: "investigating" },
    { id: randomUUID(), threatId: "THR-2024-0845", type: "phishing", severity: "MEDIUM", sourceIp: "209.85.220.41", targetAssetId: assets[5].id, description: "Spear-phishing email with malicious macro attachment delivered to finance team. 1 user clicked.", indicators: { "sender": "cfo@corp-imitator.com", "subject": "Q4 Budget Approval Required", "attachment": "Q4_Budget_v3.xlsm" }, mitreTechniques: ["T1566.001", "T1204.002"], score: 71, status: "investigating" },
    { id: randomUUID(), threatId: "THR-2024-0844", type: "credential_theft", severity: "CRITICAL", sourceIp: "45.33.32.156", targetAssetId: assets[10].id, description: "Jenkins API token exfiltrated via CVE-2024-23897. Token used to access CI/CD pipeline.", indicators: { "cve": "CVE-2024-23897", "token_used": true, "pipeline_accessed": "prod-deploy" }, mitreTechniques: ["T1552.007", "T1212"], score: 91, status: "active" },
    { id: randomUUID(), threatId: "THR-2024-0843", type: "ddos", severity: "LOW", sourceIp: "203.0.113.0", targetAssetId: assets[2].id, description: "HTTP/2 Rapid Reset DDoS observed. Edge protection mitigated. Peak 1.4M rps.", indicators: { "peak_rps": 1400000, "duration_minutes": 23, "mitigation": "cloudflare" }, mitreTechniques: ["T1498.002"], score: 45, status: "resolved" },
    { id: randomUUID(), threatId: "THR-2024-0842", type: "privilege_escalation", severity: "HIGH", sourceIp: "10.0.4.20", targetAssetId: assets[3].id, description: "Kubernetes RBAC misconfiguration exploited. Attacker obtained cluster-admin role from default namespace.", indicators: { "namespace": "default", "service_account": "default", "granted_role": "cluster-admin" }, mitreTechniques: ["T1078.001", "T1548"], score: 79, status: "resolved" },
  ]).returning();

  console.log(`  ✔  ${threats.length} threats`);

  // ─── Incidents ───────────────────────────────────────────────────────────────
  const incidents = await db.insert(incidentsTable).values([
    {
      id: randomUUID(),
      title: "Active Data Exfiltration — Production Database",
      description: "Critical exfiltration event detected. 48GB of production data transferred to external IP 195.123.247.89 via HTTPS. Possible insider threat or compromised credentials on prod-db-primary.",
      severity: "CRITICAL",
      status: "in_progress",
      category: "data_breach",
      affectedAssets: [assets[1].id, assets[8].id],
      assignedTo: "security-team-alpha",
      responsePlan: "1. Isolate prod-db-primary from external network\n2. Revoke all active sessions and rotate credentials\n3. Forensic image of affected systems\n4. Notify DPO and legal within 72h per GDPR Art. 33\n5. Engage external IR firm if needed",
      aiAnalysis: {
        summary: "High-confidence data exfiltration event. Threat actor likely has persistent access since THR-2024-0848 lateral movement 6 days ago. Exfiltration method: HTTPS beaconing to known C2 infrastructure.",
        confidence: 0.94,
        recommendations: [
          "Immediate network isolation of prod-db-primary",
          "Full credential rotation across all systems",
          "Engage DFIR team for forensic analysis",
          "Review all access logs for last 30 days"
        ],
        attackChain: ["T1078 → T1021.002 → T1041"],
        riskScore: 97,
      },
    },
    {
      id: randomUUID(),
      title: "Jenkins CI/CD Compromise via CVE-2024-23897",
      description: "Production deployment pipeline compromised following exploitation of Jenkins arbitrary file read vulnerability. Attacker accessed prod-deploy pipeline credentials.",
      severity: "CRITICAL",
      status: "open",
      category: "credential_compromise",
      affectedAssets: [assets[10].id],
      assignedTo: "security-team-beta",
      responsePlan: "1. Immediately disable Jenkins CLI access\n2. Rotate all pipeline secrets and API tokens\n3. Review all deployments in last 48h for tampering\n4. Apply Jenkins 2.442+ patch\n5. Implement pipeline signing",
      aiAnalysis: {
        summary: "Jenkins instance fully compromised. Attacker used CVE-2024-23897 to read /var/jenkins_home/secrets/initialAdminPassword and pipeline credential files.",
        confidence: 0.91,
        recommendations: ["Disable Jenkins until patched", "Audit all recent deployments"],
        riskScore: 91,
      },
    },
    {
      id: randomUUID(),
      title: "Cobalt Strike Beacon on Developer Workstation",
      description: "EDR telemetry detected Cobalt Strike beacon on jsmith-mbp. Process injection into legitimate svchost.exe process. C2 communications to 103.75.189.12.",
      severity: "HIGH",
      status: "in_progress",
      category: "malware",
      affectedAssets: [assets[4].id],
      assignedTo: "security-team-alpha",
      responsePlan: "1. Isolate workstation from network\n2. Full disk forensic image\n3. Block C2 IP at perimeter\n4. Reset all credentials used from this device\n5. Scan for lateral movement indicators",
      aiAnalysis: {
        summary: "Cobalt Strike beacon active. Beacon profile matches known APT29 tooling. Initial vector likely spear-phishing (ref: THR-2024-0845). Contain immediately before lateral movement.",
        confidence: 0.87,
        recommendations: ["Network isolation", "Block 103.75.189.12/32 at firewall"],
        riskScore: 88,
      },
    },
    {
      id: randomUUID(),
      title: "S3 Bucket Public Exposure — Backup Data",
      description: "Production database backup S3 bucket (prod-backups-encrypted) found with public-read ACL. Bucket contains 90 days of encrypted database snapshots.",
      severity: "CRITICAL",
      status: "open",
      category: "misconfiguration",
      affectedAssets: [assets[8].id],
      assignedTo: null,
      responsePlan: "1. Immediately set bucket ACL to private\n2. Enable Block Public Access at account level\n3. Check S3 access logs for unauthorized downloads\n4. Assess if encryption keys were also exposed\n5. Notify CISO",
      aiAnalysis: {
        summary: "Critical misconfiguration. Bucket has been publicly readable since last ACL change 4 days ago. S3 server access logs show 3 external IPs accessed the bucket listing.",
        confidence: 0.97,
        recommendations: ["Immediate ACL correction", "Log review", "Legal notification assessment"],
        riskScore: 94,
      },
    },
    {
      id: randomUUID(),
      title: "Kubernetes RBAC Privilege Escalation",
      description: "Default service account in default namespace had cluster-admin binding. Attacker used this to escalate from pod to full cluster control.",
      severity: "HIGH",
      status: "resolved",
      category: "privilege_escalation",
      affectedAssets: [assets[3].id],
      assignedTo: "security-team-beta",
      responsePlan: "Completed: Removed cluster-admin binding from default SA, applied OPA Gatekeeper policies, rotated kubeconfig credentials.",
      aiAnalysis: {
        summary: "RBAC misconfiguration resolved. No persistence established. Recommend quarterly RBAC audits going forward.",
        confidence: 0.92,
        recommendations: ["Implement OPA Gatekeeper", "Regular RBAC audits"],
        riskScore: 79,
      },
    },
  ]).returning();

  console.log(`  ✔  ${incidents.length} incidents`);

  // ─── Compliance Frameworks ───────────────────────────────────────────────────
  await db.insert(complianceFrameworksTable).values([
    { id: "fw-soc2", name: "SOC 2 Type II", description: "AICPA trust service criteria covering security, availability, processing integrity, confidentiality, and privacy.", score: 84, status: "in_progress", totalControls: "64", compliantControls: "54" },
    { id: "fw-iso27001", name: "ISO 27001:2022", description: "International standard for information security management systems (ISMS).", score: 78, status: "in_progress", totalControls: "93", compliantControls: "73" },
    { id: "fw-nist", name: "NIST CSF 2.0", description: "NIST Cybersecurity Framework for managing and reducing cybersecurity risk.", score: 81, status: "in_progress", totalControls: "106", compliantControls: "86" },
    { id: "fw-cis", name: "CIS Controls v8", description: "Prioritized set of cybersecurity best practices to defend against common attacks.", score: 73, status: "in_progress", totalControls: "153", compliantControls: "112" },
    { id: "fw-pci", name: "PCI DSS v4.0", description: "Payment Card Industry Data Security Standard for protecting cardholder data.", score: 91, status: "compliant", totalControls: "285", compliantControls: "259" },
  ]);

  // ─── Compliance Controls (sample) ───────────────────────────────────────────
  await db.insert(complianceControlsTable).values([
    { id: randomUUID(), framework: "SOC2", controlId: "CC6.1", description: "Logical and physical access controls", status: "in_progress", lastAssessed: new Date("2024-01-15") },
    { id: randomUUID(), framework: "SOC2", controlId: "CC6.2", description: "User registration and de-registration", status: "compliant", lastAssessed: new Date("2024-01-20") },
    { id: randomUUID(), framework: "SOC2", controlId: "CC6.6", description: "Logical access security over protected information assets", status: "compliant", lastAssessed: new Date("2024-01-22") },
    { id: randomUUID(), framework: "SOC2", controlId: "CC7.2", description: "System monitoring for security events", status: "in_progress", lastAssessed: new Date("2024-01-18") },
    { id: randomUUID(), framework: "SOC2", controlId: "CC9.1", description: "Risk mitigation activities", status: "non_compliant", lastAssessed: new Date("2024-01-10") },
    { id: randomUUID(), framework: "ISO27001", controlId: "A.12.6.1", description: "Management of technical vulnerabilities", status: "in_progress", lastAssessed: new Date("2024-01-14") },
    { id: randomUUID(), framework: "ISO27001", controlId: "A.16.1.4", description: "Assessment and decision on information security events", status: "compliant", lastAssessed: new Date("2024-01-21") },
    { id: randomUUID(), framework: "ISO27001", controlId: "A.8.9", description: "Configuration management", status: "compliant", lastAssessed: new Date("2024-01-19") },
    { id: randomUUID(), framework: "NIST", controlId: "DE.AE-1", description: "Network communications baseline established", status: "compliant", lastAssessed: new Date("2024-01-16") },
    { id: randomUUID(), framework: "NIST", controlId: "RS.RP-1", description: "Response plan executed during or after incident", status: "compliant", lastAssessed: new Date("2024-01-23") },
  ]);

  console.log("  ✔  compliance frameworks + controls");

  // ─── Workflows ────────────────────────────────────────────────────────────────
  await db.insert(workflowsTable).values([
    { id: randomUUID(), name: "Critical Vulnerability Auto-Response", description: "Automatically creates incident and notifies security team when CRITICAL vulnerability detected", triggerType: "event", triggerConfig: { "event": "vulnerability.created", "filter": "severity == CRITICAL" }, steps: [{ "id": "s1", "type": "create_incident", "name": "Create Incident" }, { "id": "s2", "type": "notify", "name": "Notify Team" }, { "id": "s3", "type": "ai_analyze", "name": "AI Analysis" }], status: "active" },
    { id: randomUUID(), name: "Daily Threat Intelligence Digest", description: "Aggregates threat intel from all feeds and generates executive summary at 07:00 UTC", triggerType: "schedule", triggerConfig: { "cron": "0 7 * * *", "timezone": "UTC" }, steps: [{ "id": "s1", "type": "fetch_feeds", "name": "Fetch TI Feeds" }, { "id": "s2", "type": "correlate", "name": "Correlate Events" }, { "id": "s3", "type": "generate_report", "name": "Generate Report" }, { "id": "s4", "type": "distribute", "name": "Distribute" }], status: "active" },
    { id: randomUUID(), name: "Incident Escalation Chain", description: "Escalates unacknowledged HIGH/CRITICAL incidents through management chain after SLA breach", triggerType: "sla_breach", triggerConfig: { "severity": ["CRITICAL", "HIGH"], "sla_minutes": 30 }, steps: [{ "id": "s1", "type": "notify_tier1", "name": "Notify L1" }, { "id": "s2", "type": "wait", "name": "Wait 15m" }, { "id": "s3", "type": "escalate_manager", "name": "Escalate to Manager" }], status: "active" },
    { id: randomUUID(), name: "Compliance Evidence Collection", description: "Weekly automated collection of compliance evidence artifacts across all frameworks", triggerType: "schedule", triggerConfig: { "cron": "0 0 * * 0", "timezone": "UTC" }, steps: [{ "id": "s1", "type": "collect_logs", "name": "Collect Audit Logs" }, { "id": "s2", "type": "screenshot_dashboards", "name": "Dashboard Screenshots" }, { "id": "s3", "type": "package_evidence", "name": "Package Evidence" }], status: "active" },
  ]);

  console.log("  ✔  workflows");

  // ─── Reports ─────────────────────────────────────────────────────────────────
  await db.insert(reportsTable).values([
    { id: randomUUID(), title: "Executive Security Summary — Q4 2024", type: "executive", generatedBy: "agent-ciso", format: "pdf", status: "ready", data: { pages: 8, securityScore: 72, keyFindings: 5 } },
    { id: randomUUID(), title: "SOC 2 Type II Gap Analysis", type: "compliance", generatedBy: "agent-compliance", format: "pdf", status: "ready", data: { framework: "SOC2", gapCount: 10, criticalGaps: 2 } },
    { id: randomUUID(), title: "Weekly Threat Intelligence Briefing — 2024-07-22", type: "threat_intel", generatedBy: "agent-hunter", format: "pdf", status: "ready", data: { threatsIdentified: 3, iocCount: 47, newTTPs: 2 } },
    { id: randomUUID(), title: "Incident Post-Mortem: K8S RBAC Escalation", type: "incident", generatedBy: "agent-responder", format: "pdf", status: "ready", data: { incidentId: incidents[4].id, mttr: "6h 23m", lessonsLearned: 4 } },
    { id: randomUUID(), title: "Vulnerability Assessment — July 2024", type: "security_assessment", generatedBy: "agent-analyst", format: "pdf", status: "ready", data: { totalVulns: 12, criticalVulns: 5, patchRate: 0.42 } },
  ]);

  console.log("  ✔  reports");

  // ─── Audit Logs ───────────────────────────────────────────────────────────────
  const auditActions = [
    { action: "asset.created", resourceType: "asset", resourceId: assets[0].id, userId: "user-admin", ipAddress: "10.0.0.1" },
    { action: "vulnerability.status_changed", resourceType: "vulnerability", resourceId: vulns[5].id, userId: "user-jsmith", ipAddress: "192.168.1.45", changes: { from: "open", to: "resolved" } },
    { action: "incident.created", resourceType: "incident", resourceId: incidents[0].id, userId: "agent-sentinel", ipAddress: "10.0.4.10" },
    { action: "threat.escalated", resourceType: "threat", resourceId: threats[2].id, userId: "agent-phantom", ipAddress: "10.0.4.10" },
    { action: "compliance.control_updated", resourceType: "compliance_control", userId: "user-admin", ipAddress: "10.0.0.1" },
    { action: "report.generated", resourceType: "report", userId: "agent-ciso", ipAddress: "10.0.4.10" },
    { action: "workflow.executed", resourceType: "workflow", userId: "system", ipAddress: "10.0.4.10" },
    { action: "user.login", resourceType: "auth", userId: "user-admin", ipAddress: "203.0.113.42" },
    { action: "user.login.failed", resourceType: "auth", userId: "user-unknown", ipAddress: "185.220.101.47", success: false },
    { action: "asset.scan_completed", resourceType: "asset", userId: "agent-sentinel", ipAddress: "10.0.4.10" },
    { action: "incident.status_changed", resourceType: "incident", resourceId: incidents[4].id, userId: "user-admin", changes: { from: "in_progress", to: "resolved" } },
    { action: "api_key.rotated", resourceType: "credential", userId: "user-admin", ipAddress: "10.0.0.1" },
    { action: "firewall.rule_added", resourceType: "network", userId: "agent-forge", ipAddress: "10.0.4.10" },
    { action: "threat.blocked", resourceType: "threat", resourceId: threats[6].id, userId: "system", ipAddress: "10.0.0.1" },
    { action: "vulnerability.severity_updated", resourceType: "vulnerability", resourceId: vulns[8].id, userId: "agent-sentinel", ipAddress: "10.0.4.10" },
  ];

  for (let i = 0; i < auditActions.length; i++) {
    const a = auditActions[i];
    await db.insert(auditLogsTable).values({
      id: randomUUID(),
      userId: a.userId,
      action: a.action,
      resourceType: a.resourceType,
      resourceId: (a as any).resourceId,
      changes: (a as any).changes,
      ipAddress: a.ipAddress,
      success: (a as any).success !== false,
    });
  }

  console.log(`  ✔  ${auditActions.length} audit log entries`);
  console.log("\n✅  Seed complete!");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
