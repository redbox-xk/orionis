import { Shell } from "@/components/layout/shell";
import { Link, Route, Switch } from "wouter";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Assets from "@/pages/assets";
import AssetDetail from "@/pages/asset-detail";
import Vulnerabilities from "@/pages/vulnerabilities";
import Threats from "@/pages/threats";
import Incidents from "@/pages/incidents";
import IncidentDetail from "@/pages/incident-detail";
import AiAgents from "@/pages/ai-agents";
import Compliance from "@/pages/compliance";
import Reports from "@/pages/reports";
import Audit from "@/pages/audit";
import Settings from "@/pages/settings";

const NotFound = () => (
  <Shell>
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-6xl font-bold text-primary mb-4 font-mono">404</h1>
      <p className="text-xl text-muted-foreground mb-8 font-mono uppercase tracking-widest">Sector Not Found</p>
      <Link href="/" className="text-primary hover:underline font-mono border border-primary px-4 py-2 rounded-sm hover:bg-primary/10 transition-colors">Return to Dashboard</Link>
    </div>
  </Shell>
);

export default function App() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/assets" component={Assets} />
      <Route path="/assets/:id" component={AssetDetail} />
      <Route path="/vulnerabilities" component={Vulnerabilities} />
      <Route path="/threats" component={Threats} />
      <Route path="/incidents" component={Incidents} />
      <Route path="/incidents/:id" component={IncidentDetail} />
      <Route path="/ai-agents" component={AiAgents} />
      <Route path="/compliance" component={Compliance} />
      <Route path="/reports" component={Reports} />
      <Route path="/audit" component={Audit} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}
