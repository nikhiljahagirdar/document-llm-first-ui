"use client"

import * as React from "react"
import { useAuthStore } from "@/lib/store"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  Building2, 
  Globe, 
  Palette, 
  ShieldCheck, 
  Image as ImageIcon,
  Loader2,
  CheckCircle2
} from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = React.useState(false)
  const [settings, setSettings] = React.useState<Record<string, any>>({})
  const [message, setMessage] = React.useState("")

  const fetchSettings = React.useCallback(async () => {
    if (!user?.tenant_id) return
    try {
      const data = await api.getTenantSettings(user.tenant_id)
      setSettings((data as Record<string, any>) || {})
    } catch (err) {
      console.error(err)
    }
  }, [user])

  React.useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!user?.tenant_id) return

      setMessage("")
      setLoading(true)

      const formData = new FormData(e.currentTarget)
      const data = Object.fromEntries(formData.entries())

      try {
        await api.updateTenantSettings(user.tenant_id, { ...settings, ...data })
        setMessage("Settings saved successfully.")
        setTimeout(() => setMessage(""), 3000)
      } catch (err: unknown) {
        setMessage("Error: " + (err instanceof Error ? err.message : String(err)))
      } finally {
        setLoading(false)
      }
    },
    [user, settings]
  )

  return (
    <div className="space-y-10 max-w-4xl pb-20 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-card-foreground">Tenant Configuration</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-1">Manage organization-wide identity and security protocols.</p>
      </div>

      <form onSubmit={handleSave} className="grid gap-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="rounded-md border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Identity & Branding
              </CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-primary">Visual Presence Controls</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tenant_title" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Platform Title</Label>
                <Input id="tenant_title" name="tenant_title" defaultValue={settings.tenant_title || ""} placeholder="e.g. ACME Corp Intelligence" className="h-11 border-border font-bold text-xs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenant_subtitle" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Platform Subtitle</Label>
                <Input id="tenant_subtitle" name="tenant_subtitle" defaultValue={settings.tenant_subtitle || ""} placeholder="Document OCR & RAG Center" className="h-11 border-border font-bold text-xs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo_url" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Logo Resource URL</Label>
                <div className="flex gap-3">
                  <Input id="logo_url" name="logo_url" defaultValue={settings.logo_url || ""} placeholder="https://cdn.acme.com/logo.png" className="h-11 border-border font-bold text-xs flex-1" />
                  <div className="h-11 w-11 rounded-md border border-border bg-muted flex items-center justify-center shrink-0">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Network & Callbacks
              </CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-primary">Integration Architecture</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="webhook_url" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Primary Webhook</Label>
                <Input id="webhook_url" name="webhook_url" defaultValue={settings.webhook_url || ""} placeholder="https://your-domain.com/events/docs" className="h-11 border-border font-bold text-xs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support_email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Support Contact</Label>
                <Input id="support_email" name="support_email" defaultValue={settings.support_email || ""} placeholder="support@organization.com" className="h-11 border-border font-bold text-xs" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-md border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Security Governance
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-primary">Access Control Policies</CardDescription>
              </div>
              <Badge variant="outline" className="h-6 text-[10px] font-bold uppercase tracking-widest border-emerald-500/20 text-emerald-600 bg-emerald-500/5 px-3">SSO Enabled</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Organization ID</Label>
                  <Input value={user?.tenant_id || ""} disabled className="h-11 border-border bg-muted/50 font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Storage Redundancy</Label>
                  <Input value="Multi-AZ S3 (Encrypted)" disabled className="h-11 border-border bg-muted/50 font-bold text-xs" />
                </div>
              </div>
              <p className="text-[10px] font-medium text-muted-foreground">These security parameters are managed at the system level and cannot be modified by tenant administrators.</p>
            </div>
          </CardContent>
          <CardFooter className="p-8 border-t border-border bg-muted/30 flex items-center justify-between">
            {message && (
              <div className={cn("text-xs font-bold uppercase tracking-widest flex items-center gap-2", message.startsWith("Error") ? "text-destructive" : "text-emerald-600")}>
                {message.startsWith("Error") ? null : <CheckCircle2 className="h-4 w-4" />}
                {message}
              </div>
            )}
            <Button type="submit" disabled={loading} className="ml-auto h-12 px-8 rounded-md font-bold text-sm shadow-md gap-3">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 hidden" />}
              Synchronize Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

function Save(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}
