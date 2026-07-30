import { Shell } from "@/components/layout/shell";
import { useListVulnerabilities, getListVulnerabilitiesQueryKey, useUpdateVulnerability } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, Search, ExternalLink, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Vulnerabilities() {
  const [search, setSearch] = useState("");
  const { data: vulns, isLoading } = useListVulnerabilities();
  const updateVuln = useUpdateVulnerability();
  const queryClient = useQueryClient();

  const filteredVulns = vulns?.filter(v => 
    v.title.toLowerCase().includes(search.toLowerCase()) || 
    (v.cveId && v.cveId.toLowerCase().includes(search.toLowerCase()))
  );

  const handleResolve = (id: string) => {
    updateVuln.mutate({ id, data: { status: "resolved" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListVulnerabilitiesQueryKey() });
      }
    });
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-widest uppercase text-foreground flex items-center gap-3">
              <ShieldAlert className="text-destructive" /> Vulnerability Matrix
            </h1>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider mt-1">Identified weaknesses across the fleet</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by CVE ID or title..." 
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CVE ID</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>CVSS</TableHead>
                <TableHead>Asset Link</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVulns?.map((vuln) => (
                <TableRow key={vuln.id} className={vuln.status === 'resolved' ? 'opacity-50' : ''}>
                  <TableCell className="font-medium font-mono text-primary whitespace-nowrap">
                    {vuln.cveId || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{vuln.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">{vuln.description}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      vuln.severity === 'CRITICAL' ? 'destructive' : 
                      vuln.severity === 'HIGH' ? 'warning' : 
                      vuln.severity === 'MEDIUM' ? 'secondary' : 'outline'
                    } className="text-[10px]">
                      {vuln.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{vuln.cvssScore?.toFixed(1) || '-'}</TableCell>
                  <TableCell>
                    {vuln.assetId ? (
                      <Link href={`/assets/${vuln.assetId}`} className="text-xs font-mono text-muted-foreground hover:text-primary flex items-center gap-1">
                        View Asset <ExternalLink size={10} />
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono uppercase text-muted-foreground">{vuln.status}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {vuln.status !== 'resolved' && (
                      <Button variant="outline" size="sm" onClick={() => handleResolve(vuln.id)} disabled={updateVuln.isPending} className="h-8 gap-1">
                        <CheckCircle2 size={14} className="text-emerald-500" /> Mark Resolved
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredVulns?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No vulnerabilities found matching parameters.
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
