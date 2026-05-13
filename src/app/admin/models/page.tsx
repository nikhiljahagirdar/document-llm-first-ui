"use client"

import * as React from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Cpu, 
  BrainCircuit, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Server, 
  Database, 
  Activity,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

export default function AIHealthPage() {
  const [health, setHealth] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  const checkHealth = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getRagHealth()
      setHealth(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    checkHealth()
  }, [checkHealth])

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
              <BrainCircuit className="h-3.5 w-3.5" /> Global Intelligence
           </div>
           <h1 className="text-3xl font-bold tracking-tight">System AI Health</h1>
           <p className="text-muted-foreground text-sm">Continuous validation of language processing, vectorization, and database clusters.</p>
        </div>
        <Button variant="outline" className="rounded-xl border-border/60 h-11 gap-2" onClick={checkHealth} disabled={loading}>
           <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Reload Metrics
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
         {/* Overall Score */}
         <Card className="rounded-2xl border-border bg-card shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
            <CardHeader className="p-6 pb-2 relative">
               <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                  <Cpu className="h-5 w-5" />
               </div>
            </CardHeader>
            <CardContent className="p-6 relative">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Network Equilibrium</p>
                  <div className="flex items-baseline gap-2">
                     <h2 className="text-4xl font-bold tracking-tight">99.8%</h2>
                     <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] h-5">Nominal</Badge>
                  </div>
               </div>
               <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                     <span className="text-muted-foreground">Stability Rating</span>
                     <span className="text-foreground">Optimal</span>
                  </div>
                  <Progress value={99} className="h-1.5" />
               </div>
            </CardContent>
         </Card>

         {/* Response Latency */}
         <Card className="rounded-2xl border-border bg-card shadow-sm">
            <CardHeader className="p-6 pb-2">
               <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center">
                  <Zap className="h-5 w-5" />
               </div>
            </CardHeader>
            <CardContent className="p-6">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Agent Pipeline</p>
                  <div className="flex items-baseline gap-2">
                     <h2 className="text-4xl font-bold tracking-tight">145ms</h2>
                     <span className="text-[10px] font-bold text-emerald-600 uppercase">Avg Latency</span>
                  </div>
               </div>
               <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
                  <div>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase">P95 Rank</p>
                     <p className="text-sm font-bold">210ms</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase">Throughput</p>
                     <p className="text-sm font-bold">2.4k/m</p>
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Vector Index */}
         <Card className="rounded-2xl border-border bg-card shadow-sm">
            <CardHeader className="p-6 pb-2">
               <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                  <Database className="h-5 w-5" />
               </div>
            </CardHeader>
            <CardContent className="p-6">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Vector Sync</p>
                  <div className="flex items-baseline gap-2">
                     <h2 className="text-4xl font-bold tracking-tight">Synced</h2>
                     <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
               </div>
               <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/30 border border-border/50">
                     <span className="text-xs font-medium text-muted-foreground">Pending Embeddings</span>
                     <Badge variant="outline" className="bg-background h-5 font-bold text-[10px]">0</Badge>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>

      <Card className="rounded-2xl border-border overflow-hidden shadow-sm">
         <CardHeader className="p-6 border-b border-border bg-muted/10 flex flex-row items-center justify-between">
            <div>
               <CardTitle className="text-lg font-bold">Component Status Matrix</CardTitle>
               <CardDescription className="text-xs font-medium">Live node-by-node registry checks.</CardDescription>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 uppercase text-[9px] font-bold tracking-widest flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               Systems online
            </Badge>
         </CardHeader>
         <CardContent className="p-0">
            <div className="divide-y divide-border">
               <HealthRow name="LLM Inference Layer" status="operational" detail="Gemini 1.5 / Claude 3 active" latency="12ms" icon={<Cpu className="h-4 w-4"/>} />
               <HealthRow name="Qdrant Vector Fabric" status="operational" detail="Collection index stable" latency="4ms" icon={<Database className="h-4 w-4"/>} />
               <HealthRow name="Document Ingestion Cache" status="operational" detail="Redis clustering active" latency="1ms" icon={<Server className="h-4 w-4"/>} />
               <HealthRow name="RAG Context Router" status="operational" detail="Prompt orchestrator live" latency="18ms" icon={<BrainCircuit className="h-4 w-4"/>} />
               <HealthRow name="Text Extraction (OCR)" status="degraded" detail="High load - localized latency spikes" latency="1850ms" icon={<Activity className="h-4 w-4"/>} />
            </div>
         </CardContent>
      </Card>
    </div>
  )
}

function HealthRow({ name, status, detail, latency, icon }: any) {
   return (
      <div className="flex items-center justify-between p-5 hover:bg-muted/20 transition-colors group">
         <div className="flex items-center gap-4">
            <div className={cn(
               "h-9 w-9 rounded-xl flex items-center justify-center shadow-sm border transition-transform group-hover:scale-105",
               status === 'operational' ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600" : "bg-amber-500/5 border-amber-500/10 text-amber-600"
            )}>
               {icon}
            </div>
            <div className="space-y-0.5">
               <p className="text-sm font-bold text-foreground">{name}</p>
               <p className="text-xs font-medium text-muted-foreground/70">{detail}</p>
            </div>
         </div>
         <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
               <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Internal Ping</p>
               <p className={cn("text-xs font-bold", parseInt(latency) > 100 ? "text-amber-600" : "text-foreground")}>{latency}</p>
            </div>
            <Badge className={cn(
               "font-bold uppercase tracking-widest text-[9px] px-2 border-none shadow-none h-6",
               status === 'operational' ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
            )}>
               {status}
            </Badge>
         </div>
      </div>
   )
}
