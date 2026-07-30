import { Shell } from "@/components/layout/shell";
import { useGetAsset, getGetAssetQueryKey, useListVulnerabilities, useDeleteAsset } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Server, Activity, ArrowLeft, ShieldAlert, Cpu, Network, Clock, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export default function AssetDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const id = params.id as string;
  const queryClient = useQueryClient();
  
  const { data: asset, isLoading: isLoadingAsset } = useGetAsset(id, { query: { enabled: !!id, queryKey: getGetAssetQueryKey(id) } });
  const { data: vulns, isLoading: isLoadingVulns } = useListVulnerabilities({ assetId: id });
  const deleteAsset = useDeleteAsset();

  if (isLoadingAsset) {
    return (
      <Shell>
        <div className="flex h-full items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Shell>
    );
  }

  if (!asset) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <Server className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-mono text-muted-foreground">Asset Not Found</h2>
          <Button asChild variant="outline">
            <Link href="/assets">Return to Inventory</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to decomission this asset?")) {
      deleteAsset.mutate({ id }, {
        onSuccess: () => {
          setLocation("/assets");
        }
      });
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-border/50 pb-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/assets"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono tracking-widest text-foreground">{asset.name}</h1>
              <Badge variant={asset.status === 'active' ? 'success' : 'outline'}>{asset.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider mt-1">Asset ID: {asset.id}</p>
          </div>
          <Button variant="destructive" size="sm" className="gap-2 font-mono" onClick={handleDelete} disabled={deleteAsset.isPending}>
            <Trash2 size={14} /> Decommission
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card glow>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" /> System Specs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <span className="text-xs text-muted-foreground uppercase font-mono">Type</span>
                  <span className="text-sm font-mono">{asset.type}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <span className="text-xs text-muted-foreground uppercase font-mono">OS</span>
                  <span className="text-sm font-mono">{asset.os || 'Unknown'} {asset.version}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <span className="text-xs text-muted-foreground uppercase font-mono">Criticality</span>
                  <span className="text-sm font-mono font-bold text-primary">{asset.criticality}/5</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <span className="text-xs text-muted-foreground uppercase font-mono">Discovered</span>
                  <span className="text-xs font-mono">{new Date(asset.discoveredAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card glow>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-primary" /> Networking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <span className="text-xs text-muted-foreground uppercase font-mono">Hostname</span>
                  <span className="text-sm font-mono">{asset.hostname || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-mono block mb-2">IP Addresses</span>
                  {asset.ipAddresses?.length ? (
                    <div className="space-y-1">
                      {asset.ipAddresses.map(ip => (
                        <div key={ip} className="text-sm font-mono bg-muted/30 p-1.5 rounded-sm border border-border/50 text-center">{ip}</div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm font-mono text-muted-foreground">None detected</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-destructive" /> Associated Vulnerabilities
                </CardTitle>
                <Badge variant="outline">{vulns?.length || 0} Found</Badge>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingVulns ? (
                  <div className="p-8 text-center text-muted-foreground">Scanning...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>CVE / Title</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>CVSS</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vulns?.map(vuln => (
                        <TableRow key={vuln.id}>
                          <TableCell>
                            <div className="font-mono text-sm text-foreground">{vuln.cveId || 'Unknown CVE'}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">{vuln.title}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              vuln.severity === 'CRITICAL' ? 'destructive' : 
                              vuln.severity === 'HIGH' ? 'warning' : 'outline'
                            } className="text-[10px]">
                              {vuln.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{vuln.cvssScore?.toFixed(1) || '-'}</TableCell>
                          <TableCell>
                            <span className="text-xs font-mono uppercase text-muted-foreground">{vuln.status}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {vulns?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No known vulnerabilities detected for this asset.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Shell>
  );
}
