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
  FileText, 
  Download, 
  Eye, 
  Clock, 
  Sparkles, 
  Search,
  ChevronRight,
  Loader2,
  FileDown
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getS3SignedUrl } from "@/lib/s3"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ReportsPage() {
  const [reports, setReports] = React.useState<Types.GeneratedReportResponse[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  const fetchReports = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getMyReports()
      setReports(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const filteredReports = reports.filter(r => 
    (r.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.content_markdown || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary fill-current" />
            AI Generations
          </h1>
          <p className="text-muted-foreground text-lg font-medium mt-1">History of all AI-architected documents and reports.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl border-2 h-12 px-6 font-bold text-xs gap-2" onClick={fetchReports}>
             <Clock className="h-4 w-4" /> Refresh History
           </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-border bg-card shadow-2xl overflow-hidden">
        <CardHeader className="p-0 border-b border-border">
          <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-muted/20">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search generations..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 border-border bg-background font-bold text-sm rounded-xl shadow-inner"
              />
            </div>
            <Badge variant="secondary" className="h-8 px-4 rounded-full font-bold text-[10px] uppercase tracking-widest bg-primary/10 text-primary border-primary/20">
              {filteredReports.length} Reports Found
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
                  <th className="px-8 py-5">Report Blueprint</th>
                  <th className="px-8 py-5">Version</th>
                  <th className="px-8 py-5">Timestamp</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                   Array.from({ length: 5 }).map((_, i) => (
                     <tr key={i} className="animate-pulse">
                       <td colSpan={4} className="px-8 py-8 h-24 bg-muted/5" />
                     </tr>
                   ))
                ) : filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr key={report.report_id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{report.title || 'Untitled Generation'}</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{report.original_prompt?.slice(0, 50)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant="outline" className="h-5 px-2 text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary bg-primary/5">
                          v{report.version || 1}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">{new Date(report.created_on || '').toLocaleDateString()}</span>
                          <span className="text-[10px] font-medium text-muted-foreground uppercase">{new Date(report.created_on || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex items-center justify-end gap-2">
                           <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted group-hover:text-foreground">
                             <Eye className="h-5 w-5" />
                           </Button>
                         </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center justify-center opacity-30 gap-4">
                        <Sparkles className="h-12 w-12 text-primary" />
                        <p className="text-xs font-black uppercase tracking-[0.2em]">No AI Generations Found</p>
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
