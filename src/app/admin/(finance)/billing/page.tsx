"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  Zap,
  Activity,
  Calendar,
  ChevronRight,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import * as Types from "@/types/api"

export default function BillingAdminPage() {
  const [metrics, setMetrics] = React.useState<Types.AdminMetrics | null>(null)
  const [failedPayments, setFailedPayments] = React.useState<Types.InvoiceResponse[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [m, f] = await Promise.all([
          api.getAdminMetrics(),
          api.getAdminFailedPayments()
        ])
        setMetrics(m)
        setFailedPayments(f || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-card-foreground flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-md shadow-md text-white">
              <CreditCard className="h-6 w-6" />
            </div>
            Billing Central
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-1">Global revenue and subscription management.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full h-12 px-6 font-semibold tracking-normal text-xs border-2">
            Revenue Report
          </Button>
          <Button className="rounded-full bg-indigo-600 hover:bg-indigo-500 font-semibold tracking-normal text-xs h-12 px-8 shadow-md text-white border-none">
            Stripe Dashboard
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard 
          title="Monthly Recurring Revenue" 
          value={metrics?.total_mrr ? `$${metrics.total_mrr.toLocaleString()}` : "$0"} 
          change={metrics?.mrr_growth || "+0%"} 
          icon={<DollarSign className="h-5 w-5" />} 
        />
        <MetricCard 
          title="Active Subscriptions" 
          value={metrics?.active_subscriptions?.toString() || "0"} 
          change={metrics?.sub_growth || "+0%"} 
          icon={<Zap className="h-5 w-5" />} 
        />
        <MetricCard 
          title="Churn Rate" 
          value={metrics?.churn_rate ? `${metrics.churn_rate}%` : "0%"} 
          change={metrics?.churn_change || "-0%"} 
          icon={<Activity className="h-5 w-5" />} 
        />
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        <Card className="md:col-span-8 rounded-md border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-card overflow-hidden">
          <CardHeader className="p-10 pb-6 border-b border-slate-50 dark:border-slate-800">
            <CardTitle className="text-2xl font-semibold tracking-normal">Failed Payments</CardTitle>
            <CardDescription className="text-base font-medium">Critical payment issues requiring intervention.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {failedPayments.length === 0 ? (
                <div className="p-20 text-center opacity-30 font-semibold tracking-normal text-xs">No failed payments detected</div>
              ) : (
                failedPayments.map((item, i) => (
                  <div key={i} className="p-8 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="h-12 w-12 rounded-md bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-card-foreground tracking-tight">{(item as any).tenant_name || "Unknown Tenant"}</p>
                        <p className="text-xs text-slate-400 font-bold tracking-normal mt-0.5">{(item as any).error_message || "Stripe Payment Failed"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-rose-600">${item.amount}</p>
                      <p className="text-xs text-slate-400 font-bold tracking-normal mt-0.5">{new Date(item.created_on).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 rounded-md border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-card overflow-hidden">
          <CardHeader className="p-10 pb-6 border-b border-slate-50 dark:border-slate-800">
            <CardTitle className="text-2xl font-semibold tracking-normal">Top Tiers</CardTitle>
            <CardDescription className="text-base font-medium">Revenue by plan type.</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <PlanProgress name="Enterprise" value={(metrics?.plan_distribution as any)?.enterprise || 0} color="bg-indigo-600" />
            <PlanProgress name="Professional" value={(metrics?.plan_distribution as any)?.professional || 0} color="bg-violet-500" />
            <PlanProgress name="Starter" value={(metrics?.plan_distribution as any)?.starter || 0} color="bg-fuchsia-500" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ title, value, change, icon }: { title: string, value: string, change: string, icon: React.ReactNode }) {
  return (
    <Card className="rounded-md border-none shadow-lg shadow-slate-200/40 dark:shadow-none bg-card p-8 space-y-6 transition-all hover:-translate-y-1 hover:shadow-2xl group">
      <div className="flex items-center justify-between">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-md text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-semibold text-xs tracking-normal h-6 px-3">{change}</Badge>
      </div>
      <div>
        <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold tracking-normal">{title}</p>
        <h3 className="text-4xl font-semibold tracking-normal mt-2 text-card-foreground leading-none">{value}</h3>
      </div>
    </Card>
  )
}

function PlanProgress({ name, value, color }: { name: string, value: number, color: string }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-xs tracking-normal text-card-foreground">{name}</span>
        <span className="font-semibold text-xs text-slate-400">{value}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
