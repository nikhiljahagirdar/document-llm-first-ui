"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Loader2 } from "lucide-react"

interface StudioChatInputProps {
  onSend: (message: string) => void
  disabled: boolean
  loading: boolean
}

export const StudioChatInput = React.memo(function StudioChatInput({
  onSend,
  disabled,
  loading
}: StudioChatInputProps) {
  const [chatInput, setChatInput] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || disabled || loading) return
    onSend(chatInput.trim())
    setChatInput("")
  }

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <Input 
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        placeholder="Inquire about document metrics..." 
        disabled={disabled || loading}
        className="h-12 pl-4 pr-12 rounded-md bg-muted/50 border-none font-medium text-sm focus-visible:ring-2 focus-visible:ring-primary/20"
      />
      <Button 
        type="submit" 
        size="icon" 
        disabled={!chatInput.trim() || disabled || loading}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-sm transition-all"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </form>
  )
})
