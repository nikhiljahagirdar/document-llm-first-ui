"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import * as Types from "@/types/api"
import { 
  ChevronLeft, 
  Download, 
  FileText, 
  Printer, 
  Share2, 
  ShieldCheck, 
  Zap,
  Sparkles,
  FileDown,
  MessageSquare,
  Send,
  History,
  FileEdit,
  CheckCircle2,
  BrainCircuit,
  Loader2,
  Trash2,
  ExternalLink,
  X,
  FileSearch
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileViewer } from "@/components/ui/file-viewer"
import { cn, formatDate } from "@/lib/utils"
import { getS3BlobUrl, getS3SignedUrl } from "@/lib/s3"
import { DataRenderer } from "@/components/ui/data-renderer"
import { DocumentChatDialog } from "@/components/features/document-chat-dialog"
import { useChatStore } from "@/lib/chat-store"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { DoclingRenderer } from "@/components/ui/docling-renderer"
import { DocumentHistoryDialog } from "@/components/features/document-history-dialog"
import { DocumentMetadataDialog } from "@/components/features/document-metadata-dialog"


export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const docId = params.id as string
  
  const [doc, setDoc] = React.useState<Types.DocumentResponse | null>(null)
  const [extractedContent, setExtractedContent] = React.useState<string>("")
  const [loading, setLoading] = React.useState(true)
  const [signedUrl, setSignedUrl] = React.useState<string | null>(null)
  const [signedImages, setSignedImages] = React.useState<{ uri: string, image_id: string }[]>([])
  
  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [isFetchingMore, setIsFetchingMore] = React.useState(false)
  const loadMoreRef = React.useRef<HTMLDivElement>(null)

  // New features state
  const setChatOpen = useChatStore((state) => state.setIsOpen)
  const [isSummarizing, setIsSummarizing] = React.useState(false)
  const [summary, setSummary] = React.useState<string | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)
  const [isEditMetadataOpen, setIsEditMetadataOpen] = React.useState(false)
  const [isEditingContent, setIsEditContent] = React.useState(false)
  
  // Metadata state
  const [industries, setIndustries] = React.useState<Types.IndustryResponse[]>([])
  const [selectedIndustryId, setSelectedIndustryId] = React.useState<string>("")
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>("")
  const [selectedSubcategoryId, setSelectedSubcategoryId] = React.useState<string>("")
  const [isSavingMetadata, setIsSavingMetadata] = React.useState(false)

  // Local state for comments
  const [comments, setComments] = React.useState<Record<string, { id: string, user: string, text: string, date: string }[]>>({})
  const [activeCommentBox, setActiveCommentBox] = React.useState<string | null>(null)
  const [newComment, setNewComment] = React.useState("")

  const [error, setError] = React.useState<string | null>(null)

  const fetchIndustries = React.useCallback(async () => {
    try {
      const data = await api.getIndustries()
      setIndustries(data || [])
    } catch (err) {
      console.error("Failed to load industries", err)
    }
  }, [])

  const fetchDocDetails = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      let targetDoc: Types.DocumentResponse | null = null
      let cData: Types.PaginatedDocumentContentResponse | null = null

      try {
        const [docData, contentData] = await Promise.all([
          api.getDocument(docId),
          api.getDocumentContent(docId, 1, 200).catch(() => ({ content: "", page: 1, total_pages: 1, document_id: docId, page_size: 200, total_characters: 0, created_on: null }))
        ])
        targetDoc = docData
        cData = contentData as Types.PaginatedDocumentContentResponse
      } catch (singleFetchErr) {
        console.warn("Single doc fetch failed, trying list fallback...", singleFetchErr)
        const allDocs = await api.getDocuments()
        const found = allDocs.find(d => d.document_id === docId)
        if (found) {
            targetDoc = found as Types.DocumentResponse
        }
        
        if (!targetDoc) throw new Error("Document not found in registry.")
        
        cData = await api.getDocumentContent(docId, 1, 200).catch(() => ({ content: "", page: 1, total_pages: 1, document_id: docId, page_size: 200, total_characters: 0, created_on: null })) as Types.PaginatedDocumentContentResponse
      }
      
      setDoc(targetDoc)
      setExtractedContent(cData?.content || "")
      setCurrentPage(cData?.page || 1)
      setTotalPages(cData?.total_pages || 1)

      if (targetDoc) {
        setSelectedIndustryId(targetDoc.industry_id || "")
        setSelectedCategoryId(targetDoc.category_id || "")
        setSelectedSubcategoryId(targetDoc.subcategory_id || "")
        
        if (targetDoc.file_url) {
          const url = targetDoc.file_url
          const filename = targetDoc.filename || ""
          const ext = filename.split('.').pop()?.toLowerCase() || ""
          const isOfficeDoc = ["docx", "pptx", "xlsx", "doc", "ppt", "xls"].includes(ext)
          
          const isAlreadySigned = url.toLowerCase().includes('x-amz-signature') || url.toLowerCase().includes('x-amz-algorithm')
          const isBlob = url.startsWith('blob:')
          const isLocal = url.startsWith('http') && (url.includes('localhost') || url.includes('127.0.0.1'))
          
          if (isAlreadySigned || isBlob || isLocal) {
            setSignedUrl(url)
          } else if (isOfficeDoc) {
            // Office docs need a public-facing URL for MS Office Online viewer
            try {
              const sUrl = await getS3SignedUrl(url)
              setSignedUrl(sUrl || url)
            } catch (err) {
              setSignedUrl(url)
            }
          } else {
            try {
              const bUrl = await getS3BlobUrl(url)
              setSignedUrl(bUrl || url)
            } catch (err) {
              // Fallback to signed URL if blob fails
              const sUrl = await getS3SignedUrl(url)
              setSignedUrl(sUrl || url)
            }
          }
        }

        if (targetDoc.images && targetDoc.images.length > 0) {
          const sImages = await Promise.all(targetDoc.images.map(async (img: Types.DocumentImageResponse) => {
            const imgUrl = img.image_url
            const isImgSigned = imgUrl.toLowerCase().includes('x-amz-signature') || imgUrl.toLowerCase().includes('x-amz-algorithm')
            
            if (isImgSigned || imgUrl.startsWith('blob:')) {
              return { uri: imgUrl, image_id: img.image_id }
            } else {
              try {
                const signed = await getS3SignedUrl(imgUrl)
                return { uri: signed || imgUrl, image_id: img.image_id }
              } catch {
                return { uri: imgUrl, image_id: img.image_id }
              }
            }
          }))
          setSignedImages(sImages)
        }
      }
    } catch (err: any) {
      console.error("Critical failure in fetchDocDetails:", err)
      setError(err.message || "Failed to load document details.")
    } finally {
      setLoading(false)
    }
  }, [docId])

  const fetchMoreContent = React.useCallback(async () => {
    if (isFetchingMore || currentPage >= totalPages) return
    
    setIsFetchingMore(true)
    try {
      const nextPage = currentPage + 1
      const res = await api.getDocumentContent(docId, nextPage, 200)
      
      if (res?.content) {
        setExtractedContent(prev => prev + "\n" + res.content)
        setCurrentPage(res.page)
        setTotalPages(res.total_pages)
      }
    } catch (err) {
      console.error("Failed to load more content", err)
    } finally {
      setIsFetchingMore(false)
    }
  }, [docId, currentPage, totalPages, isFetchingMore])

  React.useEffect(() => {
    if (!loadMoreRef.current) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) fetchMoreContent()
    }, { threshold: 0.1, rootMargin: '200px' })
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [fetchMoreContent])

  React.useEffect(() => {
    return () => {
      if (signedUrl && signedUrl.startsWith('blob:')) URL.revokeObjectURL(signedUrl)
      signedImages.forEach(img => { if (img.uri.startsWith('blob:')) URL.revokeObjectURL(img.uri) })
    }
  }, [signedUrl, signedImages])

  React.useEffect(() => {
    fetchDocDetails()
    fetchIndustries()
  }, [fetchDocDetails, fetchIndustries])

  const handleAddComment = (sectionKey: string) => {
    if (!newComment.trim()) return
    const fullName = user?.first_name ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}` : null
    const comment = {
      id: Math.random().toString(36).substr(2, 9),
      user: fullName || user?.email || "Anonymous",
      text: newComment,
      date: new Date().toISOString()
    }
    setComments(prev => ({ ...prev, [sectionKey]: [...(prev[sectionKey] || []), comment] }))
    setNewComment(""); setActiveCommentBox(null);
  }

  const handleSummarize = async () => {
    setIsSummarizing(true)
    try {
      const res = await api.summarizeChat({ document_id: docId })
      setSummary(res?.summary || res?.response || "Failed to generate summary.")
    } catch (err) { console.error(err) } finally { setIsSummarizing(false) }
  }

  const handleSaveContent = async () => {
    setIsSavingMetadata(true)
    try {
      await api.updateDocumentContent(docId, extractedContent)
      setIsEditContent(false)
      await fetchDocDetails()
    } catch (err) { console.error("Failed to save content", err) } finally { setIsSavingMetadata(false) }
  }

  const handleSaveMetadata = async () => {
    setIsSavingMetadata(true)
    try {
      await api.reprocessDocument(docId) 
      await fetchDocDetails()
      setIsEditMetadataOpen(false)
    } catch (err) { console.error("Failed to save metadata", err) } finally { setIsSavingMetadata(false) }
  }

  const handleReprocess = async () => {
    setIsSavingMetadata(true)
    try {
      await api.reprocessDocument(docId)
      await fetchDocDetails()
    } catch (err) {
      console.error("Failed to reprocess document", err)
    } finally {
      setIsSavingMetadata(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <p className="font-semibold text-indigo-600 tracking-normal text-xs">Syncing Evidence...</p>
        </div>
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center space-y-6 text-center">
        <div className="h-20 w-20 rounded-full bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center">
          <X className="h-10 w-10 text-rose-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Access Denied or Not Found</h2>
          <p className="text-muted-foreground max-w-sm mx-auto font-medium">{error || "The requested intelligence asset is currently unavailable."}</p>
        </div>
        <Button onClick={() => router.push("/dashboard/documents")} variant="outline" className="rounded-xl font-bold text-xs uppercase tracking-widest px-8">
          Return to Archive
        </Button>
      </div>
    )
  }

  const selectedIndustry = industries.find(i => i.industry_id === selectedIndustryId)
  const categories = selectedIndustry?.categories || []
  const subcategories = categories.find((c: Types.CategoryResponse) => c.category_id === selectedCategoryId)?.subcategories || []

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl h-10 w-10 hover:bg-primary/5 border border-border/50 transition-all shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground truncate max-w-xl">{doc?.filename}</h1>
              <div className={cn("flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-widest shadow-sm ring-1", String(doc?.status || '').toLowerCase() === 'ready' ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20" : "bg-amber-500/10 text-amber-600 ring-amber-500/20")}>
                <div className="h-1 w-1 rounded-full bg-current animate-pulse" />
                {String(doc?.status || '').toUpperCase()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {doc?.industry_name && <Badge variant="outline" className="h-5 px-2 text-[9px] font-extrabold uppercase tracking-[0.1em] border-indigo-200 text-indigo-600 bg-indigo-50/50">{doc.industry_name}</Badge>}
              {doc?.category_name && <Badge variant="outline" className="h-5 px-2 text-[9px] font-extrabold uppercase tracking-[0.1em] border-emerald-200 text-emerald-600 bg-emerald-50/50">{doc.category_name}</Badge>}
              <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground/40 hover:text-primary" onClick={() => setIsEditMetadataOpen(true)}><FileEdit className="h-3 w-3" /></Button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl h-9 font-bold text-[10px] uppercase px-4 gap-2" onClick={handleReprocess} disabled={isSavingMetadata}>
            {isSavingMetadata ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <History className="h-3.5 w-3.5" />} Retry
          </Button>
          <Button variant="outline" className="rounded-xl h-9 font-bold text-[10px] uppercase px-4 gap-2" onClick={() => setIsHistoryOpen(true)}><History className="h-3.5 w-3.5" /> Lifecycle</Button>
          <Button variant="outline" className="rounded-xl h-9 font-bold text-[10px] uppercase px-4 gap-2" onClick={handleSummarize} disabled={isSummarizing}>
            {isSummarizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-primary" />} Summarize
          </Button>
          <Button className="rounded-xl h-9 bg-primary text-primary-foreground font-bold text-[10px] uppercase px-5 gap-2" onClick={() => setChatOpen(true)}><MessageSquare className="h-3.5 w-3.5 fill-current" /> AI Chat</Button>
        </div>
      </div>

      {/* Split Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden min-h-0 pb-1">
        <div className="flex-1 rounded-2xl border border-border bg-card shadow-lg overflow-hidden flex flex-col group relative">
          <div className="h-12 border-b border-border px-5 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-background flex items-center justify-center border border-border shadow-sm"><FileText className="h-3.5 w-3.5 text-muted-foreground" /></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source Evidence</span>
            </div>
            <Badge variant="outline" className="text-[8px] font-extrabold border-primary/20 text-primary bg-primary/5 tracking-widest uppercase">S3 Secured</Badge>
          </div>
          <div className="flex-1 overflow-hidden relative bg-accent/5">
            {signedUrl ? (
              <div className="h-full flex flex-col">
                <div className="flex-1 min-h-0">
                  <FileViewer 
                    url={signedUrl} 
                    filename={doc?.filename || "document"} 
                    fileType={signedUrl?.startsWith('blob:') ? (doc?.filename?.split('.').pop()?.toLowerCase() || 'pdf') : undefined}
                  />
                </div>
                {signedImages.length > 0 && (
                  <div className="h-32 border-t border-border bg-card p-4">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground mb-3">Evidence Blocks ({signedImages.length})</p>
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                      {signedImages.map((img, idx) => (
                        <div key={img.image_id} className="h-16 w-24 shrink-0 rounded-xl border border-border overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary hover:scale-105 transition-all bg-muted/30 shadow-sm" onClick={() => setSignedUrl(img.uri)}>
                          <img src={img.uri} alt={`Embedded ${idx}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-30">
                <div className="h-16 w-16 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center"><FileSearch className="h-6 w-6" /></div>
                <p className="font-bold tracking-[0.2em] text-[9px] uppercase">No Source Preview</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col group relative">
          <div className="h-12 border-b border-border px-5 flex items-center justify-between bg-muted/20 relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-primary fill-current" /><span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Intelligence</span></div>
              <div className="flex bg-background p-0.5 rounded-lg border border-border shadow-inner">
                <button onClick={() => setIsEditContent(false)} className={cn("px-3 py-1 text-[9px] font-extrabold uppercase rounded-md transition-all", !isEditingContent ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground")}>Structured</button>
                <button onClick={() => setIsEditContent(true)} className={cn("px-3 py-1 text-[9px] font-extrabold uppercase rounded-md transition-all", isEditingContent ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground")}>Semantic</button>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
               {isEditingContent && <Button size="sm" onClick={handleSaveContent} disabled={isSavingMetadata} className="h-8 px-3 text-[9px] font-extrabold uppercase gap-1.5 bg-primary rounded-lg shadow-sm">{isSavingMetadata ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />} Save</Button>}
               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary transition-colors"><FileDown className="h-3.5 w-3.5" /></Button>
               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary transition-colors"><Printer className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1 bg-accent/5">
            <div className="p-1.5 md:p-2 h-full">
              {isEditingContent ? (
                <div className="max-w-4xl mx-auto h-full min-h-[700px] flex flex-col">
                  <div className="flex-1 bg-card border border-border rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] p-4 md:px-8 md:py-8 relative focus-within:ring-2 focus-within:ring-primary/20">
                    <div className="absolute top-6 right-8"><div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 animate-pulse"><div className="h-1.5 w-1.5 rounded-full bg-current" /><span className="text-[9px] font-extrabold uppercase">Correction Active</span></div></div>
                    <textarea value={extractedContent} onChange={(e) => setExtractedContent(e.target.value)} className="w-full h-full min-h-[600px] bg-transparent outline-none resize-none font-mono text-xs leading-relaxed text-foreground/80 selection:bg-primary/20" placeholder="Semantic extraction text will appear here..." />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary && (
                    <Card className="max-w-3xl mx-auto border-primary/20 bg-primary/[0.02] shadow-xl overflow-hidden rounded-2xl">
                      <div className="p-3 border-b border-primary/10 bg-primary/[0.05] flex items-center justify-between">
                        <div className="flex items-center gap-2"><div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center"><Sparkles className="h-3 w-3 text-primary fill-current" /></div><span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-primary">AI Intelligence</span></div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-primary/40 hover:text-primary" onClick={() => setSummary(null)}><X className="h-3 w-3" /></Button>
                      </div>
                      <CardContent className="p-5"><p className="text-xs font-medium text-foreground/80 leading-relaxed italic border-l-4 border-primary/20 pl-4">&ldquo;{summary}&rdquo;</p></CardContent>
                    </Card>
                  )}
                  <div className="max-w-4xl mx-auto bg-card shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] rounded-2xl min-h-[800px] p-3 md:px-6 md:py-6 border border-border relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-indigo-500 to-violet-500" />
                    <div className="space-y-6">
                      <div className="flex justify-between items-start border-b border-border pb-6">
                        <div className="space-y-1">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2"><BrainCircuit className="h-5 w-5 text-primary" /></div>
                          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Intelligence Report</h2>
                          <div className="flex items-center gap-2"><span className="text-primary font-bold text-[9px] uppercase tracking-[0.15em]">{doc?.industry_name || 'General'} Domain</span><div className="h-1 w-1 rounded-full bg-muted-foreground/30" /><span className="text-muted-foreground font-bold text-[9px] uppercase tracking-[0.15em]">Verified extraction</span></div>
                        </div>
                        <div className="text-right space-y-0.5">
                          <p className="text-[9px] font-extrabold text-muted-foreground/40 uppercase tracking-[0.15em] mb-1">Ingestion Cycle</p>
                          <p className="text-xs font-extrabold text-foreground">{formatDate(doc?.created_on || (doc as any)?.created_at)}</p>
                          <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">v{(doc as any)?.version || 1}.0.0</p>
                        </div>
                      </div>
                      <div className="prose dark:prose-invert prose-sm max-w-none">
                        {(doc as any)?.structured_data ? (
                          <div className="space-y-8">
                            {Object.entries((doc as any).structured_data).map(([key, value]) => (
                              <div key={key} className="space-y-3 group/section relative">
                                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" /><h4 className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-primary">{key.replace(/_/g, ' ')}</h4></div><Button variant="ghost" size="sm" onClick={() => setActiveCommentBox(key)} className="h-7 px-2.5 text-[9px] font-extrabold uppercase opacity-0 group-hover/section:opacity-100 rounded-lg transition-all"><MessageSquare className="h-3 w-3" /> Annotate</Button></div>
                                <div className="p-3 md:p-4 rounded-xl bg-muted/20 border border-border group-hover/section:border-primary/20 transition-all"><DataRenderer data={value} /></div>
                                {comments[key] && (
                                  <div className="ml-6 space-y-2 mt-3">
                                    {comments[key].map((c) => (
                                      <div key={c.id} className="p-3 rounded-xl bg-card border border-border shadow-sm relative ring-1 ring-black/5"><div className="absolute top-0 left-0 h-full w-1 bg-primary rounded-l-xl opacity-50" /><div className="flex items-center justify-between mb-1"><div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">{c.user.charAt(0)}</div><p className="text-[9px] font-extrabold text-foreground uppercase tracking-widest">{c.user}</p></div><p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">{new Date(c.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div><p className="text-xs font-medium text-foreground/80 leading-relaxed">{c.text}</p></div>
                                    ))}
                                  </div>
                                )}
                                {activeCommentBox === key && (
                                  <div className="mt-3 p-3 rounded-2xl border-2 border-primary/20 bg-card shadow-2xl animate-in zoom-in-95 ring-1 ring-black/5">
                                    <div className="flex items-center gap-2 mb-2"><MessageSquare className="h-3 w-3 text-primary" /><span className="text-[9px] font-extrabold uppercase tracking-[0.1em]">New Annotation</span></div>
                                    <textarea autoFocus value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Synthesise your thoughts..." className="w-full text-xs font-medium bg-transparent outline-none resize-none h-16 mb-2 leading-relaxed" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(key); } if (e.key === 'Escape') setActiveCommentBox(null); }} />
                                    <div className="flex justify-end gap-2 pt-1.5 border-t border-border/50"><Button size="sm" variant="ghost" onClick={() => { setActiveCommentBox(null); setNewComment(""); }} className="h-7 rounded-lg text-[9px] font-extrabold uppercase">Discard</Button><Button size="sm" onClick={() => handleAddComment(key)} className="h-7 px-4 rounded-lg text-[9px] font-extrabold uppercase gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20"><Send className="h-3 w-3 fill-current" /> Commit</Button></div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-4"><FileText className="h-3.5 w-3.5 text-primary" /><h4 className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-primary">Raw Semantic Transcription</h4></div>
                            <div className="rounded-2xl border border-border/30 overflow-hidden bg-muted/10">
                               {(() => {
                                 try {
                                   const json = JSON.parse(extractedContent)
                                   if (json.body && json.texts && json.groups) return <div className="p-3 md:p-6 bg-card/50 backdrop-blur-sm"><DoclingRenderer document={json} /></div>
                                 } catch (e) {}
                                 return <div className="text-[11px] font-medium text-foreground/50 leading-relaxed whitespace-pre-wrap font-mono p-4 md:p-6">{extractedContent || "Initiating data stream..."}</div>
                               })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-12 flex items-center justify-center gap-4 opacity-10"><div className="h-px flex-1 bg-current" /><div className="h-2 w-2 rounded-full bg-current" /><span className="text-[9px] font-extrabold uppercase tracking-[0.4em]">End of Transmission</span><div className="h-2 w-2 rounded-full bg-current" /><div className="h-px flex-1 bg-current" /></div>
                  </div>
                </div>
              )}
              <div ref={loadMoreRef} className="py-12 flex flex-col items-center justify-center space-y-4">
                {isFetchingMore && <><div className="relative h-10 w-10"><div className="absolute inset-0 rounded-full border-4 border-primary/20" /><div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" /></div><p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-primary animate-pulse">Streaming Intelligence...</p></>}
                {!isFetchingMore && currentPage < totalPages && <div className="flex flex-col items-center gap-4 opacity-20"><div className="h-1 w-24 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary/40 w-1/3 animate-[progress_3s_infinite_linear]" /></div><p className="text-[8px] font-extrabold uppercase tracking-[0.3em]">Synching next semantic block</p></div>}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      <DocumentChatDialog documentId={docId} documentFilename={doc?.filename || undefined} />
      
      <DocumentHistoryDialog isOpen={isHistoryOpen} onClose={setIsHistoryOpen} doc={doc} docId={docId} onRestore={fetchDocDetails} />

      <DocumentMetadataDialog isOpen={isEditMetadataOpen} onClose={setIsEditMetadataOpen} docId={docId} industries={industries} initialIndustryId={selectedIndustryId} initialCategoryId={selectedCategoryId} initialSubcategoryId={selectedSubcategoryId} onSaved={fetchDocDetails} />
    </div>
  )
}
