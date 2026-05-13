"use client"

import * as React from "react"
import { Loader2, ShieldCheck, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface BlockingSpinnerProps {
  isVisible: boolean
  title?: string
  description?: string
}

export function BlockingSpinner({ isVisible, title = "Processing", description = "Preparing AI analysis..." }: BlockingSpinnerProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-card/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-8 p-12 rounded-md bg-card shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative w-24 h-24 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin shadow-xl shadow-indigo-500/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="h-8 w-8 text-indigo-600 animate-bounce" />
          </div>
        </div>
        
        <div className="space-y-3 text-center">
          <h3 className="text-3xl font-semibold tracking-normal text-card-foreground leading-none">{title}</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-xs">{description}</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
          <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-semibold tracking-normal text-indigo-600 dark:text-indigo-400">Secure AI Environment Active</span>
        </div>
      </div>
    </div>
  )
}
