"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2, Rocket, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store"

export default function RegistrationSuccessPage() {
  const router = useRouter()
  const { refreshUser } = useAuthStore()
  const [verifying, setVerifying] = React.useState(true)

  React.useEffect(() => {
    const verify = async () => {
      try {
        await refreshUser()
      } catch (err) {
        console.error("Verification failed", err)
      } finally {
        setTimeout(() => {
          setVerifying(false)
          // Auto redirect after verification + delay
          setTimeout(() => router.push("/dashboard"), 5000)
        }, 2000)
      }
    }
    verify()
  }, [refreshUser, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[500px] text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
          <div className="bg-emerald-500 text-white p-6 rounded-3xl shadow-2xl relative z-10">
            <CheckCircle2 className="h-12 w-12" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Welcome to the future of documents!
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Your workspace is being provisioned. You now have full access to DocuPoint AI.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl shadow-primary/5 space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-border/50">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                 <Sparkles className="h-5 w-5" />
               </div>
               <div className="text-left">
                 <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Account Status</p>
                 <p className="text-sm font-black text-foreground">Active Premium</p>
               </div>
             </div>
             {verifying && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full h-14 text-base font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 group"
              onClick={() => router.push("/dashboard")}
              disabled={verifying}
            >
              <div className="flex items-center gap-2">
                <span>Go to Dashboard</span>
                <Rocket className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </Button>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Redirecting in 5 seconds...
            </p>
          </div>
        </div>

        <div className="pt-4">
          <div className="flex justify-center gap-8 grayscale opacity-40">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest">AI Activated</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest">Infinite Storage</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
