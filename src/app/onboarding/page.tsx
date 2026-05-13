"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { api } from "@/lib/api"
import * as Types from "@/types/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Building2, Rocket, Globe, ShieldCheck, Loader2, FileText, Sparkles, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function OnboardingPage() {
  const { user, isHydrated, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (user?.tenant_id) {
        router.push("/dashboard")
      }
    }
  }, [user, isHydrated, isAuthenticated, router])

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setError("")
      setLoading(true)

      const formData = new FormData(e.currentTarget)
      const data: Types.TenantBase = {
        name: formData.get("name") as string,
        type: (formData.get("type") as Types.TenantTypeSchema) || "enterprise",
        slug: formData.get("slug") as string,
        org_name: formData.get("name") as string,
        address: null,
      }

      try {
        await api.registerTenant(data)
        window.location.href = "/dashboard"
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    },
    []
  )

  if (!isHydrated || !isAuthenticated || user?.tenant_id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 text-primary animate-spin relative z-10" />
          </div>
          <p className="font-bold text-primary tracking-widest text-[10px] uppercase">Syncing Identity...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 selection:bg-primary/20 overflow-y-auto relative">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[560px] animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="mb-10 flex flex-col items-center text-center">
           <div className="bg-primary p-3 rounded-2xl shadow-2xl text-white mb-6 group hover:scale-110 transition-transform duration-300">
              <Rocket className="h-8 w-8" />
           </div>
           <h1 className="text-4xl font-extrabold tracking-tight text-foreground leading-tight mb-3">
             Create your workspace
           </h1>
           <p className="text-muted-foreground text-lg font-medium max-w-sm">
             Set up your organization to start processing documents with AI.
           </p>
        </div>

        <Card className="rounded-3xl border border-border bg-card/50 backdrop-blur-sm shadow-2xl shadow-primary/5 p-2 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-8 md:p-10 space-y-8">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold border border-destructive/20 animate-in shake-2 duration-300">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground/80 ml-1">Organization Name</Label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="name" 
                      name="name" 
                      type="text" 
                      required 
                      placeholder="e.g. Acme Corp" 
                      className="h-14 pl-12 rounded-2xl border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base font-medium shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-semibold text-foreground/80 ml-1">Workspace ID (Subdomain)</Label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="slug" 
                      name="slug" 
                      type="text" 
                      required 
                      placeholder="acme-hq" 
                      className="h-14 pl-12 rounded-2xl border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base font-mono lowercase shadow-sm"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest bg-muted px-2 py-1 rounded-md">
                      .docupoint.ai
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-semibold text-foreground/80 ml-1">Organization Type</Label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <select
                      id="type"
                      name="type"
                      className="flex h-14 w-full rounded-2xl border-2 border-border bg-background pl-12 pr-10 py-2 text-base font-semibold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                      required
                      defaultValue="enterprise"
                    >
                      <option value="individual">Personal / Individual</option>
                      <option value="enterprise">Corporate / Enterprise</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-transform rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-16 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 border-none transition-all active:scale-[0.98] group" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Provisioning Workspace...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Launch My Workspace</span>
                      <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Card>

        <div className="mt-8 flex justify-center gap-8 grayscale opacity-40">
           <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">AI Ready</span>
           </div>
           <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">OCR Enabled</span>
           </div>
           <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">ISO 27001</span>
           </div>
        </div>
      </div>
    </div>
  )
}
