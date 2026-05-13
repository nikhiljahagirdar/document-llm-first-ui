"use client"

import * as React from "react"
import { api } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, CheckCircle2, Info, AlertTriangle, XCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Notification {
  notification_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_on: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState<"all" | "unread">("all")

  const fetchNotifications = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getNotifications(filter === "unread")
      setNotifications((data as Notification[]) || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  React.useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkRead = React.useCallback(async (id: string) => {
    try {
      await api.markNotificationRead(id)
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n))
    } catch (err) { console.error(err) }
  }, [])

  const handleReadAll = React.useCallback(async () => {
    try {
      await api.markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) { console.error(err) }
  }, [])

  const handleDelete = React.useCallback(async (id: string) => {
    try {
      await api.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.notification_id !== id))
    } catch (err) { console.error(err) }
  }, [])

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "success": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "error": return <XCircle className="h-5 w-5 text-rose-500" />
      default: return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-card-foreground">Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Updates about your organization and documents.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full h-12 px-6 font-semibold tracking-normal text-xs" onClick={handleReadAll}>
            Mark All Read
          </Button>
        </div>
      </div>

      <Card className="rounded-md border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
          <div className="flex bg-card p-1 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
            <button 
              onClick={() => setFilter("all")}
              className={cn("px-6 py-2 rounded-md text-xs font-semibold  tracking-normal transition-all", filter === "all" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-600")}
            >
              All
            </button>
            <button 
              onClick={() => setFilter("unread")}
              className={cn("px-6 py-2 rounded-md text-xs font-semibold  tracking-normal transition-all", filter === "unread" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-600")}
            >
              Unread
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input placeholder="Search notifications..." className="pl-10 pr-4 py-2 bg-card border border-slate-200 dark:border-slate-800 rounded-md text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-48 lg:w-64" />
          </div>
        </div>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              <p className="font-semibold text-indigo-600 tracking-normal text-xs">Loading data...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((n) => (
                <div 
                  key={n.notification_id} 
                  className={cn(
                    "p-8 flex gap-6 group transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50",
                    !n.is_read && "bg-indigo-50/30 dark:bg-indigo-900/5"
                  )}
                >
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-xl tracking-tight text-card-foreground line-clamp-1">{n.title}</h3>
                        {!n.is_read && <Badge className="bg-indigo-600 text-white border-none h-5 px-2 text-xs font-semibold">NEW</Badge>}
                      </div>
                      <span className="text-xs font-bold text-slate-400 tracking-normal">{new Date(n.created_on).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{n.message}</p>
                    <div className="pt-4 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.is_read && (
                        <Button variant="ghost" size="sm" className="h-8 rounded-md text-indigo-600 font-semibold text-xs tracking-normal" onClick={() => handleMarkRead(n.notification_id)}>
                          Mark Read
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 rounded-md text-rose-500 font-semibold text-xs tracking-normal hover:bg-rose-50" onClick={() => handleDelete(n.notification_id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-32 text-center space-y-6">
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-full inline-block">
                <Bell className="h-12 w-12 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-card-foreground">All Clear</h3>
                <p className="text-slate-500 font-medium">No new notifications at this time.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
