import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  ShieldAlert,
  Activity,
  Server,
  AlertTriangle,
  Siren,
  Bot,
  FileCheck,
  FileText,
  ListTodo,
  Settings,
  LogOut,
  Hexagon
} from "lucide-react";
import { useGetSystemStatus } from "@workspace/api-client-react";

export function Sidebar() {
  const [location] = useLocation();
  const { data: status } = useGetSystemStatus();

  const navItems = [
    { label: "Dashboard", href: "/", icon: Activity },
    { label: "Assets", href: "/assets", icon: Server },
    { label: "Vulnerabilities", href: "/vulnerabilities", icon: AlertTriangle },
    { label: "Threats", href: "/threats", icon: ShieldAlert },
    { label: "Incidents", href: "/incidents", icon: Siren },
    { label: "AI Agents", href: "/ai-agents", icon: Bot },
    { label: "Compliance", href: "/compliance", icon: FileCheck },
    { label: "Reports", href: "/reports", icon: FileText },
    { label: "Audit Log", href: "/audit", icon: ListTodo },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col w-64 border-r border-border bg-sidebar shrink-0 h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-border/50 gap-3">
        <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center rounded-sm text-primary shadow-[0_0_15px_rgba(0,255,255,0.1)] relative overflow-hidden">
          <Hexagon size={18} className="absolute opacity-20" />
          <Hexagon size={24} className="animate-[spin_10s_linear_infinite]" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-widest text-primary font-mono leading-tight">ORIONIS</span>
          <span className="text-[10px] text-primary/60 uppercase tracking-widest leading-tight">AI-SecOS v2.4</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        <div className="text-xs font-mono text-muted-foreground mb-2 px-3 uppercase tracking-wider">System Modules</div>
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-sm font-mono text-sm transition-all duration-200 group relative",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full shadow-[0_0_8px_var(--primary)]" />
              )}
              <item.icon size={16} className={cn("transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border/50 bg-muted/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className={cn("w-2.5 h-2.5 rounded-full", status?.status === "operational" ? "bg-emerald-500 shadow-[0_0_8px_var(--emerald-500)]" : "bg-amber-500 shadow-[0_0_8px_var(--amber-500)]")} />
            {status?.status === "operational" && <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-mono">System Status</span>
            <span className="text-sm font-mono text-foreground capitalize">{status?.status || "Connecting..."}</span>
          </div>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2 w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm font-mono text-sm transition-colors"
        >
          <LogOut size={16} />
          Disconnect
        </Link>
      </div>
    </div>
  );
}
