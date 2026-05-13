"use client"

import * as React from "react"
import { api } from "@/lib/api"
import * as Types from "@/types/api"
import { 
  MessageSquare, 
  Send, 
  X, 
  Loader2, 
  Cpu, 
  User, 
  Sparkles 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { ChatMessageContent } from "./chat-message-content"

interface Message {
  role: "user" | "ai"
  text: string
  suggestions?: Types.DocumentChatSuggestion[]
}

interface DocumentChatSidebarProps {
  documentId: string
  isOpen: boolean
  onClose: () => void
}

export function DocumentChatSidebar({ documentId, isOpen, onClose }: DocumentChatSidebarProps) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState<Types.DocumentChatSuggestion[]>([])
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault()
    
    const userMsg = overrideInput || input.trim()
    if (!userMsg || loading) return

    setMessages(prev => [...prev, { role: "user", text: userMsg }])
    if (!overrideInput) setInput("")
    setLoading(true)
    setSuggestions([])

    try {
      const res = await api.chatWithDocs(documentId, userMsg)
      const aiText = res.response || (res as any).answer || "I'm sorry, I couldn't process that."
      const newSuggestions = res.suggestions || []
      
      setMessages(prev => [...prev, { role: "ai", text: aiText, suggestions: newSuggestions }])
      setSuggestions(newSuggestions)
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: "ai", text: "Error: Failed to reach AI service." }])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="md:w-[26rem] sm:w-96 w-full border-l border-border bg-card flex flex-col h-full animate-in slide-in-from-right duration-300 shadow-2xl z-20">
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Doc Intelligence</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4 py-20">
            <Sparkles className="h-10 w-10 text-primary" />
            <p className="text-xs font-bold uppercase tracking-widest">Chat with Document</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                <div className={cn(
                  "max-w-[90%] p-3 rounded-md text-xs font-medium leading-relaxed",
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border border-border"
                )}>
                  {msg.role === "ai" ? (
                    <ChatMessageContent content={msg.text} role="ai" />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-[10px] font-bold uppercase">AI Thinking...</span>
              </div>
            )}
            
            {!loading && suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 animate-in fade-in slide-in-from-bottom-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(undefined, s.label)}
                    className="text-[10px] font-bold text-primary bg-primary/5 border border-primary/20 px-2 py-1 rounded-md hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-border bg-muted/10">
        <form onSubmit={handleSend} className="relative">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..." 
            className="pr-10 text-xs h-10 bg-background border-border"
            disabled={loading}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-1 top-1 h-8 w-8 rounded-sm"
            disabled={!input.trim() || loading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
