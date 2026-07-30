import { useState } from "react";
import { useLocation } from "wouter";
import { Hexagon, Lock, Shield, Cpu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLocation("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center relative overflow-hidden text-foreground font-mono">
      <div className="scanlines" />
      
      {/* Background decorations */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-[20%] left-[20%] w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[30rem] h-[30rem] bg-secondary/20 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-md p-8 relative">
        {/* Decorative corner brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/50" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/50" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/50" />

        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary/10 border border-primary/30 flex items-center justify-center rounded-sm text-primary mb-6 relative shadow-[0_0_30px_rgba(0,255,255,0.15)]">
            <Hexagon size={48} className="animate-[spin_10s_linear_infinite]" />
            <Shield size={24} className="absolute" />
          </div>
          <h1 className="text-3xl font-bold tracking-[0.3em] text-primary mb-2 uppercase">Orionis</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest text-center">Autonomous Security Operating System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Cpu className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <Input
                type="text"
                placeholder="OPERATOR ID"
                className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary uppercase placeholder:text-muted-foreground/50"
                required
              />
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <Input
                type="password"
                placeholder="AUTHENTICATION TOKEN"
                className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary placeholder:text-muted-foreground/50 tracking-widest"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-sm tracking-[0.2em] uppercase"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              "Initialize Session"
            )}
          </Button>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-muted-foreground/40 font-mono tracking-widest">
              UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
