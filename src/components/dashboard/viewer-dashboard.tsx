"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuthStore } from "@/lib/store"
import { 
  FileText, 
  ShieldCheck, 
  Search,
  Eye,
  Lock,
  RefreshCw,
  Clock,
  ChevronRight,
  ExternalLink
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ViewerDashboard({ 
    fetchData, 
    loading, 
    docCount, 
    auditLogs,
    documents 
}: any) {
  const { user } = useAuthStore()

  return (
    <div className="space-y-12 pb-20 relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20">
                <Eye className="h-3 w-3 text-slate-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Read-Only Protocol</span>
             </div>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Knowledge <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-500 via-slate-700 to-black dark:from-slate-400 dark:via-slate-200 dark:to-white bg-[length:200%_auto] animate-gradient">Discovery</span>
            </h1>
            <p className="text-muted-foreground text-lg font-medium mt-3 max-w-2xl leading-relaxed">
              Viewing as <span className="text-foreground font-bold">{user?.first_name || user?.email}</span>. You have access to <span className="text-foreground font-bold">{docCount} verified archives</span> across the organization.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchData}
            className="rounded-xl h-12 w-12 p-0 border-border/40 bg-background/50 backdrop-blur-sm hover:bg-accent transition-all shadow-sm"
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4 text-muted-foreground", loading && "animate-spin")} />
          </Button>
          <Link href="/dashboard/search">
            <Button className="rounded-xl bg-foreground text-background dark:bg-white dark:text-black hover:opacity-90 font-bold text-[12px] uppercase tracking-widest h-12 px-8 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] group gap-3 border-none">
              <Search className="h-4 w-4 stroke-[3px]" /> Global Search
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 relative z-10">
        <StatCard 
          title="Accessible Archives" 
          value={docCount.toLocaleString()} 
          sub="Verified repository items"
          icon={<FileText />} 
          loading={loading}
        />
        <StatCard 
          title="Security Status" 
          value="Verified" 
          sub="End-to-end encrypted"
          icon={<ShieldCheck />} 
          loading={loading}
        />
        <StatCard 
          title="Permissions" 
          value="Restricted" 
          sub="Export & Edit disabled"
          icon={<Lock />} 
          loading={loading}
        />
      </div>

      <div className="grid gap-8 md:grid-cols-12 relative z-10">
        <Card className="md:col-span-8 rounded-2xl border-border/40 bg-background/50 backdrop-blur-md shadow-2xl shadow-black/[0.03] dark:shadow-none overflow-hidden flex flex-col group/main">
          <CardHeader className="p-8 pb-6 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">Organization Updates</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-1.5">LATEST DISCOVERIES FROM YOUR TEAM</CardDescription>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-500 group-hover/main:rotate-6 transition-transform duration-500">
              <Eye className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-8">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />
                  ))
                ) : documents && documents.length > 0 ? (
                  documents.slice(0, 4).map((doc: any) => (
                    <Link key={doc.document_id} href={`/dashboard/documents/${doc.document_id}`}>
                      <div className="p-6 rounded-2xl border border-border/40 bg-background/50 hover:bg-white dark:hover:bg-white/5 hover:shadow-xl transition-all group cursor-pointer flex items-center justify-between h-full">
                         <div className="min-w-0">
                            <p className="font-bold text-[14px] truncate tracking-tight">{doc.filename}</p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">{doc.category_name || 'General'}</p>
                         </div>
                         <div className="h-8 w-8 rounded-full bg-muted/20 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all">
                            <ChevronRight className="h-4 w-4" />
                         </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-2 py-20 text-center border-2 border-dashed border-border/40 rounded-2xl bg-muted/5 opacity-50">
                     <p className="text-[11px] font-bold uppercase tracking-[0.2em]">No accessible documents found</p>
                  </div>
                )}
             </div>
          </CardContent>
          <div className="p-6 bg-muted/10 border-t border-border/40 mt-auto">
             <Link href="/dashboard/documents" className="block text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:opacity-70 transition-all">
                Full Repository Access
             </Link>
          </div>
        </Card>

        <Card className="md:col-span-4 rounded-2xl border-border/40 bg-background/50 backdrop-blur-md shadow-2xl shadow-black/[0.03] dark:shadow-none overflow-hidden flex flex-col group/feed">
          <CardHeader className="p-8 pb-6 border-b border-border/40">
            <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-3">
              <Clock className="h-5 w-5 text-slate-500" />
              Event Stream
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-1.5">ORGANIZATIONAL FOOTPRINT</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-[440px]">
               <div className="p-8 space-y-10">
                 {auditLogs.length > 0 ? (
                   auditLogs.map((log: any) => (
                     <div key={log.log_id} className="flex gap-6 group cursor-pointer items-start">
                        <div className="relative flex flex-col items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 ring-4 ring-slate-400/10 z-10" />
                          <div className="w-[1px] h-16 bg-border/40 absolute top-1.5 group-last:hidden" />
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex items-center justify-between gap-4">
                            <p className="font-bold text-[14px] truncate uppercase tracking-tight text-foreground group-hover:text-slate-500 transition-colors duration-300">{log.action.replace(/_/g, ' ')}</p>
                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest shrink-0">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="secondary" className="text-[9px] font-black h-5 px-2 bg-muted/50 border-border/40 uppercase tracking-widest text-muted-foreground">{log.resource_type || "SYS"}</Badge>
                          </div>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="py-20 text-center opacity-30">
                     <p className="text-[10px] font-bold uppercase tracking-widest">No activity history</p>
                   </div>
                 )}
               </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, sub, icon, loading }: any) {
  return (
    <Card className="rounded-2xl border-border/40 bg-background/50 backdrop-blur-md shadow-xl p-8 space-y-6 group relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 duration-500">
      <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 group-hover:scale-150 group-hover:-rotate-12">
         {React.cloneElement(icon, { className: "h-32 w-32" })}
      </div>
      <div className="bg-slate-100 dark:bg-white/5 w-12 h-12 flex items-center justify-center rounded-xl text-slate-500 shadow-sm group-hover:scale-110 group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all duration-500">
        {React.cloneElement(icon, { className: "h-6 w-6 stroke-[2px]" })}
      </div>
      <div className="relative z-10 space-y-1.5">
        <p className="text-muted-foreground text-[11px] font-black uppercase tracking-[0.2em]">{title}</p>
        {loading ? (
          <div className="h-10 w-24 bg-muted rounded-lg animate-pulse mt-2" />
        ) : (
          <h3 className="text-4xl font-black tracking-tighter text-foreground group-hover:text-slate-600 transition-colors duration-500">{value}</h3>
        )}
        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em] pt-2">{sub}</p>
      </div>
    </Card>
  )
}
