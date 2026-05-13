"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Users, 
  Building2, 
  CreditCard, 
  Activity, 
  ShieldCheck, 
  Globe, 
  Server,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Cpu,
  Zap,
  Box,
  LayoutDashboard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import * as Types from "@/types/api"
import { TelemetryChart } from "@/components/dashboard/telemetry-chart"
import { motion } from "framer-motion"

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

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = React.useState<Types.AdminMetrics | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [cpuHistory, setCpuHistory] = React.useState<number[]>(Array(20).fill(0))
  const [memHistory, setMemHistory] = React.useState<number[]>(Array(20).fill(0))

  const fetchMetrics = React.useCallback(async () => {
    try {
      const data = await api.getAdminMetrics()
      setMetrics(data)
      
      setCpuHistory(prev => [...prev.slice(1), data.system_health.cpu_load + (Math.random() * 2 - 1)])
      setMemHistory(prev => [...prev.slice(1), data.system_health.memory_usage + (Math.random() * 2 - 1)])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 3000)
    return () => clearInterval(interval)
  }, [fetchMetrics])

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 pb-20"
    >
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/20 shadow-2xl shadow-primary/10">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Platform Core Locked</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-indigo-500/20 shadow-2xl shadow-indigo-500/5">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Cluster Stable</span>
             </div>
          </div>
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-[0.9]">
              Admin <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600">Command</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-muted/10 p-2 rounded-3xl border border-border/40 backdrop-blur-md">
          <Button variant="ghost" className="rounded-2xl h-14 px-8 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-background transition-all">
            <Globe className="h-4 w-4 mr-3" /> Network Map
          </Button>
          <Button className="rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-black text-[10px] uppercase tracking-[0.2em] h-14 px-10 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.95]">
            Export System Log
          </Button>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Organizations" 
          value={metrics?.total_tenants.toLocaleString() || "..."} 
          change="+12%" 
          trend="up" 
          icon={<Building2 />} 
          loading={loading}
          color="blue"
        />
        <StatCard 
          title="Global Users" 
          value={metrics?.total_users.toLocaleString() || "..."} 
          change="+18%" 
          trend="up" 
          icon={<Users />} 
          loading={loading}
          color="indigo"
        />
        <StatCard 
          title="MRR Forecast" 
          value={metrics ? `$${(metrics.revenue_summary.monthly * 12 / 1000).toFixed(1)}k` : "..."} 
          change={`+${metrics?.revenue_summary.growth_percent || 0}%`} 
          trend="up" 
          icon={<TrendingUp />} 
          loading={loading}
          color="emerald"
        />
        <StatCard 
          title="Node Cluster" 
          value={metrics?.system_health.active_nodes.toString() || "..."} 
          change="SECURE" 
          trend="up" 
          icon={<Box />} 
          loading={loading}
          color="purple"
        />
      </motion.div>

      <div className="grid gap-8 md:grid-cols-12">
        <motion.div variants={item} className="md:col-span-8">
          <Card className="rounded-[2.5rem] border-border/40 bg-background/40 backdrop-blur-3xl shadow-2xl overflow-hidden flex flex-col h-full">
            <CardHeader className="p-10 pb-8 border-b border-border/40 flex flex-row items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  <CardTitle className="text-2xl font-black tracking-tight uppercase tracking-[0.05em]">Global Telemetry</CardTitle>
                </div>
                <CardDescription className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Distributed Resource Allocation</CardDescription>
              </div>
              <BarChart3 className="h-12 w-12 text-indigo-500/20" />
            </CardHeader>
            <CardContent className="p-10 flex-1 space-y-12">
              <div className="grid md:grid-cols-2 gap-16">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">CPU Core Load</p>
                    <Badge variant="outline" className="text-[10px] font-black border-indigo-500/20 text-indigo-500 bg-indigo-500/5">{metrics?.system_health.cpu_load}%</Badge>
                  </div>
                  <div className="h-[200px] w-full">
                    <TelemetryChart data={cpuHistory} label="CPU" color="rgb(99, 102, 241)" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Memory Pipeline</p>
                    <Badge variant="outline" className="text-[10px] font-black border-emerald-500/20 text-emerald-500 bg-emerald-500/5">{metrics?.system_health.memory_usage}%</Badge>
                  </div>
                  <div className="h-[200px] w-full">
                    <TelemetryChart data={memHistory} label="MEM" color="rgb(16, 185, 129)" />
                  </div>
                </div>
              </div>
              
              <div className="pt-10 border-t border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-10">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Vector Compute</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Buffer Stream</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-full glass border border-emerald-500/10">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/80">Core Synchronized</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="md:col-span-4">
          <Card className="rounded-[2.5rem] border-border/40 bg-background/40 backdrop-blur-3xl shadow-2xl overflow-hidden flex flex-col h-full">
            <CardHeader className="p-10 pb-8 border-b border-border/40">
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
                   <AlertTriangle className="h-5 w-5" />
                 </div>
                 <CardTitle className="text-2xl font-black tracking-tight uppercase tracking-[0.05em]">Critical Events</CardTitle>
              </div>
              <CardDescription className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Platform Intervention Required</CardDescription>
            </CardHeader>
            <CardContent className="p-10 flex-1 space-y-10">
              <AlertItem 
                type="error" 
                title="Node Latency Drift" 
                desc="EU-West-1 cluster reporting 250ms+ lag." 
                time="2m ago" 
              />
              <AlertItem 
                type="warning" 
                title="Quota Threshold" 
                desc="Storage reaching 92% capacity globally." 
                time="15m ago" 
              />
              <AlertItem 
                type="info" 
                title="Sync Handshake" 
                desc="Aura Tech initialized multi-node sync." 
                time="1h ago" 
              />
              <AlertItem 
                type="success" 
                title="Patch Deployed" 
                desc="Version 4.2.8 active across all nodes." 
                time="3h ago" 
              />
            </CardContent>
            <div className="p-8 bg-muted/10 border-t border-border/40">
              <Link href="/admin/logs" className="w-full">
                <Button variant="outline" className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] border-border/60 bg-background/50 hover:bg-foreground hover:text-background transition-all shadow-xl shadow-transparent hover:shadow-black/5">
                  Launch Global Stream
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

function StatCard({ title, value, change, trend, icon, loading, color }: any) {
  const colorMap: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20"
  }

  return (
    <Card className="rounded-[2rem] border-border/40 bg-background/40 backdrop-blur-3xl shadow-xl p-10 space-y-8 group relative overflow-hidden transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 duration-700">
      <div className={cn("absolute -top-10 -right-10 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-1000 group-hover:scale-150 group-hover:-rotate-12", colorMap[color].split(' ')[0])}>
         {React.cloneElement(icon, { className: "h-48 w-48" })}
      </div>
      <div className="flex items-center justify-between relative z-10">
        <div className={cn("w-14 h-14 flex items-center justify-center rounded-2xl shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground border", colorMap[color])}>
          {React.cloneElement(icon, { className: "h-7 w-7 stroke-[2px]" })}
        </div>
        <Badge className={cn(
          "border-none font-black text-[10px] tracking-widest h-7 px-4 shadow-sm rounded-full uppercase",
          trend === 'up' ? "bg-emerald-500/10 text-emerald-600 shadow-emerald-500/5" : "bg-rose-500/10 text-rose-600 shadow-rose-500/5"
        )}>
          {change}
        </Badge>
      </div>
      <div className="relative z-10 space-y-2">
        <p className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-[0.3em]">{title}</p>
        {loading ? (
          <div className="h-12 w-28 bg-muted rounded-xl animate-pulse mt-3" />
        ) : (
          <h3 className="text-5xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors duration-700 leading-none">{value}</h3>
        )}
      </div>
    </Card>
  )
}

function AlertItem({ type, title, desc, time }: { type: 'error' | 'warning' | 'info' | 'success', title: string, desc: string, time: string }) {
  const colors: Record<string, string> = {
    error: "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]",
    warning: "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]",
    info: "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]",
    success: "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
  }
  return (
    <div className="flex gap-8 group cursor-pointer items-start">
      <div className={cn("w-1.5 h-14 rounded-full transition-all group-hover:scale-y-110", colors[type])} />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="flex items-center justify-between">
          <p className="font-black text-[14px] tracking-tight text-foreground/90 uppercase">{title}</p>
          <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{time}</span>
        </div>
        <p className="text-[12px] text-muted-foreground font-medium leading-relaxed line-clamp-2 group-hover:text-foreground transition-colors">{desc}</p>
      </div>
    </div>
  )
}
