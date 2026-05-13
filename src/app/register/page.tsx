"use client"

import * as React from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import * as Types from "@/types/api"
import { useAuthStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, CheckCircle2, Loader2, Sparkles, User, Building2, ChevronRight, Mail, Lock, CreditCard, Check, ShieldCheck, Zap, Layout, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

type AccountType = "individual" | "enterprise"

interface GoogleUser {
  email: string
  given_name: string
  family_name: string
  [key: string]: unknown
}


export default function RegisterPage() {
  const { error, setError, register, isAuthenticated } = useAuthStore()
  const [localLoading, setLocalLoading] = React.useState(false)
  const [accountType, setAccountType] = React.useState<AccountType>("individual")
  
  const [step, setStep] = React.useState(1)
  const [plans, setPlans] = React.useState<Types.PlanResponse[]>([])
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>("")
  const [billingInterval, setBillingInterval] = React.useState<'month' | 'year'>('month')

  const fetchPlans = React.useCallback(async () => {
    setLocalLoading(true)
    try {
      const data = await api.getPlans()
      setPlans(data || [])
      // Auto select first paid plan if available, or free
      if (data && data.length > 0) {
        setSelectedPlanId(data[0].plan_id)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load plans")
    } finally {
      setLocalLoading(false)
    }
  }, [setError])

  React.useEffect(() => {
    if (isAuthenticated && step === 1) {
      fetchPlans()
      setStep(2)
    }
  }, [isAuthenticated, step, fetchPlans])

  const handleStep1Submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLocalLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = (formData.get("email") as string || "").trim()
    const firstName = (formData.get("first_name") as string || "").trim()
    const lastName = (formData.get("last_name") as string || "").trim()
    const password = (formData.get("password") as string || "").trim()
    const orgName = (formData.get("org_name") as string || "").trim()

    try {
      await register({
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        tenant_type: accountType,
        org_name: orgName || null
      })
      await fetchPlans()
      setStep(2)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLocalLoading(false)
    }
  }

  const handleStep2Submit = () => {
    if (!selectedPlanId) {
      setError("Please select a plan")
      return
    }
    setStep(3)
  }

  const handlePaymentSubmit = async (provider: 'stripe' | 'paypal') => {
    setError("")
    setLocalLoading(true)

    try {
      const res = await api.createCheckout({
        plan_id: selectedPlanId,
        provider,
        interval: billingInterval,
        success_url: `${window.location.origin}/register/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/register/payment-failed`
      })
      
      if (res.checkout_url) {
        window.location.href = res.checkout_url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (err: any) {
      setError(err.message || "Checkout failed")
    } finally {
      setLocalLoading(false)
    }
  }

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  const STEPS = [
    { id: 1, title: "Account", icon: User },
    { id: 2, title: "Plan", icon: Zap },
    { id: 3, title: "Payment", icon: CreditCard }
  ]

  return (
    <div className="flex min-h-screen bg-background selection:bg-primary/20 font-sans text-foreground overflow-hidden relative">
      {/* Stunning Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-pulse duration-[10000ms]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse duration-[8000ms] delay-75" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse duration-[12000ms]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
      </div>

      {/* Main Content Area */}
      <div className="w-full flex flex-col items-center justify-center p-4 md:p-6 relative z-10 overflow-y-auto min-h-screen">
        <div className="absolute top-4 left-4 md:top-6 md:left-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary group/logo">
            <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/30 text-primary-foreground group-hover/logo:scale-110 group-hover/logo:rotate-3 transition-all duration-300">
              <FileText className="h-5 w-5" />
            </div>
            <span className="font-extrabold italic tracking-tighter text-foreground drop-shadow-sm">DocuPoint</span>
          </Link>
        </div>

        {/* Progress Stepper */}
        <div className="w-full max-w-[540px] mb-8 relative z-20">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-muted/50 -translate-y-1/2 -z-10 rounded-full" />
            <div 
              className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-primary to-indigo-500 -translate-y-1/2 -z-10 rounded-full transition-all duration-700 ease-in-out" 
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div 
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 border-2 backdrop-blur-md",
                    step === s.id ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(var(--primary),0.4)] scale-110" : 
                    step > s.id ? "bg-primary border-primary text-white" : "bg-background/40 border-border/50 text-muted-foreground"
                  )}
                >
                  {step > s.id ? <Check className="h-6 w-6" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest transition-colors",
                  step >= s.id ? "text-foreground" : "text-muted-foreground"
                )}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={cn(
          "w-full transition-all duration-700 ease-in-out transform", 
          step === 2 ? "max-w-5xl" : "max-w-[540px]"
        )}>
          {/* Glassmorphic Container */}
          <div className="relative p-6 sm:p-10 rounded-[2.5rem] bg-background/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-2xl shadow-black/5 overflow-hidden">
            {/* Inner Glow */}
            <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/10 pointer-events-none" />
            
            {/* Step 1: Account Info */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70">
                    Create your account
                  </h1>
                  <p className="text-muted-foreground text-sm font-medium">Start your free 14-day trial. No credit card required yet.</p>
                </div>

                {/* Account Type Toggle */}
                <div className="flex justify-center w-full">
                  <div className="flex p-1.5 bg-muted/50 backdrop-blur-md rounded-2xl border border-border/50 w-fit shadow-inner">
                    <button
                      type="button"
                      onClick={() => setAccountType("individual")}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300",
                        accountType === "individual" 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-100" 
                          : "text-muted-foreground hover:text-foreground hover:bg-background/50 scale-95 hover:scale-100"
                      )}
                    >
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType("enterprise")}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300",
                        accountType === "enterprise" 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-100" 
                          : "text-muted-foreground hover:text-foreground hover:bg-background/50 scale-95 hover:scale-100"
                      )}
                    >
                      Enterprise
                    </button>
                  </div>
                </div>

                <form onSubmit={handleStep1Submit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold border border-destructive/20 animate-in shake-2 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      {error}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="first_name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">First Name</Label>
                      <Input id="first_name" name="first_name" required className="h-11 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 focus:bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="last_name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Last Name</Label>
                      <Input id="last_name" name="last_name" required className="h-11 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 focus:bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm" />
                    </div>
                  </div>

                  <div className={cn(
                    "grid transition-all duration-500 ease-in-out",
                    accountType === "enterprise" ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
                  )}>
                    <div className="overflow-hidden">
                      <div className="space-y-1.5 pb-2">
                        <Label htmlFor="org_name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Organization Name</Label>
                        <div className="relative group">
                          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input id="org_name" name="org_name" placeholder="Acme Corp" required={accountType === "enterprise"} className="h-11 pl-10 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 focus:bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input id="email" name="email" type="email" required placeholder="name@company.com" className="h-11 pl-10 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 focus:bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" title="At least 8 characters" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input id="password" name="password" type="password" required placeholder="••••••••" className="h-11 pl-10 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 focus:bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm" />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 mt-2 text-sm font-bold rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all group overflow-hidden relative" 
                    disabled={localLoading}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                    {localLoading ? <Loader2 className="h-6 w-6 animate-spin relative z-10" /> : (
                      <div className="flex items-center gap-2 relative z-10">
                        <span>Continue Setup</span>
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>

                </form>
              </div>
            )}

            {/* Step 2: Plan Selection */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 relative z-10">
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70">
                    Select your plan
                  </h1>
                  <p className="text-muted-foreground text-sm font-medium">Choose the tier that best fits your document volume.</p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 p-1.5 bg-muted/50 backdrop-blur-md rounded-2xl border border-border/50 shadow-inner">
                    <button 
                      onClick={() => setBillingInterval('month')}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300",
                        billingInterval === 'month' ? "bg-background text-foreground shadow-md scale-100" : "text-muted-foreground hover:text-foreground scale-95 hover:scale-100"
                      )}
                    >
                      Monthly
                    </button>
                    <button 
                      onClick={() => setBillingInterval('year')}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2",
                        billingInterval === 'year' ? "bg-background text-foreground shadow-md scale-100" : "text-muted-foreground hover:text-foreground scale-95 hover:scale-100"
                      )}
                    >
                      Yearly
                      <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter shadow-sm shadow-emerald-500/20">Save 20%</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.length === 0 && localLoading ? (
                    <div className="col-span-3 h-64 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <span className="text-sm font-bold text-muted-foreground animate-pulse">Loading plans...</span>
                      </div>
                    </div>
                  ) : plans.map((plan) => (
                    <div 
                      key={plan.plan_id}
                      onClick={() => setSelectedPlanId(plan.plan_id)}
                      className={cn(
                        "relative p-6 rounded-3xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 group overflow-hidden bg-background/40 backdrop-blur-md",
                        selectedPlanId === plan.plan_id 
                          ? "border-primary ring-1 ring-primary shadow-[0_0_30px_rgba(var(--primary),0.15)]" 
                          : "border-border/50 hover:border-primary/50 shadow-sm"
                      )}
                    >
                      {/* Plan glow effect on selected */}
                      {selectedPlanId === plan.plan_id && (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                      )}
                      
                      {selectedPlanId === plan.plan_id && (
                        <div className="absolute top-4 right-4 h-8 w-8 bg-gradient-to-br from-primary to-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-300">
                          <Check className="h-4 w-4 stroke-[3]" />
                        </div>
                      )}
                      
                      <div className="flex flex-col h-full relative z-10">
                        <div className="mb-6">
                          <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                            {plan.name === 'Enterprise' && <Sparkles className="h-5 w-5 text-indigo-500" />}
                            {plan.name}
                          </h3>
                          <p className="text-sm font-medium text-muted-foreground mt-2 line-clamp-2">{plan.description}</p>
                        </div>
                        
                        <div className="mb-6">
                          <div className="flex items-end gap-1">
                            <span className="text-4xl font-black text-foreground tracking-tighter">
                              ${billingInterval === 'month' ? plan.price : ((plan as any).yearly_price || plan.price * 12)}
                            </span>
                            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">
                              /{billingInterval === 'month' ? 'mo' : 'yr'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-auto space-y-3 pt-6 border-t border-border/50">
                          {Object.entries(plan.limits || {}).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-3">
                              <div className={cn(
                                "h-5 w-5 rounded-full flex items-center justify-center shrink-0",
                                selectedPlanId === plan.plan_id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                              )}>
                                <CheckCircle2 className="h-3 w-3" />
                              </div>
                              <span className="text-sm font-semibold text-foreground/80">
                                <span className="text-foreground">{String(value).replace(/_/g, ' ')}</span> {key.replace(/_/g, ' ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-between mt-8 pt-6 border-t border-border/50">
                  <Button 
                    variant="ghost" 
                    onClick={() => setStep(1)} 
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground order-2 sm:order-1"
                  >
                    Back to Account
                  </Button>
                  <Button 
                    onClick={handleStep2Submit}
                    className="w-full sm:w-auto px-8 h-12 text-sm font-bold rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all group order-1 sm:order-2 overflow-hidden relative"
                    disabled={!selectedPlanId}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                    <div className="flex items-center gap-2 relative z-10">
                      <span>Continue to Payment</span>
                      <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Method */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 relative z-10">
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70">
                    Payment Method
                  </h1>
                  <p className="text-muted-foreground text-sm font-medium">Select your preferred payment provider to complete setup.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   <button
                     onClick={() => handlePaymentSubmit('stripe')}
                     disabled={localLoading}
                     className="group flex items-center justify-between p-5 rounded-3xl border border-border/50 bg-background/50 hover:bg-background/80 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 text-left relative overflow-hidden backdrop-blur-sm"
                   >
                     <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="flex items-center gap-5 relative z-10">
                        <div className="h-14 w-14 rounded-2xl bg-[#635BFF]/10 flex items-center justify-center text-[#635BFF] group-hover:scale-110 transition-transform duration-500">
                          <Layout className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className="text-lg font-extrabold text-foreground group-hover:text-indigo-500 transition-colors">Credit Card</h3>
                          <p className="text-sm font-medium text-muted-foreground">Secure payment via Stripe</p>
                        </div>
                     </div>
                     <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-indigo-500 group-hover:translate-x-1 transition-all relative z-10" />
                     {localLoading && <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-sm z-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
                   </button>

                   <button
                     onClick={() => handlePaymentSubmit('paypal')}
                     disabled={localLoading}
                     className="group flex items-center justify-between p-5 rounded-3xl border border-border/50 bg-background/50 hover:bg-background/80 hover:border-[#003087]/50 hover:shadow-lg hover:shadow-[#003087]/10 transition-all duration-300 text-left relative overflow-hidden backdrop-blur-sm"
                   >
                     <div className="absolute inset-0 bg-gradient-to-r from-[#003087]/0 via-[#003087]/0 to-[#003087]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="flex items-center gap-5 relative z-10">
                        <div className="h-14 w-14 rounded-2xl bg-[#003087]/10 flex items-center justify-center text-[#003087] group-hover:scale-110 transition-transform duration-500">
                          <Wallet className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className="text-lg font-extrabold text-foreground group-hover:text-[#003087] transition-colors">PayPal</h3>
                          <p className="text-sm font-medium text-muted-foreground">Checkout with your PayPal account</p>
                        </div>
                     </div>
                     <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-[#003087] group-hover:translate-x-1 transition-all relative z-10" />
                     {localLoading && <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-sm z-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
                   </button>
                </div>

                <div className="p-5 rounded-3xl bg-muted/30 border border-border/50 backdrop-blur-sm">
                  <div className="flex justify-between items-center text-sm mb-4">
                    <span className="font-bold text-muted-foreground uppercase tracking-widest text-[11px]">Order Summary</span>
                    <button onClick={() => setStep(2)} className="text-primary font-bold text-xs hover:underline uppercase tracking-widest">Change Plan</button>
                  </div>
                  <div className="flex justify-between items-center font-black text-xl text-foreground">
                    <span className="flex items-center gap-2">
                      {plans.find(p => p.plan_id === selectedPlanId)?.name} 
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] uppercase tracking-widest font-bold">Plan</span>
                    </span>
                    <span>${billingInterval === 'month' 
                      ? plans.find(p => p.plan_id === selectedPlanId)?.price 
                      : ((plans.find(p => p.plan_id === selectedPlanId) as any)?.yearly_price || (plans.find(p => p.plan_id === selectedPlanId)?.price || 0) * 12)
                    }</span>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-widest">Billed {billingInterval}ly</p>
                </div>

                <div className="pt-6 flex flex-col gap-6">
                  <div className="flex items-center gap-3 justify-center text-emerald-600 bg-emerald-500/10 py-2 px-4 rounded-full w-fit mx-auto border border-emerald-500/20">
                    <Lock className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Bank-level Security Encryption</span>
                  </div>
                  
                  <footer className="flex justify-center opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AES-256</span>
                        <div className="h-1 w-1 rounded-full bg-border" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SSL Secure</span>
                        <div className="h-1 w-1 rounded-full bg-border" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">GDPR</span>
                    </div>
                  </footer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
