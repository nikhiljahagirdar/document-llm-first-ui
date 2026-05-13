"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MiniStatusCardProps {
  label: string
  count: number
  icon: React.ReactNode
  color: 'slate' | 'emerald' | 'amber' | 'rose'
  loading?: boolean
}

export const MiniStatusCard = React.memo(function MiniStatusCard({ 
  label, 
  count, 
  icon, 
  color, 
  loading 
}: MiniStatusCardProps) {
  const colorMap = {
    slate: "bg-slate-100/80 text-slate-900 border-slate-200",
    emerald: "bg-emerald-100/80 text-emerald-900 border-emerald-200",
    amber: "bg-amber-100/80 text-amber-900 border-amber-200",
    rose: "bg-rose-100/80 text-rose-900 border-rose-200",
  }

  return (
    <div className={cn(
      "rounded-xl border p-2.5 flex items-center gap-3 transition-all hover:shadow-sm group relative overflow-hidden",
      colorMap[color]
    )}>
      <div className="shrink-0 opacity-80 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon as any, { className: "h-4 w-4" })}
      </div>
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-tight truncate">{label}</p>
        {loading ? (
          <div className="h-4 w-6 bg-current/10 animate-pulse rounded" />
        ) : (
          <span className="text-lg font-black leading-none">{count}</span>
        )}
      </div>
    </div>
  )
})
