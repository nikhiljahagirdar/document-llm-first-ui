"use client"

import * as React from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Settings2, 
  Trash2, 
  CreditCard, 
  Zap, 
  ShieldCheck, 
  Crown,
  Check
} from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as Types from "@/types/api"

export default function PlansAdminPage() {
  const [plans, setPlans] = React.useState<Types.PlanResponse[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchPlans = React.useCallback(async () => {
    try {
      const data = await api.getPlans()
      setPlans(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-card-foreground flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-md shadow-md text-white">
              <CreditCard className="h-6 w-6" />
            </div>
            Plan Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-1">Define subscription tiers, usage limits, and global pricing.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-indigo-600 hover:bg-indigo-500 font-semibold tracking-normal text-xs h-12 px-8 shadow-md text-white border-none">
              <Plus className="h-4 w-4 mr-2" /> Create New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-md border-none">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">Add New Plan</DialogTitle>
              <DialogDescription className="font-medium text-slate-500">Add a new subscription tier to the system.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold tracking-normal ml-1">Plan Name</Label>
                <Input id="name" placeholder="e.g. Enterprise Elite" className="rounded-md h-11 border-slate-100 dark:border-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs font-semibold tracking-normal ml-1">Monthly Price</Label>
                  <Input id="price" type="number" placeholder="99.00" className="rounded-md h-11 border-slate-100 dark:border-slate-800" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-xs font-semibold tracking-normal ml-1">Currency</Label>
                  <Input id="currency" defaultValue="USD" className="rounded-md h-11 border-slate-100 dark:border-slate-800" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-indigo-600 text-white rounded-md h-12 font-semibold tracking-normal text-xs">Create Plan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="rounded-md border-none h-96 bg-slate-50/50 dark:bg-slate-900/50 animate-pulse" />
          ))
        ) : plans.length === 0 ? (
          <div className="col-span-full p-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-md">
            <p className="text-slate-400 font-semibold tracking-normal text-xs">No plans found.</p>
          </div>
        ) : (
          plans.map((plan) => (
            <Card key={plan.plan_id} className="rounded-md border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-card overflow-hidden flex flex-col group transition-all hover:-translate-y-2 hover:shadow-2xl">
              <CardHeader className="p-8 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-md bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                    {plan.price === 0 ? <Zap className="h-6 w-6" /> : plan.price > 50 ? <Crown className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                  </div>
                  <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-500 border-none font-semibold text-xs tracking-normal h-6 px-3">
                    ID: {plan.plan_id.substring(0, 8)}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
                <CardDescription className="text-sm font-medium line-clamp-2 mt-2">{plan.description || "Scalable access for organizations."}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1">
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-semibold tracking-normal">${plan.price}</span>
                  <span className="text-slate-400 font-bold text-xs">/month</span>
                </div>                
                <div className="space-y-4">
                  <p className="text-xs font-semibold tracking-normal text-indigo-600 dark:text-indigo-400">Plan Features</p>
                  <ul className="space-y-3">
                    {Object.entries(plan.limits).map(([key, value]) => (
                      <li key={key} className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-card-foreground">{value === null ? 'Unlimited' : value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="p-8 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-50 dark:border-slate-800/50 gap-3">
                <Button variant="ghost" className="flex-1 rounded-md h-11 font-semibold tracking-normal text-xs text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800">
                  <Settings2 className="h-3 w-3 mr-2" /> Edit
                </Button>
                <Button variant="ghost" className="rounded-md h-11 w-11 p-0 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
