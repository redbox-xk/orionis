import { Shell } from "@/components/layout/shell";
import { useGetIncident, getGetIncidentQueryKey, useUpdateIncident } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Siren, ArrowLeft, Bot, Shield, Clock } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

export default function IncidentDetail() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  
  const { data: incident, isLoading } = useGetIncident(id, { query: { enabled: !!id, queryKey: getGetIncidentQueryKey(id) } });
  const updateIncident = useUpdateIncident();

  const handleStatusChange = (status: string) => {
    updateIncident.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetIncidentQueryKey(id) });
      }
    });
  };

  if (isLoading) {
    return (
      <Shell>
        <div className="flex h-full items-center justify-center">
          <div className="w-8 h-8 border-2 border-chart-3 border-t-transparent rounded-full animate-spin" />
        </div>
      </Shell>
    );
  }

  if (!incident) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <Siren className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-mono text-muted-foreground">Incident Not Found</h2>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-border/50 pb-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/incidents"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono tracking-widest text-foreground">{incident.title}</h1>
              <Badge variant={incident.severity === 'CRITICAL' ? 'destructive' : 'warning'}>{incident.severity}</Badge>
              <Badge variant="outline" className="border-primary text-primary">{incident.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider mt-1">INC-{incident.id.substring(0,8)}</p>
          </div>
          <div className="flex gap-2">
            {incident.status === 'open' && (
              <Button size="sm" variant="outline" onClick={() => handleStatusChange('in_progress')} disabled={updateIncident.isPending}>
                Start Investigation
              </Button>
            )}
            {incident.status !== 'closed' && (
              <Button size="sm" variant="secondary" onClick={() => handleStatusChange('closed')} disabled={updateIncident.isPending}>
                Close Incident
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card glow>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Shield className="h-4 w-4" /> Incident Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed">{incident.description || "No description provided."}</p>
                <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-mono block mb-1">Category</span>
                    <span className="font-mono text-sm">{incident.category || 'Uncategorized'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-mono block mb-1">Assigned To</span>
                    <span className="font-mono text-sm">{incident.assignedTo || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-mono block mb-1">Created At</span>
                    <span className="font-mono text-sm">{new Date(incident.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-mono block mb-1">Affected Assets</span>
                    <span className="font-mono text-sm">{incident.affectedAssets?.length || 0} targets</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-secondary/30 bg-secondary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-secondary">
                  <Bot className="h-4 w-4" /> AI Analysis
                </CardTitle>
                <CardDescription>Automated contextual breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {incident.aiAnalysis ? (
                  <div className="space-y-4 text-sm font-mono">
                    <p className="text-secondary/80">Analysis complete. Confidence score: 87%</p>
                    <pre className="bg-background/50 p-4 rounded-sm overflow-x-auto text-xs text-muted-foreground border border-secondary/20">
                      {JSON.stringify(incident.aiAnalysis, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-sm font-mono text-muted-foreground italic flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary animate-pulse rounded-full" />
                    AI analysis pending...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" /> Response Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {incident.responsePlan ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none font-mono text-xs">
                    {incident.responsePlan}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground font-mono">
                    No structured response plan generated yet. Request AI Analyst to draft a playbook.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Shell>
  );
}
