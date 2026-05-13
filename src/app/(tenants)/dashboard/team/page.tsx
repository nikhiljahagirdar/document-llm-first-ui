"use client"

import * as React from "react"
import { useAuthStore } from "@/lib/store"
import { 
  Card, 
  CardContent 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MoreVertical, 
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldCheck
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { motion } from "framer-motion"

export default function TeamPage() {
  const { user } = useAuthStore()
  const [team, setTeam] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [inviteLoading, setInviteLoading] = React.useState(false)

  const fetchTeam = React.useCallback(async () => {
    setLoading(true)
    try {
      const users = await api.getUsers()
      setTeam(users || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setInviteLoading(true)
    setTimeout(() => {
      setInviteLoading(false)
      fetchTeam()
    }, 1000)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Organization Team
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Manage users, access control and role assignments.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-border/50" onClick={fetchTeam} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold text-xs h-11 px-6 gap-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <UserPlus className="h-4 w-4" /> Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl bg-card backdrop-blur-xl border border-border shadow-2xl p-6">
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-xl font-bold">Invite Team Member</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-medium">
                  Deliver an onboarding portal link to the desired recipient.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                      <Input id="email" type="email" placeholder="jane@company.com" className="h-11 pl-12 rounded-xl bg-muted/30 border-border font-medium text-sm" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Assigned Role</Label>
                    <Select defaultValue="Member">
                      <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-border font-medium text-sm">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-popover border-border shadow-2xl">
                        <SelectItem value="Admin" className="rounded-lg">Administrator</SelectItem>
                        <SelectItem value="Contributor" className="rounded-lg">Contributor</SelectItem>
                        <SelectItem value="Viewer" className="rounded-lg">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg" disabled={inviteLoading}>
                    {inviteLoading ? "Synthesizing..." : "Deploy Invitation"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                  <th className="px-8 py-4">Identity</th>
                  <th className="px-6 py-4">Access Context</th>
                  <th className="px-6 py-4">Activity</th>
                  <th className="px-8 py-4 text-right">Command</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                   Array.from({ length: 4 }).map((_, i) => (
                     <tr key={i} className="animate-pulse">
                       <td colSpan={4} className="px-8 py-6 h-20 bg-muted/5" />
                     </tr>
                   ))
                ) : team.length > 0 ? (
                   team.map((m) => (
                    <tr key={m.user_id || m.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-9 w-9 rounded-xl border border-border bg-background shadow-sm transition-transform group-hover:scale-105 duration-300">
                            <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">
                              {(m.first_name?.[0] || m.email?.[0] || 'U').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground tracking-tight truncate">
                                {m.first_name ? `${m.first_name} ${m.last_name || ''}` : m.email.split('@')[0]}
                            </p>
                            <p className="text-xs font-medium text-muted-foreground truncate opacity-80">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                           <Badge variant="outline" className="h-6 px-2.5 rounded-lg border-border/80 bg-background font-bold text-[10px] tracking-wide flex items-center gap-1.5">
                              <ShieldCheck className="h-3 w-3 text-primary/70" />
                              {m.role_name || "Member"}
                           </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Badge className={cn(
                          "font-bold uppercase tracking-widest text-[9px] px-2 py-0.5 border shadow-none rounded-md",
                          m.is_active !== false ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}>
                          {m.is_active !== false ? "ACTIVE" : "DISABLED"}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all opacity-40 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                     <td colSpan={4} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-40">
                           <Users className="h-10 w-10 text-muted-foreground" />
                           <p className="text-sm font-bold uppercase tracking-widest">Empty Roster</p>
                        </div>
                     </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
