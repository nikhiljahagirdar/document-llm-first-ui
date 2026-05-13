"use client"

import * as React from "react"
import { api } from "@/lib/api"
import * as Types from "@/types/api"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity, 
  ShieldAlert, 
  Clock, 
  Terminal,
  Search,
  Download,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function LogsAdminPage() {
  const [auditLogs, setAuditLogs] = React.useState<Types.AuditLogResponse[]>([])
  const [usageLogs, setUsageLogs] = React.useState<Types.UsageLogResponse[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  const fetchLogs = React.useCallback(async () => {
    try {
      const [audit, usage] = await Promise.all([
        api.getAuditLogs(),
        api.getUsageLogs()
      ])
      setAuditLogs(audit || [])
      setUsageLogs(usage || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-card-foreground flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-md shadow-md text-white">
              <Terminal className="h-6 w-6" />
            </div>
            System Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-1">Live security and usage events across the entire platform.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-card p-1.5 rounded-md border shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search logs..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-11 w-64 border-none bg-slate-50 dark:bg-slate-950 rounded-md font-medium"
              />
            </div>
            <Button variant="ghost" size="icon" className="rounded-md h-11 w-11"><Filter className="h-4 w-4" /></Button>
          </div>
          <Button variant="outline" className="rounded-full h-12 px-6 font-semibold tracking-normal text-xs border-2">
            <Download className="h-4 w-4 mr-2" /> Export JSON
          </Button>
        </div>
      </div>

      <Tabs defaultValue="audit" className="w-full">
        <TabsList className="bg-transparent p-0 gap-8 h-auto mb-10 border-b border-slate-100 dark:border-slate-800 w-full justify-start rounded-none">
          <TabsTrigger value="audit" className="bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 border-none p-0 pb-4 h-auto text-sm font-semibold tracking-normal text-slate-400 relative data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-1 data-[state=active]:after:bg-indigo-600 transition-all rounded-none">
            Security Audit
          </TabsTrigger>
          <TabsTrigger value="usage" className="bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 border-none p-0 pb-4 h-auto text-sm font-semibold tracking-normal text-slate-400 relative data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-1 data-[state=active]:after:bg-indigo-600 transition-all rounded-none">
            Usage Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="mt-0">
          <div className="bg-card rounded-md border-none shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50">
                <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="font-semibold tracking-normal text-xs h-16 px-8">Action</TableHead>
                  <TableHead className="font-semibold tracking-normal text-xs h-16">Resource</TableHead>
                  <TableHead className="font-semibold tracking-normal text-xs h-16">Timestamp</TableHead>
                  <TableHead className="font-semibold tracking-normal text-xs h-16 px-8">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="h-64 text-center">Loading security events...</TableCell></TableRow>
                ) : auditLogs.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-64 text-center font-bold text-slate-400 text-xs tracking-normal">No audit events recorded.</TableCell></TableRow>
                ) : (
                  auditLogs.map((log) => (
                    <TableRow key={log.log_id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-950/30">
                      <TableCell className="px-8 font-semibold text-sm py-5">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            log.action.includes('fail') ? "bg-rose-500" : "bg-emerald-500"
                          )} />
                          {log.action.replace(/_/g, ' ').toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{log.resource_type}</span>
                          <span className="text-xs font-bold text-slate-500 truncate max-w-[200px]">{log.resource_id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="px-8">
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-semibold text-xs tracking-normal h-6 px-3">VERIFIED</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="mt-0">
          <div className="bg-card rounded-md border-none shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50">
                <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="font-semibold tracking-normal text-xs h-16 px-8">Metric</TableHead>
                  <TableHead className="font-semibold tracking-normal text-xs h-16">Quantity</TableHead>
                  <TableHead className="font-semibold tracking-normal text-xs h-16">Timestamp</TableHead>
                  <TableHead className="font-semibold tracking-normal text-xs h-16 px-8">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="h-64 text-center">Loading usage data...</TableCell></TableRow>
                ) : usageLogs.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-64 text-center font-bold text-slate-400 text-xs tracking-normal">No usage data detected.</TableCell></TableRow>
                ) : (
                  usageLogs.map((log, idx) => (
                    <TableRow key={idx} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-950/30">
                      <TableCell className="px-8 font-semibold text-sm py-5">
                        <div className="flex items-center gap-3">
                          <Activity className="h-4 w-4 text-indigo-600" />
                          {log.metric_name.toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-lg tracking-normal">
                        {log.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(log.created_on).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="px-8">
                        <Badge variant="outline" className="border-slate-200 dark:border-slate-800 text-xs font-semibold tracking-normal h-6 px-3">METERED</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
