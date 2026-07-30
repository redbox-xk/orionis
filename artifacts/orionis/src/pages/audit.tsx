import { Shell } from "@/components/layout/shell";
import { useListAuditLogs } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ListTodo, Activity } from "lucide-react";

export default function Audit() {
  const { data: logs, isLoading } = useListAuditLogs({ limit: 50 });

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-widest uppercase text-foreground flex items-center gap-3">
              <ListTodo className="text-muted-foreground" /> Audit Ledger
            </h1>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider mt-1">Immutable system activity record</p>
          </div>
        </div>

        <div className="border border-border rounded-sm bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>User / IP</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center"><Activity className="animate-pulse inline" /></TableCell>
                </TableRow>
              ) : logs?.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] bg-muted/30">{log.action}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-xs text-foreground">{log.resourceType}</div>
                    <div className="font-mono text-[10px] text-muted-foreground truncate max-w-[200px]">{log.resourceId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-xs text-foreground">{log.userId || 'SYSTEM'}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{log.ipAddress || 'Internal'}</div>
                  </TableCell>
                  <TableCell>
                    {log.success ? (
                      <span className="text-xs font-mono uppercase text-emerald-500">Success</span>
                    ) : (
                      <span className="text-xs font-mono uppercase text-destructive">Failed</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Shell>
  );
}
