import { Shell } from "@/components/layout/shell";
import { useListAssets, getListAssetsQueryKey, useCreateAsset } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Server, Search, Plus, Filter } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Assets() {
  const [search, setSearch] = useState("");
  const { data: assets, isLoading } = useListAssets();
  const queryClient = useQueryClient();
  const createAsset = useCreateAsset();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "server",
    criticality: 3,
    os: ""
  });

  const getCriticalityColor = (level: number) => {
    if (level === 5) return "bg-destructive/20 text-destructive border-destructive/50";
    if (level === 4) return "bg-chart-4/20 text-chart-4 border-chart-4/50";
    if (level === 3) return "bg-chart-2/20 text-chart-2 border-chart-2/50";
    return "bg-primary/20 text-primary border-primary/50";
  };

  const getCriticalityLabel = (level: number) => {
    if (level === 5) return "CRITICAL";
    if (level === 4) return "HIGH";
    if (level === 3) return "MEDIUM";
    return "LOW";
  };

  const filteredAssets = assets?.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.type.toLowerCase().includes(search.toLowerCase()) ||
    (a.ipAddresses && a.ipAddresses.some(ip => ip.includes(search)))
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createAsset.mutate({
      data: {
        name: formData.name,
        type: formData.type,
        criticality: Number(formData.criticality),
        os: formData.os,
        status: "active"
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
        setIsDialogOpen(false);
      }
    });
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-widest uppercase text-foreground flex items-center gap-3">
              <Server className="text-primary" /> Asset Inventory
            </h1>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider mt-1">Track and manage global endpoints</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="font-mono uppercase tracking-widest text-xs gap-2">
                <Plus size={14} /> Register Asset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register New Asset</DialogTitle>
                <DialogDescription>Add a new endpoint to the monitoring array.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 py-4 relative z-10">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase">Hostname</label>
                  <Input 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="e.g. prod-db-01" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase">Type</label>
                  <select 
                    className="flex h-9 w-full rounded-sm border border-input bg-background/50 px-3 py-1 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="server">Server</option>
                    <option value="endpoint">Endpoint</option>
                    <option value="cloud">Cloud</option>
                    <option value="network">Network</option>
                    <option value="database">Database</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase">Criticality (1-5)</label>
                  <Input 
                    type="number" 
                    min="1" max="5" 
                    required 
                    value={formData.criticality} 
                    onChange={e => setFormData({...formData, criticality: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase">OS</label>
                  <Input 
                    value={formData.os} 
                    onChange={e => setFormData({...formData, os: e.target.value})} 
                    placeholder="e.g. Linux" 
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createAsset.isPending}>
                    {createAsset.isPending ? "Registering..." : "Register"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by hostname, IP, or type..." 
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hostname</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Criticality</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets?.map((asset) => (
                <TableRow key={asset.id} className="group">
                  <TableCell className="font-medium text-foreground">
                    <Link href={`/assets/${asset.id}`} className="hover:text-primary transition-colors hover:underline underline-offset-4 flex items-center gap-2">
                      {asset.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{asset.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{asset.ipAddresses?.[0] || 'N/A'}</TableCell>
                  <TableCell className="text-muted-foreground">{asset.os || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] border ${getCriticalityColor(asset.criticality)}`}>
                      {getCriticalityLabel(asset.criticality)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${asset.status === 'active' ? 'bg-emerald-500 shadow-[0_0_5px_var(--emerald-500)]' : 'bg-muted-foreground'}`} />
                      <span className="text-xs text-muted-foreground uppercase">{asset.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/assets/${asset.id}`}>Inspect</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAssets?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No assets found matching parameters.
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
