"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import * as Types from "@/types/api"

interface PlanCardProps {
  plan: Types.PlanResponse
  isActive: boolean
  onSwitch: (planId: string) => void
}

export const PlanCard = React.memo(function PlanCard({ plan, isActive, onSwitch }: PlanCardProps) {
  return (
    <Card 
      className={cn(
        "flex flex-col relative overflow-hidden transition-all duration-500 hover:shadow-2xl rounded-md p-8 space-y-8 border-none",
        isActive 
          ? "bg-indigo-50/50 dark:bg-indigo-900/10 ring-2 ring-indigo-600 shadow-xl shadow-indigo-500/10" 
          : "bg-card shadow-xl shadow-slate-200/50 dark:shadow-none",
        plan.name === "Enterprise" && !isActive && "ring-4 ring-indigo-600/10 shadow-indigo-500/5 scale-105 z-10"
      )}
    >
      {isActive && (
        <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-bl-md shadow-lg flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3" /> Current Plan
        </div>
      )}
      {plan.name === "Enterprise" && !isActive && (
        <div className="absolute top-0 right-0 bg-indigo-600/10 text-indigo-600 px-6 py-2 text-xs font-semibold tracking-[0.25em] rounded-bl-md">Recommended</div>
      )}
      <CardHeader className="p-0 space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-[0.3em]">Plan Tier</p>
          <CardTitle className="text-3xl font-semibold text-card-foreground leading-none">{plan.name}</CardTitle>
        </div>
        <div className="flex items-baseline gap-2 text-card-foreground">
          <span className="text-5xl font-semibold tracking-normal">${plan.price}</span>
          <span className="text-sm font-bold text-slate-400 tracking-normal">/ month</span>
        </div>
        <CardDescription className="text-base font-medium min-h-[48px] leading-relaxed">{plan.description || "The complete toolset for power users."}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1 space-y-6">
        <div className="space-y-4 pt-6 border-t border-slate-50 dark:border-slate-800">
          {Object.entries(plan.limits || {}).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3 text-sm font-bold">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <span className="capitalize text-slate-600 dark:text-slate-400">{key.replace(/_/g, " ")}: </span>
              <span className="text-card-foreground">{String(value)}</span>
            </div>
          ))}
          <div className="flex items-center gap-3 text-sm font-bold">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <span className="text-slate-600 dark:text-slate-400">Global CDN Redundancy</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-0">
        <Button 
          onClick={() => onSwitch(plan.plan_id)}
          className={cn(
            "w-full h-14 rounded-md font-bold tracking-[0.1em] text-[10px] uppercase transition-all shadow-md",
            isActive 
              ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20" 
              : plan.name === "Enterprise"
                ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                : "bg-white dark:bg-slate-900 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
          )} 
          disabled={isActive}
        >
          {isActive ? (
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Your Active Plan</span>
          ) : (
            "Activate This Blueprint"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
})
