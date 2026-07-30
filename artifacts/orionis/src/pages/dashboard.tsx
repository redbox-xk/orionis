import { useGetDashboardSummary, getGetDashboardSummaryQueryKey, useGetRecentActivity, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Activity, Target, AlertCircle, AlertOctagon, TrendingUp, CheckCircle2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: activities, isLoading: isLoadingActivities } = useGetRecentActivity({ query: { queryKey: getGetRecentActivityQueryKey() } });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 70) return "text-amber-500";
    return "text-destructive";
  };

  if (isLoadingSummary || !summary) {
    return (
      <Shell>
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-primary">
            <Activity className="h-8 w-8 animate-pulse" />
            <span className="font-mono text-sm tracking-widest uppercase">Fetching Telemetry...</span>
          </div>
        </div>
      </Shell>
    );
  }

  const vulnData = [
    { name: "Critical", value: summary.vulnerabilities.critical, color: "hsl(var(--destructive))" },
    { name: "High", value: summary.vulnerabilities.high, color: "hsl(var(--chart-4))" },
    { name: "Medium", value: summary.vulnerabilities.medium, color: "hsl(var(--chart-2))" },
    { name: "Low", value: summary.vulnerabilities.low, color: "hsl(var(--chart-5))" },
  ];

  const threatData = [
    { name: "Active", value: summary.threats.active, color: "hsl(var(--destructive))" },
    { name: "Investigating", value: summary.threats.investigating, color: "hsl(var(--chart-4))" },
    { name: "Resolved", value: summary.threats.resolved, color: "hsl(var(--chart-5))" },
  ];

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-widest uppercase text-foreground">Command Center</h1>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">Global Threat Telemetry & Status</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground font-mono uppercase">Global Security Score</span>
              <span className={`text-2xl font-bold font-mono ${getScoreColor(summary.securityScore)}`}>
                {summary.securityScore}/100
              </span>
            </div>
            <div className="h-10 w-10 rounded-full border-2 border-primary/20 flex items-center justify-center bg-primary/5">
              <Shield className={getScoreColor(summary.securityScore)} size={20} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card glow>
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-transparent">
              <CardTitle className="text-xs font-mono text-muted-foreground">Assets Monitored</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-foreground">{summary.assetsTotal}</div>
              <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">Total Endpoints</p>
            </CardContent>
          </Card>
          <Card glow>
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-transparent">
              <CardTitle className="text-xs font-mono text-muted-foreground">Active Threats</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-destructive">{summary.threats.active}</div>
              <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">Require Immediate Action</p>
            </CardContent>
          </Card>
          <Card glow>
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-transparent">
              <CardTitle className="text-xs font-mono text-muted-foreground">Open Incidents</CardTitle>
              <AlertOctagon className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-chart-4">{summary.incidents.open}</div>
              <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">In Progress: {summary.incidents.inProgress}</p>
            </CardContent>
          </Card>
          <Card glow>
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-transparent">
              <CardTitle className="text-xs font-mono text-muted-foreground">Compliance Avg</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-emerald-500">{summary.complianceAverage}%</div>
              <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">Across All Frameworks</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Vulnerability Distribution</CardTitle>
              <CardDescription>Severity breakdown across all assets</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vulnData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{fontFamily: 'var(--font-mono)', fontSize: 12}} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{fontFamily: 'var(--font-mono)', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {vulnData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Threat Status</CardTitle>
              <CardDescription>Current threat landscape</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={threatData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {threatData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {threatData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs font-mono text-muted-foreground uppercase">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Metrics</CardTitle>
              <CardDescription>MTTD vs MTTR tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 pt-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-mono text-muted-foreground uppercase">Mean Time to Detect (MTTD)</span>
                    <span className="text-lg font-bold font-mono text-primary">{summary.meanTimeToDetect}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[30%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-mono text-muted-foreground uppercase">Mean Time to Respond (MTTR)</span>
                    <span className="text-lg font-bold font-mono text-chart-4">{summary.meanTimeToRespond}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-chart-4 w-[60%]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Feed</CardTitle>
              <CardDescription>Latest system events</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] overflow-y-auto pr-2">
              {isLoadingActivities ? (
                <div className="flex items-center justify-center h-full">
                  <Activity className="h-6 w-6 animate-pulse text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {activities?.map((activity) => (
                    <div key={activity.id} className="flex gap-4 items-start pb-4 border-b border-border/50 last:border-0 last:pb-0">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        activity.severity === 'CRITICAL' ? 'bg-destructive shadow-[0_0_8px_var(--destructive)]' :
                        activity.severity === 'HIGH' ? 'bg-chart-4 shadow-[0_0_8px_var(--chart-4)]' :
                        activity.severity === 'MEDIUM' ? 'bg-chart-2' :
                        'bg-primary'
                      }`} />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">{activity.title}</p>
                          <span className="text-xs text-muted-foreground font-mono">{new Date(activity.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{activity.type}</Badge>
                          <span className="text-xs text-muted-foreground font-mono truncate">{activity.resourceId}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
