"use client"

import * as React from "react"
import { useAuthStore } from "@/lib/store"
import { api } from "@/lib/api"
import * as Types from "@/types/api"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  CheckCircle2, 
  Zap, 
  History, 
  ArrowUpRight,
  ShieldCheck,
  Globe
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsageStat } from "@/components/dashboard/billing/usage-stat"
import { PlanCard } from "@/components/dashboard/billing/plan-card"
import { InvoiceRow } from "@/components/dashboard/billing/invoice-row"


export default function BillingPage() {
  const { user } = useAuthStore()
  const [plans, setPlans] = React.useState<Types.PlanResponse[]>([])
  const [subscription, setSubscription] = React.useState<Types.SubscriptionResponse | null>(null)
  const [invoices, setInvoices] = React.useState<Types.InvoiceResponse[]>([])
  const [usageSummary, setUsageSummary] = React.useState<Types.UsageSummary[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchData = React.useCallback(async () => {
    if (!user?.tenant_id) return
    setLoading(true)
    try {
      const [plansData, subData, invoicesData, usageData] = await Promise.all([
        api.getPlans(),
        api.getSubscription(),
        api.getInvoices(),
        api.getUsageSummary()
      ])

      setPlans(plansData || [])
      setSubscription(subData)
      setInvoices(invoicesData || [])
      setUsageSummary(usageData || [])
    } catch (err) {
      console.error("Billing fetch failed:", err)
    } finally {
      setLoading(false)
    }
  }, [user])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
        <p className="font-semibold text-indigo-600 tracking-normal text-xs">Loading Billing...</p>
      </div>
    )
  }

  const activePlan = subscription?.plan || plans.find(p => p.name === "Standard")

  const handleSwitchPlan = async (planId: string) => {
    try {
      const res = await api.createCheckout({
        plan_id: planId,
        provider: 'stripe',
        success_url: `${window.location.origin}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/dashboard/billing`
      })
      if (res.checkout_url) {
        window.location.href = res.checkout_url
      }
    } catch (err) {
      console.error("Checkout failed:", err)
      alert("Failed to initiate checkout. Please try again.")
    }
  }

  const getMetric = (name: string) => usageSummary.find(u => u.metric_name.toLowerCase().includes(name.toLowerCase()))

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-card-foreground">Billing & Plans</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Manage your organization&apos;s subscription and usage.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 p-1 px-4 rounded-full border border-indigo-100 dark:border-indigo-900/30">
          <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-semibold tracking-normal text-indigo-600 dark:text-indigo-400">Enterprise Security Active</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-muted p-1 h-12 rounded-xl border border-border">
          <TabsTrigger value="overview" className="rounded-lg px-8 font-bold text-[11px] uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="plans" className="rounded-lg px-8 font-bold text-[11px] uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
            Subscription Plans
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg px-8 font-bold text-[11px] uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
            Billing History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid gap-6 md:grid-cols-12">
            <Card className="md:col-span-8 bg-gradient-to-br from-white via-white to-indigo-50/30 dark:from-slate-900 dark:to-slate-950 border-none shadow-xl shadow-slate-200/50 dark:shadow-none rounded-md overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="h-48 w-48 -rotate-12 text-indigo-600" />
              </div>
              <CardHeader className="p-10 pb-6">
                <div className="flex items-center justify-between">
                  <Badge className="bg-indigo-600 text-white font-semibold tracking-normal text-xs px-3 h-6 border-none">
                    {subscription?.status === 'active' ? "Active Subscription" : "Subscription Inactive"}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-400 tracking-normal">
                    Renews on {subscription ? new Date(subscription.current_period_end).toLocaleDateString() : "Next Month"}
                  </span>
                </div>
                <CardTitle className="text-5xl font-semibold mt-6 text-card-foreground leading-tight">
                  {activePlan?.name || "Standard Plan"}
                </CardTitle>
                <CardTitle className="text-xl font-medium mt-2 max-w-lg">
                  {activePlan?.description || "Empower your document workflow with AI-driven OCR and reporting."}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-slate-50 dark:border-slate-800">
                  <UsageStat 
                    label="OCR Pages" 
                    used={getMetric('ocr')?.total_quantity.toString() || "0"} 
                    limit={getMetric('ocr')?.limit?.toString() || "5000"} 
                    percent={getMetric('ocr')?.usage_percent || 0} 
                  />
                  <UsageStat 
                    label="AI Reports" 
                    used={getMetric('report')?.total_quantity.toString() || "0"} 
                    limit={getMetric('report')?.limit?.toString() || "50"} 
                    percent={getMetric('report')?.usage_percent || 0} 
                  />
                  <UsageStat 
                    label="S3 Storage" 
                    used={getMetric('storage')?.total_quantity.toString() || "0 MB"} 
                    limit={getMetric('storage')?.limit?.toString() || "10 GB"} 
                    percent={getMetric('storage')?.usage_percent || 0} 
                  />
                  <UsageStat 
                    label="API Calls" 
                    used={getMetric('api')?.total_quantity.toString() || "0"} 
                    limit={getMetric('api')?.limit?.toString() || "10000"} 
                    percent={getMetric('api')?.usage_percent || 0} 
                    warning 
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-50 dark:border-slate-800 p-8">
                <Button className="rounded-md px-8 h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold tracking-normal text-xs shadow-md">Manage Billing</Button>
              </CardFooter>
            </Card>

            <Card className="md:col-span-4 rounded-md border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-card flex flex-col p-8 space-y-8">
              <CardHeader className="p-0 space-y-2">
                <CardTitle className="text-2xl font-semibold flex items-center gap-3">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-md text-indigo-600 dark:text-indigo-400">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 space-y-10">
                <div className="p-6 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-14 bg-indigo-600 rounded-md flex items-center justify-center font-semibold text-white text-xs tracking-normal">CARD</div>
                    <Badge variant="outline" className="rounded-full text-xs font-semibold tracking-normal border-indigo-600/20 text-indigo-600">Default</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold font-mono text-lg tracking-normal text-card-foreground">•••• •••• •••• 4242</p>
                    <p className="text-xs font-semibold text-slate-400 tracking-normal">Connected via Provider</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 tracking-normal">Current Plan Rate</p>
                  <div className="flex items-baseline gap-2 text-card-foreground leading-none">
                    <span className="text-5xl font-semibold tracking-tight">${activePlan?.price || "0"}</span>
                    <span className="text-sm font-bold text-slate-400 tracking-normal">/ Month</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-0">
                <Button variant="outline" onClick={() => handleSwitchPlan(activePlan?.plan_id || '')} className="w-full h-14 rounded-md border-2 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold tracking-normal text-xs">Update Payment Method</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="space-y-8">
            <h2 className="text-3xl font-semibold tracking-tight text-card-foreground">Subscription Plans</h2>
            <div className="grid gap-10 md:grid-cols-3">
              {plans.map((plan) => {
                const isActive = subscription?.plan?.plan_id === plan.plan_id
                return (
                  <Card 
                    key={plan.plan_id} 
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
                        onClick={() => handleSwitchPlan(plan.plan_id)}
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
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Card className="rounded-md border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-card overflow-hidden">
            <CardHeader className="p-8 pb-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-3">
                  <div className="bg-card p-2 rounded-md border border-slate-100 dark:border-slate-800 shadow-sm">
                    <History className="h-5 w-5 text-indigo-600" />
                  </div>
                  Billing History
                </CardTitle>
                <Button variant="ghost" size="sm" className="gap-2 rounded-full font-semibold tracking-normal text-xs text-slate-400 hover:text-indigo-600">
                  <Globe className="h-3 w-3" />
                  Audit Sync
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-950/50 text-slate-400 font-semibold tracking-normal text-xs border-b border-slate-50 dark:border-slate-800">
                      <th className="px-10 py-6">ID</th>
                      <th className="px-8 py-6">Status</th>
                      <th className="px-8 py-6">Amount</th>
                      <th className="px-8 py-6">Timestamp</th>
                      <th className="px-10 py-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {invoices.length > 0 ? invoices.map((inv) => (
                      <tr key={inv.invoice_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                        <td className="px-10 py-6 font-mono font-bold text-indigo-600 dark:text-indigo-400">#{inv.invoice_id.slice(0, 8)}</td>
                        <td className="px-8 py-6">
                          <Badge className={cn("font-semibold  tracking-normal text-xs px-3 h-6 border-none shadow-sm", inv.status === "paid" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400")}>
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 font-semibold text-card-foreground">${inv.amount} <span className="text-slate-400 opacity-50 font-bold ml-1">{inv.currency}</span></td>
                        <td className="px-8 py-6 text-slate-500 dark:text-slate-400 font-bold">{new Date(inv.created_on).toLocaleDateString()}</td>
                        <td className="px-10 py-6 text-right">
                          {inv.hosted_invoice_url ? (
                            <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" className="gap-2 h-10 rounded-md font-semibold tracking-normal text-xs hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                Download <ArrowUpRight className="h-3 w-3" />
                              </Button>
                            </a>
                          ) : (
                            <span className="text-slate-300 font-semibold text-xs tracking-normal">Locked</span>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-10 py-24 text-center">
                          <div className="max-w-xs mx-auto space-y-4 opacity-40">
                            <History className="h-12 w-12 text-slate-300 mx-auto" />
                            <p className="font-semibold tracking-normal text-xs text-slate-500">No transactions found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

