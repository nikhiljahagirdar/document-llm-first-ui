"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import * as Types from "@/types/api"
import { Button } from "@/components/ui/button"
import { Upload, FileText, CheckCircle2, AlertCircle, Zap, BrainCircuit, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/components/notification-provider"

interface DocumentUploadProps {
  onUploadSuccess: () => void
  onProcessingChange?: (isProcessing: boolean) => void
}

export const DocumentUpload = React.memo(function DocumentUpload({
  onUploadSuccess,
  onProcessingChange
}: DocumentUploadProps) {
  const router = useRouter()
  const { triggerToast } = useNotifications()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const [dragActive, setDragActive] = React.useState(false)
  const [uploadStep, setUploadStep] = React.useState<"idle" | "uploading" | "extracting" | "classifying" | "indexing" | "processed">("idle")

  React.useEffect(() => {
    onProcessingChange?.(loading)
  }, [loading, onProcessingChange])

  const handleDrag = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }, [])

  const handleUpload = React.useCallback(
    async () => {
      if (!file) return

      setLoading(true)
      setError("")
      setUploadStep("uploading")

      triggerToast({
        notification_id: `upload-start-${Date.now()}`,
        title: "Uploading Document",
        message: `Starting upload for ${file.name}...`,
        type: "processing",
        created_on: new Date().toISOString()
      })

      const formData = new FormData()
      formData.append("file", file)

      try {
        // 1. Initial Upload
        const initialDoc: Types.DocumentResponse = await api.uploadDocument(formData)
        const docId = initialDoc.document_id

        if (!docId) {
          throw new Error("Invalid response from server.")
        }

        triggerToast({
          notification_id: `upload-success-${Date.now()}`,
          title: "Upload Completed",
          message: `${file.name} uploaded successfully. Beginning AI pipeline processing...`,
          type: "success",
          created_on: new Date().toISOString()
        })

        // 2. Poll for completion with simulated steps for UI feedback
        let isComplete = false
        
        // Simulating fine-grained steps during polling
        const steps: (typeof uploadStep)[] = ["extracting", "classifying", "indexing"]
        let stepIdx = 0
        
        while (!isComplete) {
          if (stepIdx < steps.length) {
            const currentStep = steps[stepIdx]
            setUploadStep(currentStep)
            
            // Trigger toast for active step
            if (currentStep === "extracting") {
              triggerToast({
                notification_id: `extracting-${Date.now()}`,
                title: "Extracting Content",
                message: "AI is reading and extracting unstructured data from the document...",
                type: "document_status",
                created_on: new Date().toISOString()
              })
            } else if (currentStep === "classifying") {
              triggerToast({
                notification_id: `classifying-${Date.now()}`,
                title: "Classifying Document Type",
                message: "Determining document industry, category, and metadata...",
                type: "document_status",
                created_on: new Date().toISOString()
              })
            } else if (currentStep === "indexing") {
              triggerToast({
                notification_id: `indexing-${Date.now()}`,
                title: "Indexing & Vectorizing",
                message: "Generating embeddings and indexing for AI Chat and RAG...",
                type: "document_status",
                created_on: new Date().toISOString()
              })
            }
            stepIdx++
          }
          
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          const currentDoc = await api.getDocument(docId)
          
          if (!currentDoc) {
             throw new Error("Document lost during processing.")
          }

          const status = currentDoc.status?.toLowerCase() || ""
          
          if (status === 'completed' || status === 'ready' || status === 'processed') {
            setUploadStep("processed")
            isComplete = true
            
            triggerToast({
              notification_id: `processed-${Date.now()}`,
              title: "Processing Completed",
              message: `${file.name} is fully analyzed and ready for AI Chat!`,
              type: "success",
              created_on: new Date().toISOString()
            })
            
            // Give a moment to show processed state
            await new Promise(resolve => setTimeout(resolve, 1000))
          } else if (status === 'failed' || status === 'error') {
            throw new Error("Document processing failed on the server.")
          }
        }
        
        // 3. Navigate to the new detail page
        router.push(`/dashboard/documents/${docId}`)
        
        setFile(null)
        onUploadSuccess()
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err)
        setError(errMsg)
        setUploadStep("idle")
        
        triggerToast({
          notification_id: `error-${Date.now()}`,
          title: "Processing Failed",
          message: errMsg,
          type: "error",
          created_on: new Date().toISOString()
        })
      } finally {
        setLoading(false)
      }
    },
    [file, onUploadSuccess, router, triggerToast]
  )


  const removeFile = () => setFile(null)

  const steps = [
    { id: "uploading", label: "Uploading", icon: <Upload className="h-4 w-4" /> },
    { id: "extracting", label: "Extracting", icon: <FileText className="h-4 w-4" /> },
    { id: "classifying", label: "Classifying", icon: <Zap className="h-4 w-4" /> },
    { id: "indexing", label: "Indexing", icon: <BrainCircuit className="h-4 w-4" /> },
    { id: "processed", label: "Processed", icon: <CheckCircle2 className="h-4 w-4" /> },
  ]

  const currentStepIdx = steps.findIndex(s => s.id === uploadStep)

  return (
    <div className="space-y-4 text-card-foreground transition-colors">
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative group cursor-pointer border-2 border-dashed rounded-xl p-3 transition-all duration-500 flex flex-col items-center justify-center text-center overflow-hidden",
          dragActive 
            ? "border-primary bg-primary/5 scale-[0.99]" 
            : "border-border hover:border-primary/40 bg-card hover:bg-accent/5 shadow-sm"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        {file ? (
          <div className="relative z-10 space-y-2 w-full animate-in fade-in zoom-in-95 duration-500">
            <div className="mx-auto w-10 h-10 bg-primary/5 text-primary rounded-lg flex items-center justify-center shadow-inner border border-primary/10">
              <FileText className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="font-bold text-foreground truncate max-w-sm mx-auto text-xs tracking-tight">{file.name}</p>
              <div className="flex items-center justify-center gap-1.5">
                <Badge variant="secondary" className="px-1 py-0 h-3 text-[8px] font-bold bg-muted/50 border-none">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Badge>
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60">Ready</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <Button 
                onClick={removeFile}
                variant="ghost" 
                className="rounded-lg h-7 px-3 font-bold text-[9px] uppercase tracking-widest text-muted-foreground hover:text-destructive transition-all"
                disabled={loading}
              >
                Discard
              </Button>
              <Button 
                onClick={handleUpload}
                className="rounded-lg h-7 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[9px] uppercase tracking-widest shadow-md transition-all hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Zap className="h-3 w-3 mr-1.5 fill-current" />}
                Ingest
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 space-y-2 py-1">
            <div className="mx-auto w-10 h-10 bg-muted/50 border border-border/50 rounded-lg flex items-center justify-center text-muted-foreground/40 group-hover:text-primary group-hover:bg-primary/5 transition-all duration-700 shadow-inner">
              <Upload className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-extrabold tracking-tight text-foreground">Upload Document</h3>
              <p className="text-[11px] font-medium text-muted-foreground/60 max-w-[200px] mx-auto leading-tight">
                Drop files here or click to browse.
              </p>
            </div>
            <div className="flex flex-col items-center pt-1">
              <Button 
                variant="outline" 
                className="rounded-lg h-8 border-border/50 font-bold text-[9px] uppercase tracking-widest px-6 bg-card hover:bg-accent transition-all shadow-sm group-hover:border-primary/30"
                asChild
              >
                <label className="cursor-pointer">
                  Browse Registry
                  <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.xls,.pptx,.ppt,.csv,.txt" />
                </label>
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-5 flex items-center gap-4 animate-in slide-in-from-top-2 duration-500 shadow-sm">
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-destructive/60 mb-1">Ingestion Failure</p>
            <p className="text-sm font-bold text-destructive/80 leading-tight">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
})
