"use client"

import * as React from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, Sparkles, Zap, ArrowRight, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface Plan {
  plan_id: string
  name: string
  description?: string
  price: number
  interval: string
  limits: Record<string, number | null>
}

export function PricingSection() {
  const [plans, setPlans] = React.useState<Plan[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await api.getPlans()
        setPlans((data as Plan[]) || [])
      } catch (err) {
        console.error("Failed to load plans", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  return (
    <section id="pricing" className="py-20 md:py-32 bg-[#020617] relative overflow-hidden">
      {/* Dynamic Radial Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_70%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full mb-8">
            <Zap className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Pricing Strategy</span>
          </div>
          <h2 className="text-4xl md:text-7xl font-extrabold tracking-tighter text-white mb-8">
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Scale.</span>
          </h2>
          <p className="text-xl text-slate-400 font-medium leading-relaxed">
            Simple, predictable pricing designed to grow with your data volume. 
            No surprises, just industrial-grade performance.
          </p>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500/20" />
              <Loader2 className="h-12 w-12 text-indigo-500 animate-spin relative" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Synchronizing Tiers</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {plans.map((plan) => {
              const isEnterprise = plan.name.toLowerCase().includes('enterprise')
              const isStarter = plan.name.toLowerCase().includes('starter') || plan.price === 0
              const isPro = !isEnterprise && !isStarter

              return (
                <div 
                  key={plan.plan_id}
                  className={cn(
                    "flex flex-col p-12 rounded-[3rem] border transition-all duration-700 group relative overflow-hidden",
                    isPro 
                      ? "bg-[#0f172a] border-indigo-500 shadow-[0_0_80px_-15px_rgba(79,70,229,0.4)] lg:scale-105 z-10" 
                      : "bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20"
                  )}
                >
                  {isPro && (
                    <div className="absolute top-0 right-0 bg-indigo-500 text-white px-8 py-2 text-[10px] font-black uppercase tracking-widest rounded-bl-3xl">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="mb-10">
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">{plan.name}</h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                      {plan.description || "The ideal starting point for modern teams."}
                    </p>
                  </div>
                  
                  <div className="flex items-baseline gap-2 mb-12 text-white">
                    <span className="text-6xl font-black tracking-tighter">${plan.price}</span>
                    <span className="text-slate-500 font-bold text-lg">{"/"}{plan.interval === 'month' ? 'mo' : plan.interval}</span>
                  </div>
                  
                  <div className="space-y-6 mb-12 flex-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Platform Limits</p>
                    {Object.entries(plan.limits).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-4 group/item">
                        <div className={cn(
                          "rounded-full p-1.5 transition-colors duration-500", 
                          isPro ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-slate-500 group-hover:bg-indigo-500/20 group-hover:text-indigo-400"
                        )}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-bold text-slate-300 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-black text-white ml-auto">
                          {value === null ? '∞' : value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full p-1.5 bg-emerald-500/10 text-emerald-500">
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-bold text-slate-300">Enterprise Security</span>
                      </div>
                    </div>
                  </div>
                  
                  <Link href="/register" className="w-full mt-auto">
                    <Button 
                      className={cn(
                        "w-full h-16 rounded-2xl font-black transition-all duration-500 group/btn text-sm uppercase tracking-widest",
                        isPro 
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20" 
                          : "bg-white text-slate-950 hover:bg-indigo-50 hover:scale-[1.02]"
                      )}
                    >
                      <span>Choose {plan.name}</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
