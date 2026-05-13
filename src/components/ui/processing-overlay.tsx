"use client"

import * as React from "react"
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ProcessingOverlayProps {
  isOpen: boolean
  message?: string
  status?: string
}

export const ProcessingOverlay = React.memo(function ProcessingOverlay({
  isOpen,
  message = "please do not navigate to any where document being processed",
  status = "Analysing Structure"
}: ProcessingOverlayProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl animate-in fade-in duration-500">
      <Card className="w-full max-w-xl border-primary/20 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] p-12 space-y-10 bg-card/90 backdrop-blur-2xl ring-1 ring-white/10 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4 shadow-inner">
            <Sparkles className="h-4 w-4" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Intelligence Pipeline</span>
          </div>
          <h3 className="text-4xl font-black tracking-tighter text-foreground drop-shadow-sm">{status}</h3>
          <p className="text-sm font-bold text-primary uppercase tracking-widest bg-primary/5 py-2 rounded-lg border border-primary/10 max-w-sm mx-auto animate-pulse">
            {message}
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-indigo-500 to-violet-500 rounded-full animate-progress-loading shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground font-extrabold text-[10px] uppercase tracking-[0.3em]">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Processing Knowledge Unit
          </div>
        </div>

        <div className="bg-primary/5 rounded-xl p-6 text-center border border-primary/10 relative z-10">
          <p className="text-xs font-bold text-foreground leading-relaxed">
            Our multimodal engine is deconstructing your document into semantic blocks. 
            This ensures high-fidelity retrieval during AI orchestration.
          </p>
        </div>
      </Card>

      <style jsx global>{`
        @keyframes progress-loading {
          0% { width: 0%; left: 0%; }
          50% { width: 70%; left: 15%; }
          100% { width: 0%; left: 100%; }
        }
        .animate-progress-loading {
          animation: progress-loading 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
})
