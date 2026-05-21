"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuthStore } from "@/lib/store"
import { motion } from "framer-motion"
import { 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  LayoutDashboard,
  BrainCircuit,
  ArrowUpRight,
  AlertTriangle,
  RefreshCw,
  Clock,
  ChevronRight,
  ExternalLink,
  Plus,
  Activity,
  Layers,
  Cpu
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn, formatDate } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function TenantAdminDashboard({ 
    fetchData, 
    loading, 
    docCount, 
    aiReportCount, 
    extractionRate,
    edgeLatency,
    summary, 
    documents,
    auditLogs, 
    errors 
}: any) {
  const { user } = useAuthStore()

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 pb-20 relative"
    >
      {/* Header Section */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full glass border border-primary/20 shadow-md shadow-primary/5">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />
                  <Sparkles className="h-3 w-3 text-primary relative z-10" />
                </div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.1em]">System Active</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1 rounded-full glass border border-emerald-500/20 shadow-md shadow-emerald-500/5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.1em]">Online</span>
             </div>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Dashboard <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-purple-600">Overview</span>
            </h1>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-muted/10 p-1.5 rounded-2xl border border-border/40 backdrop-blur-md">
          <Button 
            variant="ghost" 
            onClick={fetchData}
            className="rounded-xl h-10 w-10 p-0 hover:bg-background transition-all shadow-sm"
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4 text-muted-foreground", loading && "animate-spin")} />
          </Button>
          <Link href="/dashboard/documents">
            <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold text-[10px] uppercase tracking-[0.1em] h-10 px-6 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] group gap-2">
              <Plus className="h-3.5 w-3.5" />
              Upload
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Primary KPI Grid */}
      <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        <StatCard 
          title="Documents" 
          value={docCount.toLocaleString()} 
          sub="Total units"
          trend="+12.4%"
          icon={<Layers />} 
          loading={loading}
          color="blue"
        />
        <StatCard 
          title="Reports" 
          value={aiReportCount.toLocaleString()} 
          sub="Generated"
          trend="+84"
          icon={<Cpu />} 
          loading={loading}
          color="indigo"
        />
        <StatCard 
          title="Accuracy" 
          value={extractionRate} 
          sub="AI confidence"
          trend="Optimal"
          icon={<ShieldCheck />} 
          loading={loading}
          color="emerald"
        />
        <StatCard 
          title="Performance" 
          value={edgeLatency} 
          sub="Response time"
          trend="-2ms"
          icon={<Activity />} 
          loading={loading}
          color="amber"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-8 md:grid-cols-12 relative z-10">
        {/* Usage & Performance Area */}
        <motion.div variants={item} className="md:col-span-8">
          <Card className="rounded-2xl glass-card overflow-hidden flex flex-col h-full hover:shadow-2xl transition-all duration-500">
            <CardHeader className="p-6 pb-4 border-b border-border/50 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-bold tracking-tight">Usage Statistics</CardTitle>
                </div>
                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Resource utilization</CardDescription>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                <Activity className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8 flex-1">
              {loading ? (
                <div className="space-y-10 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-4">
                      <div className="flex justify-between w-full h-5 bg-muted rounded-xl" />
                      <div className="w-full h-3 bg-muted rounded-full" />
                    </div>
                  ))}
                </div>
              ) : summary.length > 0 ? (
                <div className="grid gap-14">
                  {summary.map((item: any, i: number) => (
                    <div key={i} className="space-y-4 group/item">
                      <div className="flex items-end justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 group-hover/item:text-primary transition-colors">{item.metric_name}</p>
                          <div className="flex items-baseline gap-2">
                             <span className="text-2xl font-bold tracking-tight text-foreground leading-none">{item.total_quantity.toLocaleString()}</span>
                             <span className="text-xs font-medium text-muted-foreground/50">/ {item.limit ? item.limit.toLocaleString() : 'Unlimited'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold tracking-tight text-foreground">{Math.round(item.usage_percent || 0)}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-muted/20 h-2 rounded-full overflow-hidden p-0.5 border border-border/20">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.usage_percent || 0}%` }}
                          transition={{ duration: 1.5, ease: "circOut" }}
                          className={cn(
                            "h-full rounded-full transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)]",
                            (item.usage_percent || 0) > 85 ? "bg-rose-500 shadow-rose-500/20" : "bg-primary"
                          )} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center border-2 border-dashed border-border/40 rounded-[2rem] bg-muted/5">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Waiting for data stream...</p>
                </div>
              )}
            </CardContent>
            <div className="p-8 bg-muted/10 border-t border-border/40 flex items-center justify-between">
               <div className="flex items-center gap-3 px-4 py-2 rounded-full glass border border-emerald-500/10">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/80">Compute Stable</span>
               </div>
               <Link href="/dashboard/billing">
                  <Button variant="ghost" className="h-11 px-6 text-[10px] font-black uppercase tracking-[0.3em] gap-3 hover:bg-primary/5 hover:text-primary transition-all rounded-xl">
                    Expand Quota <ChevronRight className="h-4 w-4" />
                  </Button>
               </Link>
            </div>
          </Card>
        </motion.div>

        {/* Activity Feed Section */}
        <motion.div variants={item} className="md:col-span-4">
          <Card className="rounded-2xl glass-card overflow-hidden flex flex-col h-full hover:shadow-2xl transition-all duration-500">
            <CardHeader className="p-6 pb-4 border-b border-border/50">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/10">
                  <Clock className="h-4 w-4" />
                </div>
                <CardTitle className="text-lg font-bold tracking-tight">Activity Log</CardTitle>
              </div>
              <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Recent system events</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-[400px]">
                <div className="p-6 space-y-8">
                  {loading ? (
                    <div className="space-y-8 animate-pulse">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex gap-6">
                          <div className="w-1 h-12 bg-muted rounded-full" />
                          <div className="flex-1 space-y-3">
                            <div className="h-5 bg-muted rounded-lg w-3/4" />
                            <div className="h-4 bg-muted rounded-lg w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : auditLogs.length > 0 ? (
                    auditLogs.map((log: any) => (
                      <ActivityItem 
                        key={log.log_id}
                        title={log.action.replace(/_/g, ' ')} 
                        time={new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                        status="SECURE" 
                        type={log.resource_type || "SYS"}
                      />
                    ))
                  ) : (
                    <div className="py-24 text-center opacity-20">
                      <p className="text-[11px] font-black uppercase tracking-[0.4em]">Signal Void</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <div className="p-4 bg-muted/10 border-t border-border/50 mt-auto">
              <Link href="/dashboard/logs" className="block">
                <Button variant="outline" className="w-full h-10 rounded-xl font-bold text-[10px] uppercase tracking-wider border-border/60 bg-background/50">
                  View Activity Log
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Modern Horizontal Documents Roll */}
      <motion.div variants={item} className="space-y-6 relative z-10">
        <div className="flex items-end justify-between px-1">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">Recent Documents</h2>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Lately synchronized assets</p>
          </div>
          <Link href="/dashboard/documents">
             <Button variant="ghost" className="text-primary font-bold text-[10px] uppercase tracking-wider gap-2 h-8 px-3 transition-all">
               View All <ChevronRight className="h-3.5 w-3.5" />
             </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
           {loading ? (
             Array.from({ length: 4 }).map((_, i) => (
               <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
             ))
           ) : documents && documents.length > 0 ? (
             documents.slice(0, 4).map((doc: any) => (
               <Link key={doc.document_id} href={`/dashboard/documents/${doc.document_id}`}>
                 <Card className="p-5 glass-card hover:bg-white/40 dark:hover:bg-white/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer h-full flex flex-col justify-between rounded-xl">
                   <div className="space-y-4">
                     <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                        <FileText className="h-5 w-5 stroke-[1.5px]" />
                     </div>
                     <div className="space-y-1.5">
                       <p className="font-bold text-sm truncate tracking-tight text-foreground/90">{doc.filename}</p>
                       <div className="flex flex-wrap gap-1.5">
                          {doc.industry_name && (
                            <Badge variant="outline" className="h-5 px-2 text-[9px] font-bold border-primary/20 text-primary bg-primary/5">
                              {doc.industry_name}
                            </Badge>
                          )}
                       </div>
                     </div>
                   </div>
                   <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                      <span className="text-[9px] font-medium text-muted-foreground/50 uppercase tracking-wider">{formatDate(doc.upload_date || doc.created_on)}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                   </div>
                 </Card>
               </Link>
             ))
           ) : (
             <div className="col-span-4 py-16 text-center border-2 border-dashed border-border rounded-2xl bg-muted/5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">No documents found</p>
             </div>
           )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function StatCard({ title, value, sub, trend, icon, loading, color }: any) {
  const colorMap: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20"
  }

  return (
    <Card className="rounded-xl glass-card p-5 space-y-4 relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 duration-300">
      <div className="flex items-center justify-between">
        <div className={cn("w-10 h-10 flex items-center justify-center rounded-lg border shadow-sm", colorMap[color])}>
          {React.cloneElement(icon, { className: "h-5 w-5 stroke-[2px]" })}
        </div>
        <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
          {trend}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{title}</p>
        {loading ? (
          <div className="h-8 w-20 bg-muted rounded-md animate-pulse" />
        ) : (
          <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
        )}
        <p className="text-[10px] font-medium text-muted-foreground/60">{sub}</p>
      </div>
    </Card>
  )
}

function ActivityItem({ title, time, status, type }: any) {
  return (
    <div className="flex gap-8 group cursor-pointer items-start">
      <div className="relative flex flex-col items-center pt-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-primary ring-[6px] ring-primary/10 z-10 group-hover:scale-125 transition-transform duration-500" />
        <div className="w-[1px] h-20 bg-border/40 absolute top-2.5 group-last:hidden" />
      </div>
      <div className="flex-1 min-w-0 pb-2">
        <div className="flex items-center justify-between gap-6">
          <p className="font-black text-[15px] truncate uppercase tracking-tight text-foreground/80 group-hover:text-primary transition-colors duration-500">{title}</p>
          <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest shrink-0">{time}</span>
        </div>
        <div className="flex items-center gap-5 mt-3">
          <Badge variant="secondary" className="text-[9px] font-black h-6 px-3 bg-muted/30 border-border/40 uppercase tracking-[0.2em] text-muted-foreground/60 rounded-lg">{type}</Badge>
          <div className="flex items-center gap-2.5">
             <div className="w-2 h-2 rounded-full bg-emerald-500/40 animate-pulse" />
             <span className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.3em]">{status}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
