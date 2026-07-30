import { Shell } from "@/components/layout/shell";
import { useListIncidents, getListIncidentsQueryKey, useCreateIncident } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Siren, Search, Plus, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Incidents() {
  const [search, setSearch] = useState("");
  const { data: incidents, isLoading } = useListIncidents();
  const queryClient = useQueryClient();
  const createIncident = useCreateIncident();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    severity: "HIGH",
    category: "network",
    description: ""
  });

  const filteredIncidents = incidents?.filter(i => 
    i.title.toLowerCase().includes(search.toLowerCase()) || 
    (i.category && i.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createIncident.mutate({
      data: {
        title: formData.title,
        severity: formData.severity,
        category: formData.category,
        description: formData.description
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListIncidentsQueryKey() });
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
              <Siren className="text-chart-3" /> Incident Response
            </h1>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider mt-1">Manage active security breaches</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="font-mono uppercase tracking-widest text-xs gap-2">
                <Plus size={14} /> Declare Incident
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-destructive">Declare Security Incident</DialogTitle>
                <DialogDescription>Open a new incident ticket for immediate response.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 py-4 relative z-10">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase">Incident Title</label>
                  <Input 
                    required 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    placeholder="e.g. Unauthorized access on DB-01" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase">Severity</label>
                  <select 
                    className="flex h-9 w-full rounded-sm border border-input bg-background/50 px-3 py-1 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={formData.severity}
                    onChange={e => setFormData({...formData, severity: e.target.value})}
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase">Category</label>
                  <Input 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    placeholder="e.g. malware, intrusion, data-leak" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase">Description</label>
                  <Input 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="destructive" disabled={createIncident.isPending}>
                    {createIncident.isPending ? "Declaring..." : "Declare Incident"}
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
              placeholder="Search incidents..." 
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-2 border-chart-3 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents?.map((incident) => (
                <TableRow key={incident.id} className={incident.status === 'closed' ? 'opacity-50' : 'group'}>
                  <TableCell className="font-medium text-foreground">
                    <Link href={`/incidents/${incident.id}`} className="hover:text-primary transition-colors hover:underline underline-offset-4 flex flex-col">
                      <span>{incident.title}</span>
                      <span className="text-xs text-muted-foreground font-mono">{incident.id.substring(0,8)}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs uppercase font-mono text-muted-foreground">{incident.category}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      incident.severity === 'CRITICAL' ? 'destructive' : 
                      incident.severity === 'HIGH' ? 'warning' : 'outline'
                    } className="text-[10px]">
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        incident.status === 'open' ? 'bg-destructive animate-pulse' : 
                        incident.status === 'in_progress' ? 'bg-chart-4' : 'bg-muted-foreground'
                      }`} />
                      <span className="text-xs font-mono uppercase text-muted-foreground">{incident.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/incidents/${incident.id}`}>Manage <ExternalLink size={12} className="ml-1" /></Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredIncidents?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No incidents matching parameters.
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
