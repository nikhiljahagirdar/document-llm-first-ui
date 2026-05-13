"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useDocStore } from "@/lib/store"
import * as Types from "@/types/api"
import { Card, CardContent } from "@/components/ui/card"
import { 
  FileText, 
  MoreVertical, 
  ExternalLink, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileSearch,
  Zap,
  History,
  Eye,
  Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { cn, formatDate } from "@/lib/utils"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface DocumentListProps {
  refreshKey: number
  viewMode?: 'grid' | 'list'
  onProcessingChange?: (isProcessing: boolean) => void
}

export const DocumentList = React.memo(function DocumentList({
  refreshKey,
  viewMode = 'grid',
  onProcessingChange
}: DocumentListProps) {
  const router = useRouter()
  const { documents, isLoading, error, fetchDocuments } = useDocStore()
  const [selectedDocVersions, setSelectedDocVersions] = React.useState<Types.GeneratedReportResponse[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)

  const handleViewHistory = async (docId: string) => {
    try {
      const versions = await api.getReportVersions(docId)
      setSelectedDocVersions(versions || [])
      setIsHistoryOpen(true)
    } catch (err) {
      console.error("Failed to fetch versions", err)
    }
  }

  const handleReprocess = async (docId: string) => {
    onProcessingChange?.(true)
    try {
      await api.reprocessDocument(docId)
      // Poll for a few seconds to simulate waiting for the reprocess to trigger
      await new Promise(resolve => setTimeout(resolve, 3000))
      fetchDocuments()
    } catch (err) {
      console.error(err)
    } finally {
      onProcessingChange?.(false)
    }
  }

  const openViewer = (docId: string) => {
    router.push(`/dashboard/documents/${docId}`)
  }

  React.useEffect(() => {
    fetchDocuments()
  }, [refreshKey, fetchDocuments])

  if (isLoading && documents.length === 0) {
    return (
      <div className={cn(
        "gap-6",
        viewMode === 'grid' ? "grid md:grid-cols-2 lg:grid-cols-3" : "space-y-4"
      )}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className={cn(
            "rounded-md bg-slate-100 dark:bg-white/5 animate-pulse border border-slate-200 dark:border-white/5 backdrop-blur-2xl transition-colors",
            viewMode === 'grid' ? "h-48" : "h-20"
          )} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-12 text-center rounded-md bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl shadow-xl dark:shadow-2xl">
        <AlertCircle className="h-10 w-10 text-rose-600 dark:text-rose-400 mx-auto mb-4" />
        <p className="font-semibold tracking-normal text-xs text-rose-700 dark:text-rose-300">Registry Error: {error}</p>
        <Button onClick={fetchDocuments} variant="outline" className="mt-6 rounded-md border border-slate-200 dark:border-white/20 bg-card hover:bg-slate-50 dark:hover:bg-white/10 text-card-foreground font-semibold tracking-normal text-xs">Retry Scan</Button>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="p-24 text-center rounded-md border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 backdrop-blur-xl shadow-xl dark:shadow-2xl">
        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md flex items-center justify-center mx-auto mb-6 text-slate-400 dark:text-slate-500 shadow-inner transition-colors">
          <FileSearch className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-semibold tracking-normal text-card-foreground mb-2 drop-shadow-sm transition-colors">No Documents Found</h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-xs mx-auto transition-colors">Upload a document to start using the AI assistant.</p>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
        <table className="w-full text-left border-collapse">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Document Identity</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Timestamp</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Pipeline Status</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground text-right">Commands</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {documents.map((doc) => (
              <tr key={doc.document_id} className="hover:bg-accent/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span 
                        onClick={() => openViewer(doc.document_id)}
                        className="font-bold text-foreground text-sm tracking-tight truncate max-w-[240px] cursor-pointer hover:text-primary transition-colors"
                      >
                        {doc.filename}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{doc.document_id.substring(0, 12)}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs uppercase tracking-tight">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(doc.created_on || (doc as any).created_at)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={doc.status} docId={doc.document_id} onRetry={handleReprocess} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => openViewer(doc.document_id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-60 rounded-xl border border-border shadow-2xl p-2 bg-popover/90 backdrop-blur-xl">
                        <DropdownMenuItem onClick={() => handleViewHistory(doc.document_id)} className="rounded-lg font-bold text-xs p-3 cursor-pointer">
                          <History className="h-4 w-4 mr-3 text-muted-foreground" /> Lifecycle History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="rounded-lg font-bold text-xs p-3 cursor-pointer text-destructive hover:bg-destructive/5 hover:text-destructive transition-all">
                          <Trash2 className="h-4 w-4 mr-3" /> Remove Unit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className={cn(
      "animate-in fade-in slide-in-from-bottom-4 duration-700",
      viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "space-y-4"
    )}>
      {documents.map((doc) => (
        <Card key={doc.document_id} className="group relative rounded-2xl border border-border bg-card shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 overflow-hidden border-b-4 border-b-transparent hover:border-b-primary/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <CardContent className="p-0 relative z-10 flex flex-col h-full">
            <div className="p-6 flex items-start justify-between">
              <div 
                onClick={() => openViewer(doc.document_id)}
                className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 cursor-pointer shadow-inner border border-primary/10 group-hover:shadow-lg group-hover:bg-primary/10"
              >
                <FileText className="h-8 w-8" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="outline" className="h-6 rounded-md border-border bg-background/50 text-muted-foreground font-bold text-[10px] px-2 shadow-sm backdrop-blur-sm">
                  V{(doc as any).version || 1}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/5 text-muted-foreground/40 hover:text-primary transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 rounded-xl border border-border shadow-2xl p-2 bg-popover/90 backdrop-blur-xl">
                    <DropdownMenuItem 
                      onClick={() => openViewer(doc.document_id)}
                      className="rounded-lg font-bold text-sm p-3 cursor-pointer hover:bg-primary/5 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-3 text-muted-foreground" /> Intelligence View
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleViewHistory(doc.document_id)}
                      className="rounded-lg font-bold text-sm p-3 cursor-pointer hover:bg-primary/5 transition-colors"
                    >
                      <History className="h-4 w-4 mr-3 text-muted-foreground" /> Lifecycle History
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem className="rounded-lg font-bold text-xs p-3 cursor-pointer text-destructive hover:bg-destructive/5 hover:text-destructive transition-all">
                      <Trash2 className="h-4 w-4 mr-3" /> Remove Unit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="px-6 pb-6 space-y-4 flex-1">
              <div className="space-y-1">
                <h4 
                  onClick={() => openViewer(doc.document_id)}
                  className="font-bold text-foreground truncate text-lg tracking-tight cursor-pointer hover:text-primary transition-colors leading-tight" 
                  title={doc.filename}
                >
                  {doc.filename}
                </h4>
                <div className="flex items-center gap-2 text-muted-foreground/60">
                  <Clock className="h-3 w-3" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Synced {formatDate(doc.created_on || (doc as any).created_at)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {doc.industry_name && (
                  <Badge variant="secondary" className="px-2 py-0 h-5 text-[9px] font-extrabold uppercase tracking-widest bg-indigo-500/10 text-indigo-600 border border-indigo-500/10">
                    {doc.industry_name}
                  </Badge>
                )}
                {doc.category_name && (
                  <Badge variant="secondary" className="px-2 py-0 h-5 text-[9px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">
                    {doc.category_name}
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-5 flex items-center justify-between border-t border-border/50 bg-muted/20 backdrop-blur-sm group-hover:bg-muted/40 transition-colors">
              <StatusBadge status={doc.status} docId={doc.document_id} onRetry={handleReprocess} />
              <div className="text-[9px] font-extrabold text-muted-foreground/30 uppercase tracking-[0.2em]">
                {doc.document_id.substring(0, 8)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})

function StatusBadge({ status, docId, onRetry }: { status: string | null, docId: string, onRetry: (id: string) => void }) {
  const statusStr = String(status || '')
  const statusLower = statusStr.toLowerCase()
  
  const isCompleted = statusLower === 'completed' || statusLower === 'ready' || statusLower === 'processed'
  const isFailed = statusLower === 'failed' || statusLower === 'error'
  const isProcessing = statusLower === 'processing' || statusLower === 'extracting' || statusLower === 'categorizing' || statusLower === 'ingesting' || statusLower === 'analyzing'

  return (
    <div className={cn(
      "flex items-center gap-2 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-sm ring-1 w-fit",
      isCompleted ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20" :
      isFailed ? "bg-destructive/10 text-destructive ring-destructive/20" :
      "bg-amber-500/10 text-amber-600 ring-amber-500/20"
    )}>
      {isCompleted && <CheckCircle2 className="h-3 w-3" />}
      {isFailed && <AlertCircle className="h-3 w-3" />}
      {isProcessing && <Zap className="h-3 w-3 animate-pulse fill-current" />}
      {statusStr || 'Unknown'}
    </div>
  )
}
