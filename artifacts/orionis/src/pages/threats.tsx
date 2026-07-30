import { Shell } from "@/components/layout/shell";
import { useListThreats, getListThreatsQueryKey, useUpdateThreat } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertOctagon, Search, Shield, Crosshair } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function Threats() {
  const [search, setSearch] = useState("");
  const { data: threats, isLoading } = useListThreats();
  const updateThreat = useUpdateThreat();
  const queryClient = useQueryClient();

  const filteredThreats = threats?.filter(t => 
    t.threatId.toLowerCase().includes(search.toLowerCase()) || 
    (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
    (t.sourceIp && t.sourceIp.includes(search))
  );

  const handleUpdateStatus = (id: string, status: string) => {
    updateThreat.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListThreatsQueryKey() });
      }
    });
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-widest uppercase text-foreground flex items-center gap-3">
              <AlertOctagon className="text-chart-4" /> Threat Radar
            </h1>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider mt-1">Active actors and anomalies</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search threat ID, IP, or description..." 
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-2 border-chart-4 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Threat ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Source IP</TableHead>
                <TableHead>MITRE Tactics</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredThreats?.map((threat) => (
                <TableRow key={threat.id} className={threat.status === 'resolved' ? 'opacity-50' : ''}>
                  <TableCell className="font-medium font-mono text-foreground whitespace-nowrap">
                    {threat.threatId}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs uppercase font-mono text-muted-foreground">{threat.type}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      threat.severity === 'CRITICAL' ? 'destructive' : 
                      threat.severity === 'HIGH' ? 'warning' : 'outline'
                    } className="text-[10px]">
                      {threat.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {threat.sourceIp || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap max-w-[200px]">
                      {threat.mitreTechniques?.map(t => (
                        <Badge key={t} variant="secondary" className="text-[9px] px-1 py-0">{t}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        threat.status === 'active' ? 'bg-destructive animate-pulse' : 
                        threat.status === 'investigating' ? 'bg-chart-4' : 'bg-emerald-500'
                      }`} />
                      <span className="text-xs font-mono uppercase text-muted-foreground">{threat.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {threat.status === 'active' && (
                      <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(threat.id, 'investigating')} className="h-8 gap-1">
                        <Crosshair size={14} className="text-chart-4" /> Investigate
                      </Button>
                    )}
                    {threat.status === 'investigating' && (
                      <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(threat.id, 'resolved')} className="h-8 gap-1">
                        <Shield size={14} className="text-emerald-500" /> Resolve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredThreats?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No active threats detected.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </Shell>
  );
}
