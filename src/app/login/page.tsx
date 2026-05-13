"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Loader2, ChevronRight, Mail, Lock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface GoogleUser {
  email: string
  given_name: string
  family_name: string
  [key: string]: unknown
}


export default function LoginPage() {
  const { login, isLoading, error, isHydrated, isAuthenticated } = useAuthStore()
  const router = useRouter()

  React.useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isHydrated, isAuthenticated, router])

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const username = (formData.get("username") as string || "").trim()
      const password = (formData.get("password") as string || "").trim()

      try {
        await login(username, password)
      } catch (err) {
        // Error is handled in the store
      }
    },
    [login]
  )

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  return (
    <div className="flex min-h-screen bg-background selection:bg-primary/20 font-sans text-foreground overflow-hidden">
      {/* Visual Side Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] group-hover:scale-105" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-indigo-900/90 backdrop-blur-[2px]" />
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[100px]" />
        </div>

        <div className="p-12 relative z-10 flex flex-col h-full justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-2xl tracking-tight text-white group/logo">
            <div className="bg-white p-2 rounded-xl shadow-xl text-primary group-hover/logo:scale-110 transition-transform duration-300">
              <FileText className="h-6 w-6" />
            </div>
            <span className="font-extrabold italic tracking-tighter">DocuPoint</span>
          </Link>

          <div className="space-y-6 max-w-md text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-white/90">
              <Sparkles className="h-3 w-3" />
              Intelligence Reimagined
            </div>
            <h2 className="text-4xl xl:text-5xl font-extrabold leading-[1.1] tracking-tight">
              The future of <br/> document intelligence.
            </h2>
            <p className="text-lg font-medium opacity-80 leading-relaxed">
              Automate your unstructured data pipelines with human-level accuracy and AI precision.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-indigo-100 flex items-center justify-center overflow-hidden shadow-lg">
                   <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-sm font-semibold text-white/80">Trusted by <span className="text-white font-bold">2,000+</span> teams</p>
          </div>
        </div>
      </div>

      {/* Login Form Panel */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 md:p-12 relative bg-background overflow-hidden">
        {/* Background Blobs for Visual Interest */}
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

        <div className="absolute top-0 right-0 p-8">
          <p className="text-sm text-muted-foreground font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline transition-all">
              Sign up
            </Link>
          </p>
        </div>

        <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-3 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
                <div className="bg-primary p-2 rounded-xl shadow-xl text-white">
                  <FileText className="h-8 w-8" />
                </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-none">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-base font-medium">
              Enter your credentials to access your workspace.
            </p>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold border border-destructive/20 animate-in shake-2 duration-300">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-semibold text-foreground/80 ml-1">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="username" 
                      name="username" 
                      type="email" 
                      required 
                      placeholder="name@company.com"
                      className="h-12 pl-11 rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium shadow-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <Label htmlFor="password" className="text-sm font-semibold text-foreground/80">Password</Label>
                    <Link href="#" className="text-xs font-bold text-primary hover:text-primary/80 hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      required 
                      placeholder="••••••••"
                      className="h-12 pl-11 rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-sm font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 border-none transition-all active:scale-[0.98] group" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Sign In to Dashboard</span>
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

          </div>

          <footer className="pt-8 flex flex-col items-center gap-4 text-center">
             <div className="flex items-center gap-3 grayscale opacity-50">
                <div className="h-6 w-px bg-border" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">SOC2 TYPE II</span>
                <div className="h-6 w-px bg-border" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">GDPR READY</span>
                <div className="h-6 w-px bg-border" />
             </div>
             <p className="text-[10px] text-muted-foreground/60 font-medium">
               &copy; {new Date().getFullYear()} DocuPoint AI Inc. All rights reserved.
             </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
