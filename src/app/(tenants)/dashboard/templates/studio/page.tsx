"use client"

import * as React from "react"
import { api } from "@/lib/api"
import * as Types from "@/types/api"
import { getS3SignedUrl, getS3BlobUrl } from "@/lib/s3"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Sparkles, 
  UploadCloud, 
  MessageSquare, 
  Code2, 
  BrainCircuit,
  Loader2,
  Send,
  Trash2,
  Play,
  Layers,
  GitBranch,
  Briefcase,
  FileText,
  Cpu,
  Terminal,
  Upload,
  Eye,
  FileSearch,
  Maximize2,
  X,
  FileDown,
  ShieldCheck,
  ChevronRight
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { FileViewer } from "@/components/ui/file-viewer"
import { StudioChatInput } from "@/components/features/studio-chat-input"
import { StudioPromptInput } from "@/components/features/studio-prompt-input"


import { useSearchParams } from "next/navigation"

interface Message {
  role: "user" | "ai"
  suggestions?: Types.DocumentChatSuggestion[]
  text: string
}

type CreatedDocumentData = {
  document_id?: string | null;
  report_id?: string | null;
  filename?: string | null;
  title?: string | null;
  file_url?: string | null;
  document_url?: string | null;
  content?: string | null;
}

export default function StudioPage() {
  const searchParams = useSearchParams()
  const [industries, setIndustries] = React.useState<Types.IndustryResponse[]>([])
  const [selectedIndustryId, setSelectedIndustryId] = React.useState<string>(searchParams.get("industry_id") || "")
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>("")
  const [selectedSubcategoryId, setSelectedSubcategoryId] = React.useState<string>("")
  const [templates, setTemplates] = React.useState<Types.TemplateResponse[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>(searchParams.get("template_id") || "")
  
  const [loading, setLoading] = React.useState<{ industries: boolean; templates: boolean; action: boolean }>({
    industries: true,
    templates: false,
    action: false
  })

  const [prompt, setPrompt] = React.useState("")
  const [createdDocument, setCreatedDocument] = React.useState<CreatedDocumentData | null>(null)
  const [docContent, setDocContent] = React.useState<string>("")
  const [signedUrl, setSignedUrl] = React.useState<string | null>(null)
  const [isViewMode, setIsViewMode] = React.useState(false)
  const [dragActive, setDragActive] = React.useState(false)
  
  const [messages, setMessages] = React.useState<Message[]>([])
  const [chatInput, setChatInput] = React.useState("")
  const [chatLoading, setChatLoading] = React.useState(false)
  
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const fetchIndustries = React.useCallback(async () => {
    try {
      const data = await api.getIndustries()
      setIndustries(data || [])
    } catch (err) {
      console.error("Failed to load industries", err)
    } finally {
      setLoading(prev => ({ ...prev, industries: false }))
    }
  }, [])

  const fetchTemplates = React.useCallback(async (industryId: string) => {
    if (!industryId) return
    setLoading(prev => ({ ...prev, templates: true }))
    try {
      const data = await api.getTemplatesByIndustry(industryId)
      setTemplates(data || [])
    } catch (err) {
      console.error("Failed to load templates", err)
    } finally {
      setLoading(prev => ({ ...prev, templates: false }))
    }
  }, [])

  React.useEffect(() => {
    fetchIndustries()
  }, [fetchIndustries])

  const loadDocContent = React.useCallback(async (docId: string, fileUrl?: string, filename?: string) => {
    try {
      const res = await api.getDocumentContent(docId)
      setDocContent(res?.content || "No content extracted.")
      if (fileUrl) {
        const ext = filename?.split('.').pop()?.toLowerCase() || ""
        const isOfficeDoc = ["docx", "pptx", "xlsx", "doc", "ppt", "xls"].includes(ext)

        if (fileUrl.includes('X-Amz-Signature') || fileUrl.includes('x-amz-')) {
          setSignedUrl(fileUrl)
        } else if (isOfficeDoc) {
          const sUrl = await getS3SignedUrl(fileUrl)
          setSignedUrl(sUrl || fileUrl)
        } else {
          try {
            const blobUrl = await getS3BlobUrl(fileUrl)
            setSignedUrl(blobUrl)
          } catch {
            const sUrl = await getS3SignedUrl(fileUrl)
            setSignedUrl(sUrl || fileUrl)
          }
        }
      }
    } catch (err: any) {
      if (err.status === 404) {
        setDocContent("Content extraction in progress...")
        if (fileUrl) {
          const ext = filename?.split('.').pop()?.toLowerCase() || ""
          const isOfficeDoc = ["docx", "pptx", "xlsx", "doc", "ppt", "xls"].includes(ext)
          
          if (fileUrl.includes('X-Amz-Signature') || fileUrl.includes('x-amz-')) {
            setSignedUrl(fileUrl)
          } else if (isOfficeDoc) {
            const sUrl = await getS3SignedUrl(fileUrl)
            setSignedUrl(sUrl || fileUrl)
          } else {
            const blobUrl = await getS3BlobUrl(fileUrl)
            setSignedUrl(blobUrl)
          }
        }
      } else {
        console.error("Failed to load content", err)
      }
    }
  }, [])

  // Cleanup blob URLs
  React.useEffect(() => {
    return () => {
      if (signedUrl && signedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(signedUrl)
      }
    }
  }, [signedUrl])

  const handleIndustryChange = (val: string) => {
    setSelectedIndustryId(val)
    setSelectedCategoryId("")
    setSelectedSubcategoryId("")
    setSelectedTemplateId("")
    fetchTemplates(val)
  }

  const handleCategoryChange = (val: string) => {
    setSelectedCategoryId(val)
    setSelectedSubcategoryId("")
  }

  const processFile = React.useCallback(async (fileToProcess: File) => {
    setLoading(prev => ({ ...prev, action: true }))
    const formData = new FormData()
    formData.append("file", fileToProcess)
    
    const queryParams: Record<string, string> = {}
    if (selectedIndustryId) queryParams.industry_id = selectedIndustryId
    if (selectedCategoryId) queryParams.category_id = selectedCategoryId
    if (selectedSubcategoryId) queryParams.subcategory_id = selectedSubcategoryId
    if (selectedTemplateId) queryParams.template_id = selectedTemplateId

    try {
      const res = await api.uploadDocument(formData, queryParams)
      setCreatedDocument(res)
      if (res.document_id) {
        await loadDocContent(res.document_id, res.file_url, res.filename || fileToProcess.name)
        setIsViewMode(true)
      }
      setMessages([{ role: "ai", text: `Document **${res.filename || 'Uploaded File'}** processed. View the side-by-side results now.` }])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, action: false }))
    }
  }, [selectedIndustryId, selectedCategoryId, selectedSubcategoryId, selectedTemplateId, loadDocContent])

  const handleCreateDocument = async () => {
    if (!prompt) return
    setLoading(prev => ({ ...prev, action: true }))
    try {
      const res = await api.generateDocument({
        prompt,
        template_id: selectedTemplateId || undefined,
        industry_id: selectedIndustryId || undefined,
        category_id: selectedCategoryId || undefined,
        subcategory_id: selectedSubcategoryId || undefined
      })
      setCreatedDocument({
        content: res.content,
        document_url: res.document_url
      })
      setDocContent(res.content || "")
      
      if (res.document_url) {
        const url = res.document_url
        const ext = url.split('.').pop()?.toLowerCase().split('?')[0] || ""
        const isOfficeDoc = ["docx", "pptx", "xlsx", "doc", "ppt", "xls"].includes(ext)

        if (url.includes('X-Amz-Signature') || url.includes('x-amz-')) {
          setSignedUrl(url)
        } else if (isOfficeDoc) {
          const sUrl = await getS3SignedUrl(url)
          setSignedUrl(sUrl || url)
        } else {
          try {
            const blobUrl = await getS3BlobUrl(url)
            setSignedUrl(blobUrl)
          } catch {
            const sUrl = await getS3SignedUrl(url)
            setSignedUrl(sUrl || url)
          }
        }
      }

      setMessages([{ role: "ai", text: `I've successfully generated the document. Preview is now active.` }])
      setIsViewMode(true)
    } catch (err) {
      console.error(err)
      setMessages([{ role: "ai", text: "Error: Failed to generate document. Please try again." }])
    } finally {
      setLoading(prev => ({ ...prev, action: false }))
    }
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    processFile(e.target.files[0])
  }

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
      const droppedFile = e.dataTransfer.files[0]
      processFile(droppedFile)
    }
  }, [processFile])

  const handleChatSend = async (messageText: string) => {
    const docId = createdDocument?.document_id || createdDocument?.report_id
    const userMsg = messageText.trim()
    if (!userMsg || chatLoading || !docId) return

    setMessages(prev => [...prev, { role: "user", text: userMsg }])
    
    setChatLoading(true)

    try {
      const res = await api.chatWithDocs(docId, userMsg)
      const aiText = res?.response || (res as any)?.answer || "I'm sorry, I couldn't process that."
      const newSuggestions = res.suggestions || []
      setMessages(prev => [...prev, { role: "ai", text: aiText, suggestions: newSuggestions }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: "ai", text: "Error: Failed to process request." }])
    } finally {
      setChatLoading(false)
    }
  }

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const selectedIndustry = React.useMemo(() => 
    industries.find(i => i.industry_id === selectedIndustryId),
  [industries, selectedIndustryId])

  const categories = selectedIndustry?.categories || []
  const subcategories = (categories.find(c => c.category_id === selectedCategoryId))?.subcategories || []
  
  const filteredTemplates = React.useMemo(() => {
    return templates.filter(t => {
      if (selectedCategoryId && t.category_id !== selectedCategoryId) return false
      if (selectedSubcategoryId && t.subcategory_id !== selectedSubcategoryId) return false
      return true
    })
  }, [templates, selectedCategoryId, selectedSubcategoryId])

  const selectedTemplate = templates.find(t => t.template_id === selectedTemplateId)

  return (
    <div className="flex flex-col h-full space-y-6 min-h-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-4 rounded-md border border-border shadow-sm shrink-0">
        <div className="flex items-center gap-4 shrink-0">
          <div className="bg-primary text-primary-foreground p-2 rounded-md shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground leading-none">AI Studio</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 leading-none">System Core Active</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-1 lg:justify-end">
          <Select value={selectedIndustryId} onValueChange={handleIndustryChange}>
            <SelectTrigger className="w-[140px] h-9 rounded-md bg-muted border-none font-bold text-[10px] uppercase tracking-wider">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-border">
              {industries.map(ind => <SelectItem key={ind.industry_id} value={ind.industry_id} className="text-xs font-bold">{ind.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedCategoryId} onValueChange={handleCategoryChange} disabled={!selectedIndustryId}>
            <SelectTrigger className="w-[140px] h-9 rounded-md bg-muted border-none font-bold text-[10px] uppercase tracking-wider">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-border">
              {categories.map(cat => <SelectItem key={cat.category_id} value={cat.category_id} className="text-xs font-bold">{cat.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedSubcategoryId} onValueChange={setSelectedSubcategoryId} disabled={!selectedCategoryId}>
            <SelectTrigger className="w-[140px] h-9 rounded-md bg-muted border-none font-bold text-[10px] uppercase tracking-wider">
              <SelectValue placeholder="Subcategory" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-border">
              {subcategories.map(sub => <SelectItem key={sub.subcategory_id} value={sub.subcategory_id} className="text-xs font-bold">{sub.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <div className="h-6 w-[1px] bg-border hidden lg:block mx-1" />

          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId} disabled={!selectedIndustryId || loading.templates}>
            <SelectTrigger className="w-[180px] h-9 rounded-md bg-primary/5 text-primary border-none font-bold text-[10px] uppercase tracking-wider">
              <SelectValue placeholder={loading.templates ? "Scanning..." : "Select Template"} />
            </SelectTrigger>
            <SelectContent className="rounded-md border-border">
              {filteredTemplates.map(tmp => <SelectItem key={tmp.template_id} value={tmp.template_id} className="text-xs font-bold">{tmp.template_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-12 gap-6 min-h-0">
        <div className="lg:col-span-7 flex flex-col space-y-6 min-h-0 overflow-hidden">
          <Card 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "flex-1 rounded-md border border-border shadow-sm bg-card flex flex-col overflow-hidden transition-all duration-300",
              dragActive && "ring-2 ring-primary bg-primary/5 scale-[0.99]"
            )}
          >
            <CardHeader className="p-6 pb-2 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">Document Analysis</CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground mt-1">Configure generation or parsing workflows.</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-6 flex flex-col space-y-6 min-h-0 overflow-hidden">
              <div className="flex-1 flex flex-col space-y-2 min-h-0">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Cpu className="h-3 w-3" /> System Instructions
                  </label>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{prompt.length} Chars</span>
                </div>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe document requirements in detail..."
                  className="flex-1 w-full bg-muted/30 border border-border focus:ring-2 focus:ring-primary/10 rounded-md p-6 text-base font-medium outline-none transition-all resize-none placeholder:text-muted-foreground/50 text-foreground shadow-inner"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 shrink-0">
                <Button 
                  onClick={handleCreateDocument}
                  disabled={!prompt || loading.action}
                  className="h-14 rounded-md font-bold text-sm shadow-md gap-3 group transition-all"
                >
                  {loading.action ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 group-hover:scale-110" />}
                  Generate Intelligence
                </Button>
                
                <div className="relative">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleUpload}
                    disabled={loading.action}
                    accept="image/*,.pdf,.docx,.xlsx,.csv,.txt"
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading.action}
                    variant="outline"
                    className="w-full h-14 rounded-md border-border bg-background hover:bg-muted text-foreground font-bold text-sm gap-3 group transition-all shadow-sm"
                  >
                    {loading.action ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5 group-hover:-translate-y-1" />}
                    Parse Document
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 flex flex-col min-h-0 overflow-hidden">
          <Card className="flex-1 rounded-md border border-border shadow-sm bg-card flex flex-col overflow-hidden">
            <CardHeader className="p-6 pb-3 border-b border-border shrink-0 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center text-primary">
                  {isViewMode ? <Eye className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    {isViewMode ? "Preview Mode" : "Companion"}
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {isViewMode ? "Visual Verification" : "Active Intelligence"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {isViewMode ? (
                <div className="flex-1 grid grid-rows-2 divide-y divide-border overflow-hidden">
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="p-3 bg-muted/50 border-b border-border flex items-center px-6">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Cpu className="h-3 w-3" /> Extraction Buffer
                      </span>
                    </div>
                    <ScrollArea className="flex-1 p-3">
                      <pre className="text-xs font-medium text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                        {docContent}
                      </pre>
                    </ScrollArea>
                  </div>

                  <div className="flex flex-col h-full overflow-hidden bg-muted/20">
                    <div className="p-3 bg-muted/50 border-b border-border flex items-center justify-between px-6">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <FileText className="h-3 w-3" /> Document Source
                      </span>
                    </div>
                    <div className="flex-1 relative overflow-hidden">
                      {signedUrl ? (
                        <FileViewer 
                          url={signedUrl} 
                          filename={createdDocument?.filename || createdDocument?.title || "document"} 
                          className="h-full"
                          fileType={signedUrl?.startsWith('blob:') ? ((createdDocument?.filename || createdDocument?.title)?.split('.').pop()?.toLowerCase() || 'pdf') : undefined}
                        />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-30 gap-3">
                          <FileSearch className="h-10 w-10" />
                          <p className="text-[10px] font-bold uppercase tracking-wider">No Visual Frame</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0">
                  <ScrollArea className="flex-1 p-6">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-30">
                        <BrainCircuit className="h-12 w-12 text-muted-foreground" />
                        <div className="space-y-1">
                          <p className="font-bold text-[10px] uppercase tracking-widest">Idle State</p>
                          <p className="text-xs font-medium">Generate context to begin chat.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {messages.map((msg, i) => (
                          <div key={i} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                            <div className={cn(
                              "max-w-[90%] p-4 rounded-md text-sm font-medium leading-relaxed shadow-sm",
                              msg.role === "user" 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted text-foreground border border-border"
                            )}>
                              {msg.text}
                              {msg.suggestions && msg.suggestions.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {msg.suggestions.map((s, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleChatSend(s.label)}
                                      className="text-[10px] font-bold bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-md transition-all border border-white/10"
                                    >
                                      {s.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="mt-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                              {msg.role === "user" ? "Client" : "Studio AI"}
                            </span>
                          </div>
                        ))}
                        <div ref={scrollRef} />
                      </div>
                    )}
                  </ScrollArea>

                  <div className="p-6 border-t border-border shrink-0">
                    <StudioChatInput 
                        onSend={handleChatSend} 
                        disabled={!createdDocument} 
                        loading={chatLoading} 
                      />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
