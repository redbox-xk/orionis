import { Shell } from "@/components/layout/shell";
import { useGetSystemStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Server, Database, Bot, Activity } from "lucide-react";

export default function Settings() {
  const { data: status, isLoading } = useGetSystemStatus();

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-widest uppercase text-foreground flex items-center gap-3">
              <SettingsIcon className="text-muted-foreground" /> System Configuration
            </h1>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider mt-1">Platform status and parameters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" /> Core Services Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-10 bg-muted/50 rounded-sm" />
                  <div className="h-10 bg-muted/50 rounded-sm" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-3 border border-border/50 rounded-sm bg-muted/20">
                    <div className="flex items-center gap-3">
                      <Server className="text-primary h-5 w-5" />
                      <span className="font-mono text-sm uppercase">Main API Server</span>
                    </div>
                    <Badge variant={status?.services.api === 'operational' ? 'success' : 'destructive'}>
                      {status?.services.api}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border/50 rounded-sm bg-muted/20">
                    <div className="flex items-center gap-3">
                      <Database className="text-primary h-5 w-5" />
                      <span className="font-mono text-sm uppercase">Telemetry Database</span>
                    </div>
                    <Badge variant={status?.services.database === 'operational' ? 'success' : 'destructive'}>
                      {status?.services.database}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border/50 rounded-sm bg-muted/20">
                    <div className="flex items-center gap-3">
                      <Bot className="text-secondary h-5 w-5" />
                      <span className="font-mono text-sm uppercase">Agent Swarm Controller</span>
                    </div>
                    <Badge variant={status?.services.agents === 'operational' ? 'success' : 'destructive'}>
                      {status?.services.agents}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 font-mono text-sm">
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground uppercase">Platform Version</span>
                <span>{status?.version || 'Unknown'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground uppercase">System Uptime</span>
                <span>{status?.uptime ? Math.floor(status.uptime / 3600) + ' hours' : '0 hours'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground uppercase">Environment</span>
                <span className="text-primary">PRODUCTION</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
