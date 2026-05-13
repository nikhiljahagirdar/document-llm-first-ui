"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Plus, 
  RefreshCw, 
  Lock, 
  Eye, 
  Edit3, 
  CheckSquare,
  ShieldCheck,
  MoreVertical
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
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function RolesPage() {
  const { toast } = useToast()
  const [roles, setRoles] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [creating, setCreating] = React.useState(false)

  const fetchRoles = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getTenantRoles()
      setRoles(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const description = formData.get("description") as string

    try {
      await api.createRole({
        name,
        description,
        is_system: false
      })
      toast({
        title: "Success",
        description: "Role profile constructed successfully.",
      })
      fetchRoles()
    } catch (err) {
       toast({
         title: "Build Failed",
         description: "Duplicate role or unauthorized request.",
         variant: "destructive"
       })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Security Policies
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Define and enforce granular access privilege matrix.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-border/50" onClick={fetchRoles} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold text-xs h-11 px-6 gap-2 shadow-lg transition-transform hover:scale-[1.02]">
                <Plus className="h-4 w-4" /> Define Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl bg-card border shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Construct Role Profile</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-medium">Define a logic gate for custom permissions.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Role Identification</Label>
                    <Input name="name" placeholder="e.g. Compliance Auditor" className="rounded-xl h-11 font-medium bg-muted/20 border-border" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Designation Concept</Label>
                    <Input name="description" placeholder="Brief objective summary" className="rounded-xl h-11 font-medium bg-muted/20 border-border" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full h-11 rounded-xl font-bold text-sm shadow-lg" disabled={creating}>
                     {creating ? "Deploying Logic..." : "Confirm Deployment"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="h-48 rounded-2xl bg-muted/20 animate-pulse border border-border" />
           ))
        ) : roles.length > 0 ? (
           roles.map((role) => (
             <Card key={role.role_id || role.id} className="rounded-2xl border border-border bg-card shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                <CardHeader className="p-6 pb-4 border-b border-border/40 relative z-10">
                   <div className="flex items-start justify-between">
                      <div className={cn(
                         "h-10 w-10 rounded-xl flex items-center justify-center shadow-sm border",
                         role.is_system ? "bg-indigo-500/5 border-indigo-500/20 text-indigo-500" : "bg-emerald-500/5 border-emerald-500/20 text-emerald-600"
                      )}>
                         {role.is_system ? <Lock className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                      </div>
                      <Badge variant="outline" className={cn(
                         "font-bold text-[9px] uppercase tracking-widest px-2 h-5 border-none shadow-none",
                         role.is_system ? "bg-muted/50 text-muted-foreground" : "bg-emerald-500/10 text-emerald-600"
                      )}>
                         {role.is_system ? "Read-Only" : "Mutable"}
                      </Badge>
                   </div>
                   <div className="pt-4 space-y-1">
                      <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                         {role.name}
                      </CardTitle>
                      <CardDescription className="text-xs font-medium line-clamp-2 min-h-[32px]">
                         {role.description || "Access gateway definition."}
                      </CardDescription>
                   </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                   <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <span>Capability Array</span>
                      <span className="text-primary font-black">ALL_SCOPES</span>
                   </div>
                   
                   <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="rounded-lg h-6 font-medium text-[10px] bg-muted/30 text-foreground border-border/50 px-2 gap-1.5">
                         <Eye className="h-3 w-3" /> View
                      </Badge>
                      {!role.is_system && (
                         <>
                            <Badge variant="secondary" className="rounded-lg h-6 font-medium text-[10px] bg-muted/30 text-foreground border-border/50 px-2 gap-1.5">
                               <Edit3 className="h-3 w-3" /> Modify
                            </Badge>
                            <Badge variant="secondary" className="rounded-lg h-6 font-medium text-[10px] bg-muted/30 text-foreground border-border/50 px-2 gap-1.5">
                               <CheckSquare className="h-3 w-3" /> Admin
                            </Badge>
                         </>
                      )}
                   </div>
                </CardContent>
             </Card>
           ))
        ) : (
           <div className="col-span-3 py-20 flex flex-col items-center gap-3 text-center bg-muted/5 border-2 border-dashed border-border rounded-3xl">
              <Shield className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Zero Polices Indexed</p>
           </div>
        )}
      </div>
    </div>
  )
}
