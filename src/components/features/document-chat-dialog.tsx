"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Loader2, 
  Download,
  FileSpreadsheet,
  FileCode,
  FileText,
  Printer,
  FileDown,
  ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/lib/chat-store"
import { ChatMessageContent } from "./chat-message-content"
import * as exporter from "@/lib/chat-export"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DocumentChatDialogProps {
  documentId: string
  documentFilename?: string
}

export const DocumentChatDialog = React.memo(function DocumentChatDialog({ 
  documentId, 
  documentFilename = "document" 
}: DocumentChatDialogProps) {
  const { isOpen, setIsOpen, isLoading, messages, suggestions, sendMessage } = useChatStore()
  const [input, setInput] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const chatMessages = messages[documentId] || []
  const currentSuggestions = suggestions[documentId] || []

  React.useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }, 50)
    }
  }, [chatMessages, isOpen])

  const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault()
    const text = overrideInput || input.trim()
    if (!text || isLoading) return

    if (!overrideInput) setInput("")
    await sendMessage(documentId, text)
  }

  const handleExport = async (format: "word" | "excel" | "pdf" | "csv") => {
    const cleanFilename = documentFilename.replace(/[^a-z0-9]/gi, '-').toLowerCase()
    const dateStr = new Date().toISOString().slice(0, 10)
    const filename = `chat-${cleanFilename}-${dateStr}`

    switch(format) {
      case "word":
        await exporter.exportToWord(chatMessages, `${filename}.doc`)
        break
      case "excel":
        await exporter.exportToExcel(chatMessages, `${filename}.xlsx`)
        break
      case "csv":
        await exporter.exportToCSV(chatMessages, `${filename}.csv`)
        break
      case "pdf":
        await exporter.exportToPDF(chatMessages, `${filename}.pdf`)
        break
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl md:max-w-6xl border-border/50 glass-card h-[95vh] flex flex-col p-0 shadow-2xl overflow-hidden">
        {/* Header Section */}
        <DialogHeader className="p-5 border-b border-border/50 bg-muted/10 shrink-0">
          <div className="flex flex-row items-center justify-between pr-8">
            <div className="space-y-1 flex-1 pr-4">
              <DialogTitle className="flex items-center gap-2.5 text-base font-extrabold tracking-tight text-foreground">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Sparkles className="h-4 w-4 text-primary fill-current animate-pulse" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Intelligence Interaction</span>
                  <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-widest mt-0.5 truncate max-w-md">
                    Document ID: {documentFilename}
                  </span>
                </div>
              </DialogTitle>
              <DialogDescription className="sr-only">
                Interactive chat dialog with the AI about the document.
              </DialogDescription>
            </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button disabled={chatMessages.filter(m => m.role === 'ai').length === 0} variant="outline" size="sm" className="h-8 text-[10px] font-extrabold uppercase tracking-widest rounded-lg px-3 bg-background border-border/80 hover:bg-primary/5 gap-2 transition-all">
                    <FileDown className="h-3.5 w-3.5 text-primary" /> Export Transcript <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-border rounded-xl p-1.5">
                  <DropdownMenuLabel className="text-[9px] uppercase tracking-widest text-muted-foreground/70 font-bold">Choose Format</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem onClick={() => handleExport("word")} className="rounded-lg text-xs font-semibold flex items-center gap-2.5 py-2 px-3 cursor-pointer hover:bg-muted">
                    <FileText className="h-4 w-4 text-blue-500" /> Export to MS Word
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("excel")} className="rounded-lg text-xs font-semibold flex items-center gap-2.5 py-2 px-3 cursor-pointer hover:bg-muted">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Export to MS Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("csv")} className="rounded-lg text-xs font-semibold flex items-center gap-2.5 py-2 px-3 cursor-pointer hover:bg-muted">
                    <FileCode className="h-4 w-4 text-amber-500" /> Export to CSV Data
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")} className="rounded-lg text-xs font-semibold flex items-center gap-2.5 py-2 px-3 cursor-pointer hover:bg-muted">
                    <Printer className="h-4 w-4 text-rose-500" /> Printable PDF Document
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </DialogHeader>

        {/* Body / Chat Messages Scroll Area */}
        <div className="flex-1 overflow-hidden bg-accent/[0.02] relative">
          <ScrollArea className="h-full w-full">
            <div className="p-6 space-y-6 pb-20">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-40 space-y-4">
                  <div className="h-16 w-16 rounded-3xl border border-dashed border-muted-foreground flex items-center justify-center bg-muted/20">
                    <MessageSquare className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold tracking-widest text-[11px] uppercase">System Online</h4>
                    <p className="text-xs max-w-sm font-medium">Initiate conversation regarding <strong>{documentFilename}</strong>. The RAG assistant is indexed and ready.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 max-w-3xl mx-auto">
                  {chatMessages.map((msg, idx) => {
                    const isAI = msg.role === "ai"
                    return (
                      <div 
                        key={idx} 
                        className={cn(
                          "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                          isAI ? "justify-start" : "justify-end"
                        )}
                      >
                        <div 
                          className={cn(
                            "max-w-[85%] px-4 py-3.5 rounded-2xl relative transition-all shadow-sm",
                            isAI 
                              ? "glass-card text-foreground rounded-tl-none border-border/50" 
                              : "bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground shadow-lg shadow-primary/20 rounded-tr-none border-none"
                          )}
                        >
                          {isAI && (
                            <div className="absolute -left-3 -top-2 h-6 w-6 rounded-lg bg-primary flex items-center justify-center border border-background shadow-lg shadow-primary/20">
                              <Sparkles className="h-3 w-3 text-primary-foreground fill-current" />
                            </div>
                          )}
                          
                          {isAI ? (
                            <div className="text-sm font-medium">
                              <ChatMessageContent content={msg.text} role="ai" />
                            </div>
                          ) : (
                            <p className="text-xs md:text-[13px] font-medium leading-relaxed whitespace-pre-wrap selection:bg-primary-foreground/20">
                              {msg.text}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {isLoading && (
                    <div className="flex justify-start w-full">
                      <div className="bg-muted/30 text-foreground border border-border rounded-2xl rounded-tl-sm max-w-[85%] px-5 py-4 flex items-center gap-3 shadow-sm ring-1 ring-border/5 animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">Formulating Insight...</span>
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} className="h-2" />
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggestions Floating Area */}
          {!isLoading && currentSuggestions.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-card via-card/90 to-transparent z-10 flex justify-center border-t border-border/5 shadow-[0_-12px_24px_-12px_rgba(0,0,0,0.05)]">
              <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                {currentSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(undefined, s.label)}
                    className="text-[9px] md:text-[10px] font-extrabold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 px-3 py-1.5 rounded-xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer / Input Area */}
        <div className="p-4 border-t border-border bg-muted/10 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center max-w-3xl mx-auto w-full">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query specific intelligence or request syntheses..." 
              className="pr-12 pl-4 py-6 text-xs md:text-sm font-medium h-12 bg-background border-border shadow-inner rounded-xl focus:ring-primary/20 focus:border-primary"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg active:scale-95 transition-all"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4 fill-current" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
})
