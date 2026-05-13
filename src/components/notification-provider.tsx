"use client"

import * as React from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"
import { useAuthStore, useDocStore } from "@/lib/store"
import { api, API_BASE_URL } from "@/lib/api"
import * as Types from "@/types/api"
import { Bell, Info, AlertTriangle, CheckCircle2, X, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const DEFAULT_WS_URL = `${API_BASE_URL.replace(/^http/, 'ws')}/api/notifications/ws/`
const WS_BASE_URL = (process.env.NEXT_PUBLIC_WS_URL || DEFAULT_WS_URL).trim()

interface NotificationContextType {
  notifications: Types.NotificationResponse[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  readyState: ReadyState
  refreshNotifications: () => Promise<void>
  triggerToast: (toast: Types.NotificationResponse) => void
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore()
  const { fetchDocuments } = useDocStore()
  const [notifications, setNotifications] = React.useState<Types.NotificationResponse[]>([])
  const [activeToast, setActiveToast] = React.useState<Types.NotificationResponse | null>(null)

  const triggerToast = React.useCallback((toast: Types.NotificationResponse) => {
    setActiveToast(toast)
    setTimeout(() => {
      setActiveToast((current) => {
        if (current?.notification_id === toast.notification_id) {
          return null
        }
        return current
      })
    }, 6000)
  }, [])

  // Ensure WS_BASE_URL ends with a single trailing slash
  const cleanWsBase = WS_BASE_URL.endsWith('/') ? WS_BASE_URL : `${WS_BASE_URL}/`
  
  // Use the exact URL format requested by the user
  const socketUrl = user?.user_id 
    ? `${cleanWsBase}${user.user_id}` 
    : null

  const { lastJsonMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: (closeEvent) => true,
    reconnectAttempts: 15,
    reconnectInterval: 5000,
    onOpen: () => console.log("WebSocket Connection Synchronized"),
    onClose: () => console.log("WebSocket Connection Interrupted"),
    onError: (error) => console.error("WebSocket Signal Error:", error),
  }, !!socketUrl)

  const refreshNotifications = React.useCallback(async () => {
    try {
      const data = await api.getNotifications(false, token || undefined)
      setNotifications(data || [])
    } catch (err) {
      console.error("Failed to sync notifications", err)
    }
  }, [token])

  // Initial load
  React.useEffect(() => {
    if (user?.user_id) {
      refreshNotifications()
    }
  }, [user?.user_id, refreshNotifications])

  React.useEffect(() => {
    if (lastJsonMessage) {
      const newNotification = lastJsonMessage as Types.NotificationResponse
      
      // Update notifications list
      setNotifications((prev) => {
        // Prevent duplicates if backend sends existing ones
        const exists = prev.some(n => n.notification_id === newNotification.notification_id)
        if (exists) return prev
        return [newNotification, ...prev]
      })

      // Show real-time toast
      setActiveToast(newNotification)
      
      // TRIGGER REFRESH for document status changes
      if (newNotification.type === 'document_status' || newNotification.type === 'processing') {
        console.log("Document status update received, refreshing registry...")
        fetchDocuments()
      }
      
      // Auto-hide toast after 6 seconds
      const timer = setTimeout(() => {
        setActiveToast(null)
      }, 6000)
      
      return () => clearTimeout(timer)
    }
  }, [lastJsonMessage, fetchDocuments])

  const unreadCount = React.useMemo(() => 
    notifications.filter(n => !n.is_read).length, 
  [notifications])

  const markAsRead = React.useCallback(async (id: string) => {
    try {
      await api.markNotificationRead(id)
      setNotifications(prev => 
        prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n)
      )
    } catch (err) {
      // Optimistic update fallback
      setNotifications(prev => 
        prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n)
      )
    }
  }, [])

  const markAllAsRead = React.useCallback(() => {
    // Ideally call a bulk mark read API
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      readyState,
      refreshNotifications,
      triggerToast
    }}>
      {children}
      
      {/* Real-time Notification Toast */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-10 duration-500">
          <div className={cn(
            "w-[400px] p-5 rounded-2xl border shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur-2xl flex gap-4 relative overflow-hidden group transition-all",
            activeToast.type === 'error' ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400" :
            (activeToast.type === 'document_status' || activeToast.type === 'processing') ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" :
            activeToast.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
            "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
          )}>
            <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-50" />
            
            <div className="h-12 w-12 rounded-xl bg-background/50 flex items-center justify-center shrink-0 shadow-sm border border-border/10">
              {activeToast.type === 'error' ? <AlertTriangle className="h-6 w-6" /> :
               (activeToast.type === 'document_status' || activeToast.type === 'processing') ? <Zap className="h-6 w-6 animate-pulse fill-current" /> :
               activeToast.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> :
               <Info className="h-6 w-6" />}
            </div>
            
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-black text-sm tracking-tight">{activeToast.title}</h4>
                <Badge variant="outline" className="text-[8px] font-black uppercase h-4 px-1.5 border-current/20 opacity-70">
                  Real-time
                </Badge>
              </div>
              <p className="text-xs font-bold opacity-80 leading-relaxed line-clamp-2">{activeToast.message}</p>
            </div>
            
            <button 
              onClick={() => setActiveToast(null)}
              className="absolute top-4 right-4 h-7 w-7 rounded-lg hover:bg-black/5 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="absolute bottom-0 left-0 h-0.5 bg-current opacity-20 animate-[shrink_6s_linear_forwards]" style={{ width: '100%' }} />
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = React.useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
