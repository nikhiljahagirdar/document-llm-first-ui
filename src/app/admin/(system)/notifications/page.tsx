"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Bell, 
  Send, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Trash2,
  Globe,
  Users,
  Search,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

export default function NotificationsAdminPage() {
  const [notifications, setNotifications] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchNotifications = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getNotifications()
      setNotifications(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleDelete = async (id: string) => {
    try {
      await api.deleteNotification(id)
      fetchNotifications()
    } catch (err) {
      alert("Failed to delete notification")
    }
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-card-foreground flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-md shadow-md text-white">
              <Bell className="h-6 w-6" />
            </div>
            Broadcast Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-1">Send system-wide alerts and manage notifications.</p>
        </div>
        
        <Button className="rounded-full bg-indigo-600 hover:bg-indigo-500 font-semibold tracking-normal text-xs h-12 px-8 shadow-md text-white border-none gap-2">
          <Plus className="h-4 w-4" /> Create Broadcast
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-4 space-y-6">
          <Card className="rounded-md border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-card overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-semibold tracking-normal">Quick Alert</CardTitle>
              <CardDescription className="text-xs font-medium">Instantly notify all active users.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-normal text-slate-400 ml-1">Message</label>
                <textarea className="w-full h-32 rounded-md bg-slate-50 dark:bg-slate-950 border-none p-4 text-sm font-medium outline-none resize-none placeholder:text-slate-400" placeholder="e.g. System maintenance at 2 AM..." />
              </div>
              <Button className="w-full h-12 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold tracking-normal text-xs gap-2">
                <Send className="h-3.5 w-3.5" /> Dispatch Alert
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-md border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-indigo-600 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
              <Globe className="h-20 w-20" />
            </div>
            <CardContent className="p-8 space-y-4 relative z-10">
              <p className="text-xs font-semibold tracking-normal opacity-60">Reach Strategy</p>
              <h3 className="text-2xl font-semibold tracking-normal">Global Reach</h3>
              <p className="text-xs font-medium opacity-80 leading-relaxed">Broadcast messages reach 100% of tenants across all clusters instantly.</p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card className="rounded-md border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-card overflow-hidden">
            <CardHeader className="p-10 pb-6 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold tracking-normal">History</CardTitle>
                <CardDescription className="text-base font-medium">Recent system broadcasts.</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Filter alerts..." className="pl-11 h-11 w-48 border-none bg-slate-50 dark:bg-slate-950 rounded-md" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {loading ? (
                  <div className="p-20 text-center opacity-30 animate-pulse font-semibold tracking-normal text-xs">Scanning Broadcast History...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-20 text-center opacity-30 font-semibold tracking-normal text-xs">No system broadcasts detected</div>
                ) : (
                  notifications.map((item) => (
                    <div key={item.notification_id} className="p-8 flex items-start justify-between hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors group">
                      <div className="flex gap-6">
                        <div className="h-12 w-12 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <Info className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <p className="font-semibold text-card-foreground tracking-tight">{item.title}</p>
                            {item.is_read ? (
                              <Badge className="bg-slate-100 text-slate-400 text-xs border-none">Seen</Badge>
                            ) : (
                              <Badge className="bg-emerald-500/10 text-emerald-600 text-xs border-none">Active</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{item.message}</p>
                          <p className="text-xs text-slate-400 font-bold tracking-normal pt-2">Sent • {new Date(item.created_on).toLocaleString()}</p>
                        </div>
                      </div>
                      <Button onClick={() => handleDelete(item.notification_id)} variant="ghost" size="icon" className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
