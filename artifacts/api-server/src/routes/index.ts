import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import assetsRouter from "./assets";
import vulnerabilitiesRouter from "./vulnerabilities";
import threatsRouter from "./threats";
import incidentsRouter from "./incidents";
import aiAgentsRouter from "./ai_agents";
import workflowsRouter from "./workflows";
import complianceRouter from "./compliance";
import reportsRouter from "./reports";
import auditRouter from "./audit";
import systemRouter from "./system";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(assetsRouter);
router.use(vulnerabilitiesRouter);
router.use(threatsRouter);
router.use(incidentsRouter);
router.use(aiAgentsRouter);
router.use(workflowsRouter);
router.use(complianceRouter);
router.use(reportsRouter);
router.use(auditRouter);
router.use(systemRouter);

export default router;
