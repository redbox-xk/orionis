import { Shell } from "@/components/layout/shell";
import { useListAiAgents, getListAiAgentsQueryKey, useQueryAiAgent } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Terminal, Activity, Send, CheckCircle2, ChevronRight, MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function AiAgents() {
  const { data: agents, isLoading } = useListAiAgents();
  const queryAi = useQueryAiAgent();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [queryText, setQueryText] = useState("");
  const [chatLog, setChatLog] = useState<{role: 'user' | 'agent', content: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLog]);

  const handleQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim() || !selectedAgent) return;

    const userMessage = queryText;
    setChatLog(prev => [...prev, { role: 'user', content: userMessage }]);
    setQueryText("");

    queryAi.mutate({
      data: {
        agentType: selectedAgent,
        query: userMessage
      }
    }, {
      onSuccess: (res) => {
        setChatLog(prev => [...prev, { role: 'agent', content: res.response }]);
      },
      onError: () => {
        setChatLog(prev => [...prev, { role: 'agent', content: "Error: Communications link severed." }]);
      }
    });
  };

  const getAgentColor = (state: string) => {
    if (state === 'acting') return 'text-destructive';
    if (state === 'thinking') return 'text-chart-4';
    return 'text-emerald-500';
  };

  return (
    <Shell>
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4 shrink-0">
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-widest uppercase text-foreground flex items-center gap-3">
              <Bot className="text-secondary" /> AI Agent Swarm
            </h1>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider mt-1">Autonomous security operatives</p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 overflow-hidden">
          <div className="lg:col-span-1 overflow-y-auto space-y-4 pr-2">
            {isLoading ? (
              <div className="flex justify-center p-8"><Activity className="animate-pulse" /></div>
            ) : (
              agents?.map(agent => (
                <Card 
                  key={agent.id} 
                  glow 
                  className={`cursor-pointer transition-all ${selectedAgent === agent.type ? 'border-primary shadow-[0_0_15px_rgba(0,255,255,0.1)]' : 'hover:border-primary/50'}`}
                  onClick={() => setSelectedAgent(agent.type)}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <Terminal size={14} className="text-muted-foreground" />
                        {agent.name}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${agent.state === 'idle' ? 'bg-emerald-500' : 'bg-chart-4 animate-pulse'}`} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground font-mono mb-2 uppercase">Type: {agent.type}</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.slice(0,3).map(cap => (
                        <Badge key={cap} variant="outline" className="text-[9px]">{cap}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="lg:col-span-2 h-full flex flex-col border border-border/50 rounded-sm bg-card/30 overflow-hidden relative">
            <div className="scanlines" />
            
            {selectedAgent ? (
              <>
                <div className="h-12 border-b border-border/50 flex items-center px-4 shrink-0 bg-muted/20 relative z-10">
                  <span className="font-mono text-sm text-primary uppercase tracking-widest flex items-center gap-2">
                    <ChevronRight size={14} /> Link established: {agents?.find(a => a.type === selectedAgent)?.name}
                  </span>
                </div>
                
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
                  {chatLog.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground font-mono text-sm gap-2">
                      <MessageSquare size={24} className="opacity-50" />
                      Awaiting operator input...
                    </div>
                  )}
                  {chatLog.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-sm p-3 font-mono text-sm ${
                        msg.role === 'user' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted/50 text-foreground border border-border/50'
                      }`}>
                        <span className="text-[10px] uppercase opacity-50 block mb-1">{msg.role === 'user' ? 'Operator' : selectedAgent}</span>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {queryAi.isPending && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-sm p-3 font-mono text-sm bg-muted/50 text-foreground border border-border/50 flex items-center gap-2">
                        <div className="w-2 h-2 bg-chart-4 rounded-full animate-ping" />
                        Processing query...
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-border/50 bg-background shrink-0 relative z-10">
                  <form onSubmit={handleQuery} className="flex gap-2">
                    <Input 
                      value={queryText}
                      onChange={e => setQueryText(e.target.value)}
                      placeholder="Enter command directive..."
                      className="font-mono"
                      disabled={queryAi.isPending}
                    />
                    <Button type="submit" size="icon" disabled={queryAi.isPending || !queryText.trim()}>
                      <Send size={16} />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground font-mono text-sm gap-4 p-8 text-center z-10">
                <Bot size={48} className="opacity-20" />
                Select an autonomous agent from the swarm panel to establish a communications link.
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
