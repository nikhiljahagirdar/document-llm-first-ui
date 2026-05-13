"use client"

import * as React from "react"
import { api } from "@/lib/api"
import * as Types from "@/types/api"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { 
  Search, 
  Clock, 
  User, 
  Shield, 
  Activity, 
  Filter,
  ArrowUpRight,
  Database,
  FileText,
  Settings,
  ShieldAlert
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<Types.AuditLogResponse[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  const fetchLogs = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getAuditLogs()
      setLogs(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    (log.resource_type || "").toLowerCase().includes(search.toLowerCase())
  )

  const getActionIcon = (action: string) => {
    const a = action.toLowerCase()
    if (a.includes('create') || a.includes('upload')) return <PlusIcon className="h-4 w-4 text-emerald-500" />
    if (a.includes('update') || a.includes('edit')) return <Settings className="h-4 w-4 text-amber-500" />
    if (a.includes('delete')) return <ShieldAlert className="h-4 w-4 text-rose-500" />
    return <Activity className="h-4 w-4 text-primary" />
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-card-foreground">Audit Governance</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Searchable feed of all system actions for compliance.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-md border-2 h-11 px-6 font-bold text-xs gap-2" onClick={fetchLogs}>
             <Clock className="h-4 w-4" /> Refresh Feed
           </Button>
        </div>
      </div>

      <Card className="rounded-md border-border bg-card shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <CardHeader className="p-0 border-b border-border">
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search audit events..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 border-border bg-background font-medium text-xs shadow-inner"
              />
            </div>
            <div className="flex items-center gap-2">
               <Button variant="ghost" size="sm" className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest gap-2">
                 <Filter className="h-3.5 w-3.5" /> Filter by Type
               </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
                  <th className="px-8 py-5">Event</th>
                  <th className="px-8 py-5">Resource</th>
                  <th className="px-8 py-5">Timestamp</th>
                  <th className="px-8 py-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                   Array.from({ length: 5 }).map((_, i) => (
                     <tr key={i} className="animate-pulse">
                       <td colSpan={4} className="px-8 py-6 h-20 bg-muted/5" />
                     </tr>
                   ))
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.log_id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-md bg-card border border-border flex items-center justify-center shadow-sm">
                            {getActionIcon(log.action)}
                          </div>
                          <span className="text-sm font-bold text-foreground">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">{log.resource_type}</span>
                          <span className="text-[10px] font-mono text-muted-foreground mt-0.5">ID: {log.resource_id?.slice(0, 8) || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold text-muted-foreground">{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                           <ArrowUpRight className="h-4 w-4" />
                         </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center justify-center opacity-30 gap-4">
                        <Database className="h-12 w-12" />
                        <p className="text-xs font-bold uppercase tracking-widest">No matching audit logs found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
