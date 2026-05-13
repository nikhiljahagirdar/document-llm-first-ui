"use client"

import * as React from "react"
import { useDocStore, useUIStore, useAuthStore } from "@/lib/store"
import { DocumentUpload } from "@/components/features/document-upload"
import { DocumentList } from "@/components/features/document-list"
import { 
  FileText, 
  Search,
  LayoutGrid,
  List as ListIcon,
  Zap,
  CheckCircle2,
  AlertCircle,
  Menu,
  Sparkles,
  Brain,
  Activity,
  ArrowUpRight,
  Filter,
  Loader2,
  ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ProcessingOverlay } from "@/components/ui/processing-overlay"
import { MiniStatusCard } from "@/components/dashboard/documents/mini-status-card"

export default function DocumentsPage() {
  const { documents, isLoading, fetchDocuments } = useDocStore()
  const { toggleSidebar } = useUIStore()
  const { user } = useAuthStore()
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [search, setSearch] = React.useState("")
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [isProcessing, setIsProcessing] = React.useState(false)
  
  const isViewer = user?.role_id === 'viewer'
  
  const [isAiCreating, setIsAiCreating] = React.useState(false)
  const [aiPrompt, setAiPrompt] = React.useState("")
  const [isAiModalOpen, setIsAiAiModalOpen] = React.useState(false)

  React.useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments, refreshKey])

  const handleUploadSuccess = React.useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  const handleAiCreate = async () => {
    if (!aiPrompt.trim()) return
    setIsAiCreating(true)
    setIsProcessing(true)
    try {
      await api.generateDocument({ prompt: aiPrompt })
      setAiPrompt("")
      setRefreshKey(prev => prev + 1)
      setTimeout(() => {
        setIsAiAiModalOpen(false)
      }, 500)
    } catch (err) {
      console.error(err)
    } finally {
      setIsAiCreating(false)
      setIsProcessing(false)
    }
  }

  const stats = React.useMemo(() => {
    return {
      total: documents.length,
      ready: documents.filter(d => d.status?.toLowerCase() === 'ready' || d.status?.toLowerCase() === 'completed' || d.status?.toLowerCase() === 'processed').length,
      processing: documents.filter(d => d.status?.toLowerCase() === 'processing' || d.status?.toLowerCase() === 'analyzing').length,
      failed: documents.filter(d => d.status?.toLowerCase() === 'failed' || d.status?.toLowerCase() === 'error').length,
    }
  }, [documents])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
      <ProcessingOverlay isOpen={isProcessing} />
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Intelligence Hub</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">Document Center</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {!isViewer && (
            <Dialog open={isAiModalOpen} onOpenChange={setIsAiAiModalOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 px-6 rounded-xl shadow-lg shadow-primary/20 gap-3 font-bold uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <Sparkles className="h-4 w-4 fill-current" />
                  <span className="hidden sm:inline">Build with AI</span>
                  <span className="sm:hidden">AI Build</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-2xl border border-border bg-popover/95 backdrop-blur-xl p-8 shadow-2xl ring-1 ring-white/10">
                <DialogHeader className="space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                    <Brain className="h-7 w-7" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-extrabold tracking-tight">AI Smart Builder</DialogTitle>
                    <DialogDescription className="text-sm font-medium text-muted-foreground mt-2">Describe what you want to create and let AI handle the heavy lifting.</DialogDescription>
                  </div>
                </DialogHeader>
                <div className="mt-8 space-y-6">
                  <div className="relative group">
                    <textarea 
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. A report for Q4 sales data across all stores..."
                      className="w-full h-40 rounded-xl bg-muted/30 border border-border group-hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 p-5 text-sm font-medium outline-none resize-none transition-all placeholder:text-muted-foreground/50"
                    />
                    <div className="absolute bottom-4 right-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Gemini 2.0</div>
                  </div>
                  <Button 
                    onClick={handleAiCreate}
                    disabled={isAiCreating || !aiPrompt.trim()}
                    className="w-full h-14 rounded-xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/10"
                  >
                    {isAiCreating ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Zap className="h-5 w-5 mr-3 fill-current" />}
                    {isAiCreating ? "Thinking..." : "Create with AI"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Central Command Hub */}
      <Card className="rounded-2xl border border-border shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
        <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* Status Section */}
          <div className="lg:col-span-4 p-6 flex flex-col h-full bg-muted/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-foreground">Pipeline Status</h3>
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] font-extrabold px-2 py-0.5 h-5 border-emerald-500/30 text-emerald-600 bg-emerald-500/10 uppercase tracking-widest animate-pulse">Live</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 flex-1">
              <MiniStatusCard label="Total Units" count={stats.total} icon={<FileText className="h-4 w-4" />} color="slate" loading={isLoading} />
              <MiniStatusCard label="Verified" count={stats.ready} icon={<CheckCircle2 className="h-4 w-4" />} color="emerald" loading={isLoading} />
              <MiniStatusCard label="Processing" count={stats.processing} icon={<Zap className="h-4 w-4" />} color="amber" loading={isLoading} />
              <MiniStatusCard label="Failed" count={stats.failed} icon={<AlertCircle className="h-4 w-4" />} color="rose" loading={isLoading} />
            </div>
          </div>

          {/* Ingestion Section */}
          <div className="lg:col-span-8 p-4 bg-background/40 flex flex-col justify-center">
            {isViewer ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="h-14 w-14 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground/20">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">Read-Only Access</p>
                  <p className="text-[11px] font-medium text-muted-foreground mt-1 max-w-[240px]">Your account tier is restricted to visualization and analysis only.</p>
                </div>
              </div>
            ) : (
              <DocumentUpload onUploadSuccess={handleUploadSuccess} onProcessingChange={setIsProcessing} />
            )}
          </div>
        </div>
      </Card>

      {/* Registry Controls */}
      <div className="space-y-8 mt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Knowledge Registry</h2>
              <Badge variant="secondary" className="rounded-lg text-[10px] font-extrabold h-6 px-3 bg-muted/50 border border-border">
                {documents.length} SECURED UNITS
              </Badge>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Search and manage your extracted document intelligence.</p>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search registry..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-11 w-full sm:w-64 lg:w-80 border-border bg-card rounded-xl text-sm font-medium focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
              />
            </div>
            
            <div className="h-10 w-[1px] bg-border hidden sm:block mx-2" />

            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border shadow-inner">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('grid')}
                className={cn("h-9 px-3 rounded-lg transition-all gap-2 font-bold text-[10px] uppercase tracking-widest", viewMode === 'grid' ? "bg-background text-primary shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground")}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Grid</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('list')}
                className={cn("h-9 px-3 rounded-lg transition-all gap-2 font-bold text-[10px] uppercase tracking-widest", viewMode === 'list' ? "bg-background text-primary shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground")}
              >
                <ListIcon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">List</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="min-h-[400px]">
          <DocumentList refreshKey={refreshKey} viewMode={viewMode} onProcessingChange={setIsProcessing} />
        </div>
      </div>
    </div>
  )
}

