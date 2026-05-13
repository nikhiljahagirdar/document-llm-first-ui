"use client"

import * as React from "react"
import { Cpu } from "lucide-react"

interface StudioPromptInputProps {
  onPromptChange: (prompt: string) => void
}

export const StudioPromptInput = React.memo(function StudioPromptInput({
  onPromptChange
}: StudioPromptInputProps) {
  const [prompt, setPrompt] = React.useState("")

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setPrompt(val)
    onPromptChange(val)
  }

  return (
    <div className="flex-1 flex flex-col space-y-2 min-h-0">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-2">
          <Cpu className="h-3 w-3" /> System Instructions
        </label>
        <span className="text-[10px] font-bold text-muted-foreground uppercase">{prompt.length} Chars</span>
      </div>
      <textarea 
        value={prompt}
        onChange={handleChange}
        placeholder="Describe document requirements in detail..."
        className="flex-1 w-full bg-muted/30 border border-border focus:ring-2 focus:ring-primary/10 rounded-md p-6 text-base font-medium outline-none transition-all resize-none placeholder:text-muted-foreground/50 text-foreground shadow-inner"
      />
    </div>
  )
})
