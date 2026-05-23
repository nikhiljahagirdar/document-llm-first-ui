"use client"

import * as React from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import * as Types from "@/types/api"
import { useAuthStore } from "@/lib/store"
import { FileText, CheckCircle2, Loader2, Sparkles, User, Building2, ChevronRight, Mail, Lock, CreditCard, Check, ShieldCheck, Zap, Layout, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

type AccountType = "individual" | "enterprise"

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

  const STEPS = [
    { id: 1, title: "Account", icon: User },
    { id: 2, title: "Plan", icon: Zap },
    { id: 3, title: "Payment", icon: CreditCard }
  ]

  return (
    <div className="flex min-h-screen bg-[#070B1A] selection:bg-violet-500/20 font-sans text-white overflow-hidden relative py-10 px-6 justify-center items-center">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-100px] left-[-100px] w-[450px] h-[450px] rounded-full bg-[#8B5CF6]/20 blur-[130px] animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[450px] h-[450px] rounded-full bg-[#00C2FF]/15 blur-[130px] animate-pulse duration-[10000ms]" />
        <div className="absolute top-[35%] right-[10%] w-[350px] h-[350px] rounded-full bg-[#F72585]/10 blur-[130px] animate-pulse duration-[6000ms]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1000px] flex flex-col items-center justify-center">
        {/* Header Logo */}
        <div className="mb-10 text-center">
          <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition justify-center">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-[#7B2FF7] via-[#D946EF] to-[#00C6FF] flex items-center justify-center text-2xl font-black shadow-2xl shadow-violet-500/40 text-white animate-pulse">
              D
            </div>

            <div className="text-left">
              <h1 className="text-3xl font-black tracking-tight text-white leading-none">DocuFlow AI</h1>
              <p className="text-xs text-gray-400 mt-1">Enterprise RAG Automation</p>
            </div>
          </Link>
        </div>

        {/* Progress Stepper */}
        <div className="w-full max-w-[540px] mb-12 relative z-20 px-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/[0.08] -translate-y-1/2 -z-10 rounded-full" />
            <div 
              className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-[#7B2FF7] via-[#D946EF] to-[#00C6FF] -translate-y-1/2 -z-10 rounded-full transition-all duration-700 ease-in-out" 
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-3">
                <div 
                  className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 border border-white/[0.08] backdrop-blur-md font-bold text-lg",
                    step === s.id 
                      ? "bg-gradient-to-br from-[#7B2FF7] via-[#D946EF] to-[#00C6FF] border-none text-white shadow-[0_0_25px_rgba(139,92,246,0.4)] scale-110" 
                      : step > s.id 
                        ? "bg-[#7B2FF7]/20 border-[#7B2FF7]/50 text-violet-300" 
                        : "bg-white/[0.03] border-white/[0.06] text-gray-500"
                  )}
                >
                  {step > s.id ? <Check className="h-6 w-6 stroke-[3]" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-colors",
                  step >= s.id ? "text-violet-300" : "text-gray-500"
                )}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={cn(
          "w-full transition-all duration-700 ease-in-out transform", 
          step === 2 ? "max-w-7xl" : "max-w-[540px]"
        )}>
          {/* Glassmorphic Container */}
          <div className="relative p-8 sm:p-12 rounded-[40px] border border-white/[0.08] bg-white/[0.04] backdrop-blur-3xl shadow-[0_25px_120px_rgba(139,92,246,0.25)] overflow-hidden">
            
            {/* Step 1: Account Info */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                <div className="space-y-3 text-center">
                  <h1 className="text-4xl font-black tracking-tight text-white">
                    Create your account
                  </h1>
                  <p className="text-gray-400 text-sm font-medium">Start your free 14-day trial. No credit card required.</p>
                </div>

                {/* Account Type Toggle */}
                <div className="flex justify-center w-full">
                  <div className="flex p-1.5 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.06] w-fit shadow-inner">
                    <button
                      type="button"
                      onClick={() => setAccountType("individual")}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer",
                        accountType === "individual" 
                          ? "bg-gradient-to-r from-[#7B2FF7] to-[#D946EF] text-white shadow-lg shadow-violet-500/25 scale-100" 
                          : "text-gray-400 hover:text-white hover:bg-white/[0.02] scale-95 hover:scale-100"
                      )}
                    >
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType("enterprise")}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer",
                        accountType === "enterprise" 
                          ? "bg-gradient-to-r from-[#7B2FF7] to-[#D946EF] text-white shadow-lg shadow-violet-500/25 scale-100" 
                          : "text-gray-400 hover:text-white hover:bg-white/[0.02] scale-95 hover:scale-100"
                      )}
                    >
                      Enterprise
                    </button>
                  </div>
                </div>

                <form onSubmit={handleStep1Submit} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 text-red-300 text-sm font-semibold border border-red-500/20 animate-pulse flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 shrink-0" />
                      {error}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="first_name" className="block text-sm text-gray-400 mb-1 ml-1">First Name</label>
                      <input id="first_name" name="first_name" required className="w-full h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] px-5 outline-none focus:border-violet-400/40 focus:ring-4 focus:ring-violet-500/10 transition-all text-lg placeholder:text-gray-500 text-white" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="last_name" className="block text-sm text-gray-400 mb-1 ml-1">Last Name</label>
                      <input id="last_name" name="last_name" required className="w-full h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] px-5 outline-none focus:border-violet-400/40 focus:ring-4 focus:ring-violet-500/10 transition-all text-lg placeholder:text-gray-500 text-white" />
                    </div>
                  </div>

                  <div className={cn(
                    "grid transition-all duration-500 ease-in-out",
                    accountType === "enterprise" ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
                  )}>
                    <div className="overflow-hidden">
                      <div className="space-y-2 pb-2">
                        <label htmlFor="org_name" className="block text-sm text-gray-400 mb-1 ml-1">Organization Name</label>
                        <div className="relative">
                          <input id="org_name" name="org_name" placeholder="Acme Corp" required={accountType === "enterprise"} className="w-full h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] px-5 outline-none focus:border-violet-400/40 focus:ring-4 focus:ring-violet-500/10 transition-all text-lg placeholder:text-gray-500 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm text-gray-400 mb-1 ml-1">Email Address</label>
                    <div className="relative">
                      <input id="email" name="email" type="email" required placeholder="name@company.com" className="w-full h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] px-5 outline-none focus:border-violet-400/40 focus:ring-4 focus:ring-violet-500/10 transition-all text-lg placeholder:text-gray-500 text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" title="At least 8 characters" className="block text-sm text-gray-400 mb-1 ml-1">Password</label>
                    <div className="relative">
                      <input id="password" name="password" type="password" required placeholder="••••••••" className="w-full h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] px-5 outline-none focus:border-violet-400/40 focus:ring-4 focus:ring-violet-500/10 transition-all text-lg placeholder:text-gray-500 text-white" />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full h-16 mt-2 text-lg font-bold rounded-2xl bg-gradient-to-r from-[#7B2FF7] via-[#D946EF] to-[#00C6FF] hover:scale-[1.02] transition-transform text-white shadow-2xl shadow-violet-500/30 flex items-center justify-center cursor-pointer" 
                    disabled={localLoading}
                  >
                    {localLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                      <div className="flex items-center gap-2">
                        <span>Continue Setup</span>
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    )}
                  </button>
                </form>

                <div className="text-center text-gray-400 pt-2">
                  Already have an account?{' '}
                  <Link href="/login" className="text-violet-300 hover:text-violet-200 font-semibold transition">
                    Sign In
                  </Link>
                </div>
              </div>
            )}

            {/* Step 2: Plan Selection */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 relative z-10">
                <div className="space-y-3 text-center">
                  <h1 className="text-4xl font-black tracking-tight text-white">
                    Select your plan
                  </h1>
                  <p className="text-gray-400 text-sm font-medium">Choose the tier that best fits your document volume.</p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 p-1.5 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.06] shadow-inner">
                    <button 
                      onClick={() => setBillingInterval('month')}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer",
                        billingInterval === 'month' ? "bg-white text-black shadow-md scale-100" : "text-gray-400 hover:text-white scale-95 hover:scale-100"
                      )}
                    >
                      Monthly
                    </button>
                    <button 
                      onClick={() => setBillingInterval('year')}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 cursor-pointer",
                        billingInterval === 'year' ? "bg-white text-black shadow-md scale-100" : "text-gray-400 hover:text-white scale-95 hover:scale-100"
                      )}
                    >
                      Yearly
                      <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter shadow-sm">Save 20%</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {plans.length === 0 && localLoading ? (
                    <div className="col-span-3 h-64 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-[#7B2FF7]" />
                        <span className="text-sm font-bold text-gray-400 animate-pulse">Loading plans...</span>
                      </div>
                    </div>
                  ) : plans.map((plan) => (
                    <div 
                      key={plan.plan_id}
                      onClick={() => setSelectedPlanId(plan.plan_id)}
                      className={cn(
                        "relative p-8 rounded-[36px] border cursor-pointer transition-all duration-300 hover:-translate-y-2 group overflow-hidden bg-white/[0.03] backdrop-blur-md flex flex-col justify-between min-h-[460px]",
                        selectedPlanId === plan.plan_id 
                          ? "border-[#7B2FF7] ring-1 ring-[#7B2FF7] shadow-[0_0_35px_rgba(139,92,246,0.25)] bg-[#7B2FF7]/10" 
                          : "border-white/[0.08] hover:border-violet-500/50 shadow-sm"
                      )}
                    >
                      {/* Glow inside selected card */}
                      {selectedPlanId === plan.plan_id && (
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
                      )}
                      
                      {selectedPlanId === plan.plan_id && (
                        <div className="absolute top-6 right-6 h-8 w-8 bg-gradient-to-br from-[#7B2FF7] to-[#00C6FF] rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-300">
                          <Check className="h-4 w-4 stroke-[3]" />
                        </div>
                      )}
                      
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <div className="mb-6">
                            <h3 className="text-2xl font-black text-white flex items-center gap-2">
                              {plan.name === 'Enterprise' && <Sparkles className="h-5 w-5 text-indigo-400" />}
                              {plan.name}
                            </h3>
                            <p className="text-sm font-medium text-gray-400 mt-2 line-clamp-3">{plan.description}</p>
                          </div>
                          
                          <div className="mb-8">
                            <div className="flex items-end gap-1">
                              <span className="text-5xl font-black text-white tracking-tighter">
                                ${billingInterval === 'month' ? plan.price : ((plan as any).yearly_price || plan.price * 12)}
                              </span>
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                /{billingInterval === 'month' ? 'mo' : 'yr'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4 pt-6 border-t border-white/[0.08] w-full">
                          {Object.entries(plan.limits || {}).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-3">
                              <div className={cn(
                                "h-6 w-6 rounded-full flex items-center justify-center shrink-0",
                                selectedPlanId === plan.plan_id ? "bg-[#7B2FF7]/20 text-[#A855F7]" : "bg-white/[0.05] text-gray-400"
                              )}>
                                <CheckCircle2 className="h-3 w-3" />
                              </div>
                              <span className="text-sm font-semibold text-gray-300">
                                <span className="text-white font-bold">{String(value).replace(/_/g, ' ')}</span> {key.replace(/_/g, ' ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-between mt-10 pt-8 border-t border-white/[0.08]">
                  <button 
                    type="button"
                    onClick={() => setStep(1)} 
                    className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white cursor-pointer py-3"
                  >
                    Back to Account
                  </button>
                  <button 
                    onClick={handleStep2Submit}
                    className="w-full sm:w-auto px-10 h-16 text-lg font-bold rounded-2xl bg-gradient-to-r from-[#7B2FF7] via-[#D946EF] to-[#00C6FF] hover:scale-[1.02] transition-transform text-white shadow-2xl shadow-violet-500/30 flex items-center justify-center cursor-pointer"
                    disabled={!selectedPlanId}
                  >
                    <div className="flex items-center gap-2">
                      <span>Continue to Payment</span>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Method */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 relative z-10">
                <div className="space-y-3 text-center">
                  <h1 className="text-4xl font-black tracking-tight text-white">
                    Payment Method
                  </h1>
                  <p className="text-gray-400 text-sm font-medium">Select your preferred payment provider to complete setup.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => handlePaymentSubmit('stripe')}
                    disabled={localLoading}
                    className="group flex items-center justify-between p-6 rounded-3xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 text-left relative overflow-hidden backdrop-blur-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="h-14 w-14 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-300 group-hover:scale-110 transition-transform duration-500">
                        <Layout className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white group-hover:text-violet-300 transition-colors">Credit Card</h3>
                        <p className="text-sm font-medium text-gray-400">Secure payment via Stripe</p>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-violet-300 group-hover:translate-x-1 transition-all relative z-10" />
                    {localLoading && <div className="absolute inset-0 bg-[#070B1A]/80 flex items-center justify-center backdrop-blur-sm z-20"><Loader2 className="h-6 w-6 animate-spin text-[#7B2FF7]" /></div>}
                  </button>

                  <button
                    onClick={() => handlePaymentSubmit('paypal')}
                    disabled={localLoading}
                    className="group flex items-center justify-between p-6 rounded-3xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 text-left relative overflow-hidden backdrop-blur-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform duration-500">
                        <Wallet className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">PayPal</h3>
                        <p className="text-sm font-medium text-gray-400">Checkout with your PayPal account</p>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all relative z-10" />
                    {localLoading && <div className="absolute inset-0 bg-[#070B1A]/80 flex items-center justify-center backdrop-blur-sm z-20"><Loader2 className="h-6 w-6 animate-spin text-[#7B2FF7]" /></div>}
                  </button>
                </div>

                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
                  <div className="flex justify-between items-center text-sm mb-4">
                    <span className="font-bold text-gray-400 uppercase tracking-widest text-[11px]">Order Summary</span>
                    <button onClick={() => setStep(2)} className="text-violet-300 font-bold text-xs hover:underline uppercase tracking-widest cursor-pointer bg-transparent border-none">Change Plan</button>
                  </div>
                  <div className="flex justify-between items-center font-black text-2xl text-white">
                    <span className="flex items-center gap-2">
                      {plans.find(p => p.plan_id === selectedPlanId)?.name} 
                      <span className="px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-300 text-[10px] uppercase tracking-widest font-black">Plan</span>
                    </span>
                    <span>${billingInterval === 'month' 
                      ? plans.find(p => p.plan_id === selectedPlanId)?.price 
                      : ((plans.find(p => p.plan_id === selectedPlanId) as any)?.yearly_price || (plans.find(p => p.plan_id === selectedPlanId)?.price || 0) * 12)
                    }</span>
                  </div>
                  <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Billed {billingInterval}ly</p>
                </div>

                <div className="pt-6 flex flex-col gap-6">
                  <div className="flex items-center gap-3 justify-center text-emerald-300 bg-emerald-500/10 py-3 px-6 rounded-full w-fit mx-auto border border-emerald-500/20">
                    <Lock className="h-4 w-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest">Bank-level Security Encryption</span>
                  </div>
                  
                  <footer className="flex justify-center opacity-40 hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">AES-256</span>
                      <div className="h-1 w-1 rounded-full bg-gray-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">SSL Secure</span>
                      <div className="h-1 w-1 rounded-full bg-gray-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">GDPR Compliant</span>
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
