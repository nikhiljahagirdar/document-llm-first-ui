"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface UsageStatProps {
  label: string
  used: string
  limit: string
  percent: number
  warning?: boolean
}

export const UsageStat = React.memo(function UsageStat({ 
  label, 
  used, 
  limit, 
  percent, 
  warning 
}: UsageStatProps) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="flex flex-col items-center text-center space-y-4 group">
      <div className="relative w-24 h-24">
        {/* Background Circle */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-100 dark:text-slate-800"
          />
          {/* Progress Circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className={cn(
              "transition-all duration-1000 ease-out",
              warning && percent > 80 ? "text-amber-500" : "text-indigo-600"
            )}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-lg font-bold text-card-foreground leading-none">{Math.round(percent)}%</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-[10px] font-bold text-card-foreground">{used} / {limit}</p>
      </div>
    </div>
  )
})
