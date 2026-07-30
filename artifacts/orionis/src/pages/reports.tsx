import { Shell } from "@/components/layout/shell";
import { useListReports, getListReportsQueryKey, useGenerateReport } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus, Download } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Reports() {
  const { data: reports, isLoading } = useListReports();
  const generateReport = useGenerateReport();
  const queryClient = useQueryClient();

  const handleGenerate = () => {
    generateReport.mutate({
      data: {
        title: `Security Summary ${new Date().toISOString().split('T')[0]}`,
        type: "executive_summary",
        format: "pdf"
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
      }
    });
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-widest uppercase text-foreground flex items-center gap-3">
              <FileText className="text-primary" /> Intelligence Reports
            </h1>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider mt-1">Generated analytics and summaries</p>
          </div>
          
          <Button onClick={handleGenerate} disabled={generateReport.isPending} className="font-mono uppercase tracking-widest text-xs gap-2">
            <Plus size={14} /> {generateReport.isPending ? 'Generating...' : 'Generate New'}
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Generated At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground font-mono">Scanning databanks...</TableCell>
                  </TableRow>
                ) : reports?.map(report => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium text-foreground">{report.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{report.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs uppercase text-muted-foreground">{report.format}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${report.status === 'completed' ? 'bg-emerald-500' : 'bg-chart-4 animate-pulse'}`} />
                        <span className="text-xs font-mono uppercase text-muted-foreground">{report.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {new Date(report.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" disabled={report.status !== 'completed'}>
                        <Download size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {reports?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No reports generated.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
