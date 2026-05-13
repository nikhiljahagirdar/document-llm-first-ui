"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"
import * as Types from "@/types/api"
import { useDocStore, useUIStore } from "@/lib/store"
import { 
  MessageSquare, 
  Send, 
  BrainCircuit, 
  Cpu, 
  Trash2, 
  Loader2,
  Zap,
  Image as ImageIcon,
  Paperclip,
  X,
  History,
  FileText,
  Menu
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChatMessageContent } from "@/components/features/chat-message-content"
import { ChatChart } from "@/components/features/chat-chart"

interface Message {
  role: "user" | "ai"
  text: string
  timestamp: Date
  attachments?: { name: string, type: string, url: string }[]
  suggestions?: Types.DocumentChatSuggestion[]
  chart_data?: Record<string, unknown> | null
}

export default function ChatPage() {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [query, setQuery] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [targetDocId, setTargetDocId] = React.useState<string>("all")
  
  const { documents, fetchDocuments } = useDocStore()
  const { toggleSidebar } = useUIStore()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSend = async (e?: React.FormEvent, directMsg?: string) => {
    if (e) e.preventDefault()
    
    const targetQuery = directMsg !== undefined ? directMsg : query
    if ((!targetQuery.trim() && selectedFiles.length === 0) || loading) return

    const userMsg = targetQuery.trim()
    const isEditPrompt = userMsg.toLowerCase().startsWith("/edit") || userMsg.toLowerCase().startsWith("/update")
    const currentFiles = [...selectedFiles]
    
    const attachments = currentFiles.map(f => ({
      name: f.name,
      type: f.type,
      url: URL.createObjectURL(f)
    }))

    setMessages((prev) => [...prev, { 
      role: "user", 
      text: userMsg || (currentFiles.length > 0 ? "Uploaded attachments" : ""), 
      timestamp: new Date(),
      attachments
    }])
    
    setQuery("")
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setSelectedFiles([])
    setLoading(true)

    try {
      if (currentFiles.length > 0) {
        for (const file of currentFiles) {
          const formData = new FormData()
          formData.append("file", file)
          // No categorisation parameters now passed as desired
          await api.uploadDocument(formData, {})
        }
        await fetchDocuments()
      }

      let aiResponse = ""
      let newSuggestions: Types.DocumentChatSuggestion[] = []
      let newChartData: Record<string, unknown> | null = null

      const isTargeted = targetDocId !== "all"
      if (isTargeted && isEditPrompt) {
        const res = await api.chatWithDocs(targetDocId, userMsg)
        aiResponse = res.response || res.answer || "Document updated."
        newSuggestions = res.suggestions || []
        newChartData = (res.chart_data as unknown as Record<string, unknown>) || null
      } else if (isTargeted) {
        const res = await api.chatWithDocs(targetDocId, userMsg)
        aiResponse = res.response || res.answer || "Processing complete."
        newSuggestions = res.suggestions || []
        newChartData = (res.chart_data as unknown as Record<string, unknown>) || null
      } else {
        // General Chat Fallback (Tenant-wide RAG or General Assistant)
        try {
          const res = await api.chatRAGAgent({ user_input: userMsg })
          aiResponse = res.response || res.answer || "Processing complete."
          newSuggestions = res.suggestions || []
          newChartData = (res.chart_data as unknown as Record<string, unknown>) || null
        } catch {
          // Fallback if RAG agent is not available
          aiResponse = "I'm your general assistant. I'm here to help you with your documents and general inquiries."
        }
      }
      
      setMessages((prev) => [...prev, { 
        role: "ai", 
        text: aiResponse, 
        timestamp: new Date(),
        suggestions: newSuggestions,
        chart_data: newChartData
      }])
    } catch (err: unknown) {
      setMessages((prev) => [...prev, { 
        role: "ai", 
        text: "Error: " + (err instanceof Error ? err.message : String(err)),
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10" onClick={toggleSidebar}>
            <Menu className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-4xl font-semibold tracking-tight text-card-foreground flex items-center gap-3">
              <div className="bg-indigo-600 p-1.5 md:p-2 rounded-md md:rounded-md shadow-md text-white">
                <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <span className="truncate">AI Chat</span>
            </h1>
            <p className="hidden md:block text-slate-500 dark:text-slate-400 text-sm md:text-lg font-medium mt-1">Ask questions about your documents using AI.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 ml-auto md:ml-0">
          <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-semibold text-xs md:text-xs tracking-normal h-7 md:h-8 px-3 md:px-4 shadow-sm whitespace-nowrap">
            <Zap className="h-3 w-3 mr-1.5 md:mr-2" /> System Core Active
          </Badge>
          <Select value={targetDocId} onValueChange={setTargetDocId}>
            <SelectTrigger className="h-8 md:h-10 w-auto min-w-[160px] md:min-w-[200px] bg-card border border-border/60 shadow-sm hover:shadow-md rounded-xl text-xs font-bold gap-2 transition-all">
              <History className="h-4 w-4 text-primary" />
              <SelectValue placeholder="Target: All Documents" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border shadow-2xl">
              <SelectItem value="all" className="text-xs font-bold">All Documents (Global)</SelectItem>
              {documents.filter(d => d.status === 'completed').map((doc) => (
                <SelectItem key={doc.document_id} value={doc.document_id} className="text-xs font-bold">
                  {doc.filename}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 md:h-11 md:w-11 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            onClick={() => setMessages([])}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col rounded-xl border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-card overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50/50 dark:to-slate-950/20 pointer-events-none" />
        
        <CardContent className="flex-1 p-0 flex flex-col overflow-hidden relative z-10">
          <ScrollArea className="flex-1 px-2 md:px-4 py-4 md:py-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 md:p-12 space-y-6 md:space-y-8 mt-10 md:mt-20">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                  <div className="bg-card p-6 md:p-10 rounded-2xl shadow-2xl relative border border-slate-50 dark:border-slate-700">
                    <BrainCircuit className="h-12 w-12 md:h-20 md:w-20 text-indigo-600" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl md:text-2xl font-semibold tracking-normal text-card-foreground">Start Conversation</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm leading-relaxed text-sm md:text-base">
                    Ask questions about your uploaded documents or chat generally. The AI will provide intelligent answers, tables, and charts.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 w-full max-w-md">
                  <QuickPrompt text="Summarize my latest document" onClick={(t) => handleSend(undefined, t)} />
                  <QuickPrompt text="Analyze project trends for last month" onClick={(t) => handleSend(undefined, t)} />
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-10">
                {messages.map((msg, idx) => (
                  <div key={idx} className={cn("flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500", msg.role === "user" ? "items-end" : "items-start")}>
                    <div className={cn(
                      "group relative flex flex-col space-y-2 max-w-[90%] md:max-w-[80%]",
                      msg.role === "user" ? "items-end" : "items-start"
                    )}>
                      {/* Optional Avatar for AI */}
                      {msg.role === "ai" && (
                        <div className="flex items-center gap-2 mb-1 px-1">
                           <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white ring-2 ring-white dark:ring-slate-900 shadow-sm">
                             <Cpu className="h-3.5 w-3.5" />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">DocuPoint AI</span>
                        </div>
                      )}

                      <div className={cn(
                        "relative px-4 py-3 md:px-5 md:py-3.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                        msg.role === "user" 
                          ? "bg-[#d9fdd3] text-[#111b21] dark:bg-[#005c4b] dark:text-[#e9edef] rounded-tr-none border-none" 
                          : "bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none border border-slate-100 dark:border-slate-800"
                      )}>
                        {/* Message Content */}
                        <ChatMessageContent content={msg.text} role={msg.role === "user" ? "user" : "ai"} />
                        
                        {/* Chart Display */}
                        {msg.role === "ai" && msg.chart_data && (
                          <div className="mt-4 w-full min-w-[300px] md:min-w-[450px]">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <ChatChart data={msg.chart_data as any} />
                          </div>
                        )}

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {msg.attachments.map((at, i) => (
                              <div key={i} className={cn(
                                "p-2 rounded-xl flex items-center gap-2 border",
                                msg.role === "user" ? "bg-white/10 border-white/20" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                              )}>
                                {at.type.startsWith("image/") ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                                <span className="text-[10px] font-bold truncate max-w-[120px]">{at.name}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* WhatsApp-style Timestamp inside Bubble */}
                        <div className={cn(
                          "mt-1 flex items-center justify-end gap-1.5 opacity-70 text-[9px] font-bold uppercase",
                          msg.role === "user" ? "text-[#667781] dark:text-[#8696a0]" : "text-slate-500"
                        )}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {msg.role === "user" && (
                            <div className="flex -space-x-1">
                              <span className="text-emerald-400">✓</span>
                              <span className="text-emerald-400">✓</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* AI Suggestions */}
                      {msg.role === "ai" && msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5 px-1">
                          {msg.suggestions.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => { handleSend(undefined, s.label); }}
                              className="text-xs md:text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-4 py-2.5 rounded-xl transition-all border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 shadow-md"
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 md:gap-6 animate-pulse">
                    <div className="h-9 w-9 md:h-12 md:w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                      <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
                    </div>
                    <div className="flex flex-col space-y-2 w-full max-w-[60%]">
                      <div className="h-16 md:h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700" />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            )}
          </ScrollArea>

          <div className="p-4 md:p-8 bg-background border-t border-border/50">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* File Previews */}
              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative group/file">
                      <div className="bg-muted/50 p-2 rounded-xl border border-border flex items-center gap-3 shadow-sm">
                        {file.type.startsWith("image/") ? (
                          <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                        )}
                        <div className="flex flex-col pr-4 min-w-0">
                          <span className="text-xs font-bold truncate max-w-[120px]">{file.name}</span>
                          <span className="text-[10px] font-black text-muted-foreground uppercase">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFile(idx)}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat Input Area */}
              <div className="relative flex flex-col bg-muted/30 rounded-2xl border border-border focus-within:ring-2 focus-within:ring-primary/20 transition-all">

                <div className="flex items-end p-2 md:p-3 gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.docx,.xlsx,.csv,.txt"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-10 w-10 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      e.target.style.height = 'auto'
                      e.target.style.height = `${e.target.scrollHeight}px`
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Message DocuPoint..."
                    disabled={loading}
                    className="flex-1 max-h-[200px] py-2.5 bg-transparent border-none focus:outline-none text-sm md:text-base font-medium resize-none placeholder:text-muted-foreground/60 custom-scrollbar"
                    style={{ minHeight: '40px' }}
                  />

                  <Button 
                    onClick={() => handleSend()}
                    disabled={loading || (!query.trim() && selectedFiles.length === 0)}
                    className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                AI-generated content may be inaccurate. Please verify.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function QuickPrompt({ text, onClick }: { text: string, onClick: (t: string) => void }) {
  return (
    <button 
      onClick={() => onClick(text)}
      className="p-3 md:p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-xs md:text-xs font-semibold text-slate-500 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-left tracking-normal"
    >
      &ldquo;{text}&rdquo;
    </button>
  )
}
