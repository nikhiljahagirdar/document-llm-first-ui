"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useAuthStore, useUIStore } from "@/lib/store"
import { useNotifications } from "@/components/notification-provider"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LogOut, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Menu, 
  Bell, 
  Search, 
  Settings,
  CheckCircle2,
  Info,
  AlertTriangle,
  Clock,
  Command as CommandIcon
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { WorkspaceSelector } from "./workspace-selector"

export const Header = React.memo(function Header() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const { user, logout } = useAuthStore()
  const { toggleSidebar } = useUIStore()
  const { notifications, unreadCount, markAsRead, markAllAsRead, readyState } = useNotifications()

  const isSuperAdmin = user?.role_name === 'SuperAdmin' || user?.email === 'admin@example.com'
  
  const breadcrumbs = React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join('/')}`
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
      return { label, href, isLast: index === segments.length - 1 }
    })
  }, [pathname])

  return (
    <header className="h-20 border-b border-border/40 bg-background/60 backdrop-blur-3xl flex items-center justify-between px-3 md:px-4 shrink-0 z-30 sticky top-0 transition-all duration-500">
      <div className="flex items-center gap-6 min-w-0">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 lg:hidden flex items-center justify-center shrink-0 hover:bg-accent rounded-xl transition-all"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <div className="hidden md:block">
           {/* WorkspaceSelector removed per request */}
        </div>

        <nav className="hidden xl:flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
          <div className="h-4 w-[1px] bg-border/60 mx-2" />
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.href}>
              {i > 0 && <span className="text-[10px] opacity-20">/</span>}
              <Link 
                href={crumb.href}
                className={cn(
                  "transition-all hover:text-primary py-1",
                  crumb.isLast ? "text-foreground" : "hover:translate-x-0.5"
                )}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Modern Command Menu Style Search */}
        <div className="hidden lg:flex items-center relative group">
          <Search className="absolute left-4 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-all duration-300" />
          <input 
            type="text" 
            placeholder="Search Terminal..." 
            className="h-11 w-64 pl-12 pr-12 bg-muted/20 border border-border/40 rounded-2xl text-[13px] font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-background focus:w-80 focus:border-primary/40 transition-all duration-500 placeholder:text-muted-foreground/30"
          />
          <div className="absolute right-4 flex items-center gap-1 opacity-20 group-focus-within:opacity-0 transition-opacity">
            <CommandIcon className="h-3 w-3" />
            <span className="text-[10px] font-black">K</span>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-border/60 hidden sm:block mx-2" />

        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all rounded-xl"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="relative cursor-pointer group">
              <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground group-hover:text-foreground hover:bg-accent/50 transition-all rounded-xl">
                <Bell className="h-5 w-5" />
              </Button>
              {/* WS Status Indicator - Pulse Effect */}
              <div className="absolute bottom-2 right-2 flex items-center justify-center">
                 <div className={cn(
                    "absolute h-2.5 w-2.5 rounded-full animate-ping opacity-20",
                    readyState === 1 ? "bg-emerald-500" : "bg-rose-500"
                 )} />
                 <div className={cn(
                    "h-2 w-2 rounded-full ring-2 ring-background relative z-10",
                    readyState === 1 ? "bg-emerald-500" : "bg-rose-500"
                 )} />
              </div>
              
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 bg-primary text-primary-foreground rounded-full ring-4 ring-background flex items-center justify-center text-[10px] font-black shadow-2xl shadow-primary/40">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 rounded-3xl border border-border/40 shadow-2xl p-0 bg-popover/80 backdrop-blur-3xl overflow-hidden mt-4 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border/40 bg-muted/20 flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Intelligence Stream</h4>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-lg">
                  Archive All
                </Button>
              )}
            </div>
            <ScrollArea className="h-[400px]">
              <div className="divide-y divide-border/40">
                {notifications.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center gap-6">
                    <div className="h-16 w-16 rounded-3xl bg-muted/20 flex items-center justify-center text-muted-foreground/30">
                       <Bell className="h-8 w-8" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">No active signals</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.notification_id} 
                      className={cn(
                        "p-6 hover:bg-primary/[0.03] transition-all cursor-pointer group relative",
                        !n.is_read && "bg-primary/[0.02]"
                      )}
                      onClick={() => markAsRead(n.notification_id)}
                    >
                      <div className="flex gap-4">
                        <div className={cn(
                          "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 border border-border/10 shadow-sm transition-transform group-hover:scale-110 duration-500",
                          n.type === 'error' ? "bg-rose-500/10 text-rose-500" :
                          n.type === 'success' ? "bg-emerald-500/10 text-emerald-600" :
                          "bg-indigo-500/10 text-indigo-600"
                        )}>
                          {n.type === 'error' ? <AlertTriangle className="h-5 w-5" /> :
                           n.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> :
                           <Info className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{n.title}</p>
                          <p className="text-[12px] font-medium text-muted-foreground/80 leading-relaxed mt-1 line-clamp-2">{n.message}</p>
                          <div className="flex items-center gap-2 mt-3 opacity-40">
                             <Clock className="h-3 w-3" />
                             <span className="text-[9px] font-black uppercase tracking-widest">Signal Locked</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className="p-4 bg-muted/20 border-t border-border/40">
              <Link href="/notifications">
                <Button variant="ghost" className="w-full h-11 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground rounded-2xl transition-all shadow-xl shadow-transparent hover:shadow-primary/20">
                  Audit Intelligence Hub
                </Button>
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center focus:outline-none ml-2 group">
              <div className="flex items-center gap-4 p-1.5 pr-4 rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:border-primary/20">
                <Avatar className="h-9 w-9 rounded-xl border-2 border-background shadow-2xl transition-transform duration-500 group-hover:scale-110">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground font-black text-[11px] uppercase">
                    {user?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-[13px] font-black leading-none tracking-tight">{user?.first_name || 'System User'}</span>
                  <span className="text-[9px] text-primary/60 font-black uppercase tracking-[0.2em] mt-1.5">{user?.role_name || 'Guest'}</span>
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 rounded-3xl border border-border/40 shadow-2xl p-2 bg-popover/80 backdrop-blur-3xl mt-4 animate-in slide-in-from-top-2 duration-300">
            <DropdownMenuLabel className="p-4">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-black leading-none tracking-tight">{user?.first_name} {user?.last_name}</p>
                <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1 truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40" />
            
            <DropdownMenuItem asChild className="rounded-2xl focus:bg-primary/5 focus:text-primary cursor-pointer py-3.5 transition-all">
              <Link href="/settings" className="flex items-center text-[13px] font-bold">
                <Settings className="h-4 w-4 mr-3 opacity-50" /> Account Terminal
              </Link>
            </DropdownMenuItem>

            {isSuperAdmin && (
              <DropdownMenuItem asChild className="rounded-2xl focus:bg-primary/5 focus:text-primary cursor-pointer py-3.5 transition-all">
                <Link href="/admin" className="flex items-center text-[13px] font-bold">
                  <ShieldCheck className="h-4 w-4 mr-3 text-primary" /> Security Console
                </Link>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator className="bg-border/40" />
            
            <DropdownMenuItem 
              className="rounded-2xl focus:bg-destructive/5 focus:text-destructive cursor-pointer py-3.5 text-destructive font-black text-[12px] uppercase tracking-widest transition-all" 
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-3" /> Purge Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

  )
})
