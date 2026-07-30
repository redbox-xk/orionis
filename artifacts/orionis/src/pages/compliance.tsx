import { Shell } from "@/components/layout/shell";
import { useListComplianceFrameworks, getListComplianceFrameworksQueryKey, useGetComplianceSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCheck, ShieldCheck, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Compliance() {
  const { data: frameworks, isLoading: isLoadingFrameworks } = useListComplianceFrameworks();
  const { data: summary, isLoading: isLoadingSummary } = useGetComplianceSummary();

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 70) return "text-chart-4";
    return "text-destructive";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-emerald-500";
    if (score >= 70) return "bg-chart-4";
    return "bg-destructive";
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-widest uppercase text-foreground flex items-center gap-3">
              <FileCheck className="text-emerald-500" /> Compliance Posture
            </h1>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider mt-1">Regulatory framework alignment</p>
          </div>
          
          <div className="flex flex-col items-end">
             <span className="text-xs text-muted-foreground font-mono uppercase">Overall Readiness</span>
             <span className={`text-2xl font-bold font-mono ${summary ? getScoreColor(summary.overallScore) : ''}`}>
               {summary?.overallScore || 0}%
             </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingFrameworks ? (
            <div className="col-span-full flex justify-center p-12">
               <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            frameworks?.map(fw => (
              <Card key={fw.id} glow>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span className="font-mono text-lg">{fw.name}</span>
                    <Badge variant={fw.score >= 90 ? 'success' : fw.score >= 70 ? 'warning' : 'destructive'}>
                      {fw.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">{fw.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-3xl font-bold font-mono text-foreground">{fw.score}%</span>
                    <span className="text-xs font-mono text-muted-foreground uppercase">{fw.compliantControls} / {fw.totalControls} Controls</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${getScoreBg(fw.score)}`} style={{ width: `${fw.score}%` }} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Shell>
  );
}
