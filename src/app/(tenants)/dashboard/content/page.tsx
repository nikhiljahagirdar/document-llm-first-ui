"use client"

import * as React from "react"
import { useDocStore } from "@/lib/store"
import { api } from "@/lib/api"
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
  Filter,
  MoreVertical,
  Download,
  Trash2,
  ExternalLink,
  History,
  Activity,
  Layers,
  Sparkles,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

export default function ContentStudio() {
  const { documents, isLoading, fetchDocuments } = useDocStore()
  const [uploading, setUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append("file", files[i])
        await api.uploadDocument(formData)
        setUploadProgress(Math.round(((i + 1) / files.length) * 100))
      }
      await fetchDocuments()
    } catch (error) {
      console.error("Upload failed", error)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 pb-20 relative"
    >
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full glass border border-primary/20 w-fit">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Asset Pipeline Active</span>
          </div>
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-none">
              Content <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600">Studio</span>
            </h1>
            <p className="text-muted-foreground/60 text-lg font-bold mt-4 uppercase tracking-widest text-[13px]">Manage your intelligence infrastructure and data ingestion.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-muted/10 p-2 rounded-3xl border border-border/40 backdrop-blur-md">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            multiple 
            className="hidden" 
            accept=".pdf,.docx,.txt"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-[1.8rem] h-16 px-10 bg-foreground text-background hover:bg-foreground/90 font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.95] group gap-4"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
               <div className="bg-background/20 p-2 rounded-xl group-hover:rotate-12 transition-transform">
                 <Upload className="h-5 w-5" />
               </div>
            )}
            Batch Ingestion
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {uploading && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="rounded-[2rem] border-primary/20 bg-primary/5 overflow-hidden border relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
              <CardContent className="p-8 space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xl shadow-primary/20">
                       <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-black text-xs text-primary uppercase tracking-[0.2em]">Synchronizing Assets</span>
                      <p className="text-[10px] font-bold text-primary/60 uppercase">Encoding vectors into knowledge base</p>
                    </div>
                  </div>
                  <span className="font-black text-2xl text-primary tracking-tighter">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-primary/10 h-2 rounded-full overflow-hidden p-0.5">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${uploadProgress}%` }}
                     className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" 
                   />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          label="Knowledge Nodes" 
          value={documents.length.toString()} 
          icon={<FileText />} 
          trend="Live Sync"
          color="blue"
        />
        <StatCard 
          label="OCR Accuracy" 
          value="99.9%" 
          icon={<Sparkles />} 
          trend="Max precision"
          color="emerald"
        />
        <StatCard 
          label="Process Cycles" 
          value="4.2k" 
          icon={<Activity />} 
          trend="Global load"
          color="indigo"
        />
      </motion.div>

      <div className="space-y-8 z-10 relative">
        <div className="flex items-center justify-between border-b border-border/40 pb-6 px-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight uppercase tracking-[0.05em]">Storage Hub</h2>
            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Verified Secure Repository</p>
          </div>
          <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-[0.2em] gap-3 bg-muted/5 hover:bg-background px-6 h-11 rounded-xl border border-border/40 transition-all">
            <Filter className="h-4 w-4" /> Filter Stream
          </Button>
        </div>

        <motion.div variants={container} className="grid grid-cols-1 gap-4">
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-28 rounded-[2rem] bg-muted/20 animate-pulse border border-border/40" />)
          ) : documents.length === 0 ? (
            <div className="text-center py-32 glass rounded-[3rem] border-2 border-dashed border-border/40 flex flex-col items-center justify-center space-y-6">
               <div className="h-20 w-20 rounded-[2rem] bg-muted/10 flex items-center justify-center text-muted-foreground/20">
                 <Upload className="h-10 w-10" />
               </div>
               <p className="font-black text-muted-foreground/30 uppercase tracking-[0.4em] text-xs">Repository Initialized. Waiting for data.</p>
            </div>
          ) : (
            documents.map((doc) => (
              <DocumentRow key={doc.document_id} doc={doc} />
            ))
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

function StatCard({ label, value, icon, trend, color }: any) {
  const colorMap: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  }

  return (
    <Card className="rounded-[2rem] border-border/40 bg-background/40 backdrop-blur-3xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-700 h-full">
      <CardContent className="p-10 space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">{label}</p>
            <h3 className="text-5xl font-black text-foreground tracking-tighter leading-none">{value}</h3>
          </div>
          <div className={cn("p-3.5 rounded-2xl border transition-all duration-700 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground shadow-2xl", colorMap[color])}>
            {React.cloneElement(icon, { className: "h-7 w-7 stroke-[2px]" })}
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">{trend}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function DocumentRow({ doc }: { doc: any }) {
  const status = doc.status?.toLowerCase() || 'indexed'
  
  return (
    <motion.div variants={item} className="group bg-background/40 backdrop-blur-2xl hover:bg-white dark:hover:bg-white/5 border border-border/40 hover:border-primary/20 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between transition-all duration-500 shadow-sm hover:shadow-2xl gap-6">
      <div className="flex items-center gap-6 min-w-0 w-full md:w-auto">
        <div className="h-16 w-16 rounded-2xl bg-muted/10 flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500 shrink-0 border border-transparent group-hover:border-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <FileText className="h-8 w-8 stroke-[1.5px] relative z-10" />
        </div>
        <div className="min-w-0 space-y-2">
          <h4 className="font-black text-lg text-foreground/90 truncate tracking-tight group-hover:text-primary transition-colors duration-500">{doc.filename}</h4>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.1em] border-border/60 text-muted-foreground/40 rounded-lg h-6 px-3">{doc.industry_name || 'GENERAL'}</Badge>
            <div className="h-1 w-1 rounded-full bg-border" />
            <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">{new Date(doc.created_on).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8">
        <Badge className={cn(
          "rounded-full px-5 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] border-none shadow-xl transition-all duration-500",
          status === 'indexed' || status === 'completed' || status === 'ready'
            ? "bg-emerald-500/10 text-emerald-600 shadow-emerald-500/5" 
            : status === 'failed' 
              ? "bg-rose-500/10 text-rose-600 shadow-rose-500/5" 
              : "bg-amber-500/10 text-amber-600 animate-pulse shadow-amber-500/5"
        )}>
          {status}
        </Badge>

        <div className="flex items-center gap-3">
           <Button variant="ghost" size="icon" className="h-12 w-12 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-[1rem] transition-all duration-500">
             <Download className="h-5 w-5" />
           </Button>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-12 w-12 text-muted-foreground hover:bg-accent rounded-[1rem] transition-all duration-500">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border/40 shadow-2xl p-2 bg-popover/80 backdrop-blur-3xl animate-in zoom-in-95 duration-300">
                <DropdownMenuItem className="rounded-xl text-[11px] font-black uppercase tracking-widest py-3 gap-4 transition-all">
                  <History className="h-4 w-4 opacity-40" /> Sequence LOG
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl text-[11px] font-black uppercase tracking-widest py-3 gap-4 transition-all">
                  <ExternalLink className="h-4 w-4 opacity-40" /> Vector UI
                </DropdownMenuItem>
                <div className="h-[1px] bg-border/40 my-2" />
                <DropdownMenuItem className="rounded-xl text-[11px] font-black uppercase tracking-widest py-3 gap-4 text-rose-500 focus:text-rose-600 focus:bg-rose-500/5 transition-all">
                  <Trash2 className="h-4 w-4" /> Purge Asset
                </DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
           <div className="h-12 w-12 rounded-[1rem] bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 cursor-pointer shadow-sm group-hover:shadow-primary/20">
              <ChevronRight className="h-5 w-5" />
           </div>
        </div>
      </div>
    </motion.div>
  )
}
