"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { XCircle, RefreshCcw, ArrowLeft, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PaymentFailedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-destructive/5 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-[500px] text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-destructive/20 blur-2xl rounded-full scale-150 animate-pulse" />
          <div className="bg-destructive text-white p-6 rounded-3xl shadow-2xl relative z-10">
            <XCircle className="h-12 w-12" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Checkout was not completed
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Your payment was cancelled or could not be processed. No charges were made to your account.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl shadow-destructive/5 space-y-6">
          <div className="flex items-center gap-4 text-left p-4 rounded-2xl bg-destructive/5 border border-destructive/10">
             <ShieldAlert className="h-6 w-6 text-destructive shrink-0" />
             <p className="text-sm font-semibold text-destructive/80 leading-relaxed">
               Security Note: If you believe this is an error, please try another payment method or contact your bank.
             </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              variant="outline"
              className="h-14 text-sm font-bold rounded-2xl border-border hover:bg-muted transition-all flex items-center gap-2"
              onClick={() => router.push("/register")}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Plans</span>
            </Button>
            <Button 
              className="h-14 text-sm font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 flex items-center gap-2"
              onClick={() => router.push("/register")}
            >
              <RefreshCcw className="h-4 w-4" />
              <span>Try Again</span>
            </Button>
          </div>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic">
          Need help? <Link href="mailto:support@docupoint.ai" className="text-primary hover:underline">Contact Support</Link>
        </p>
      </div>
    </div>
  )
}
