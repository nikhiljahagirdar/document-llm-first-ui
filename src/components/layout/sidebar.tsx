"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/lib/store"
import { useUserRole } from "@/hooks/use-user-role"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Code2, 
   Users,
  Wallet,
  Layers,
  BarChart4,
  Globe,
  Activity,
  Package,
  Cpu,
  ChevronLeft
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export const Sidebar = React.memo(function Sidebar() {
  const pathname = usePathname()
  const { isSidebarOpen, toggleSidebar } = useUIStore()
  const { role, isSuperAdmin, isAdmin, isContributor, isViewer } = useUserRole()

  const navGroups = React.useMemo(() => {
    const groups = []

    if (isSuperAdmin && pathname.startsWith('/admin')) {
      groups.push({
        label: "Platform",
        items: [
          { href: "/admin", label: "Health", icon: Activity },
          { href: "/admin/tenants", label: "Tenants", icon: Globe },
          { href: "/admin/subscriptions", label: "Plans", icon: Package },
          { href: "/admin/audit", label: "Audit", icon: BarChart4 },
          { href: "/admin/models", label: "Models", icon: Cpu },
        ]
      })
      return groups
    }

    // Group 1: Core Productivity Workspace (Top Priority)
    const coreGroup = {
      label: "Workspace",
      items: [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/documents", label: "Documents", icon: FileText },
        { href: "/dashboard/chat", label: "AI Assistant", icon: MessageSquare },
      ]
    }
    groups.push(coreGroup)

    // Group 2: Advanced Operations (Contributor & Tooling)
    const opsItems = []
    if (isContributor) {
      opsItems.push(
        { href: "/dashboard/templates", label: "Templates", icon: Code2 },
        { href: "/dashboard/reports", label: "Reporting", icon: BarChart4 }
      )
    }
    opsItems.push({ href: "/dashboard/notifications", label: "Inbox", icon: Activity })
    
    groups.push({
      label: "Operations",
      items: opsItems
    })

    // Group 3: Administration & Management (Bottom Priority)
    if (isAdmin) {
      groups.push({
        label: "Management",
        items: [
          { href: "/dashboard/team", label: "Team", icon: Users },
          { href: "/dashboard/integrations", label: "Integrations", icon: Globe },
          { href: "/dashboard/billing", label: "Billing", icon: Wallet },
          { href: "/dashboard/logs", label: "Audit", icon: BarChart4 },
          { href: "/dashboard/settings", label: "Settings", icon: Layers },
        ]
      })
    }

    return groups
  }, [isSuperAdmin, isAdmin, isContributor, pathname])

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className={cn(
          "h-full border-r border-border/50 bg-[#fafafa]/80 dark:bg-[#020617]/80 backdrop-blur-3xl flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-50 shrink-0 relative",
          "fixed lg:relative inset-y-0 left-0",
          !isSidebarOpen && "lg:translate-x-0 -translate-x-full"
        )}
      >
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-background border border-border shadow-xl items-center justify-center hidden lg:flex z-50 hover:scale-110 transition-transform"
        >
          <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform duration-500", !isSidebarOpen && "rotate-180")} />
        </button>

        <div className={cn(
          "h-20 flex items-center px-6 shrink-0 transition-all",
          !isSidebarOpen && "justify-center px-0"
        )}>
          <Link href="/dashboard" className="flex items-center gap-4 overflow-hidden group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
              <div className="bg-primary text-primary-foreground rounded-2xl p-2.5 shadow-2xl shadow-primary/40 shrink-0 group-hover:rotate-6 transition-transform duration-500 relative">
                <FileText className="h-6 w-6" />
              </div>
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-black text-2xl tracking-tighter truncate bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50"
              >
                DocuPoint
              </motion.span>
            )}
          </Link>
        </div>
        
        <ScrollArea className="flex-1 px-4 py-6">
          <div className="space-y-10">
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-3">
                {isSidebarOpen && (
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-3 mb-2"
                  >
                    {group.label}
                  </motion.p>
                )}
                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                        className={cn(
                          "flex items-center rounded-2xl text-[13px] font-bold transition-all duration-300 group relative",
                          isSidebarOpen ? "px-4 py-3.5 gap-4" : "h-12 w-12 justify-center mx-auto",
                          isActive
                            ? "bg-white dark:bg-white/5 text-primary shadow-2xl shadow-black/[0.05] dark:shadow-none ring-1 ring-border/50 dark:ring-white/[0.05]"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
                        )}
                      >
                        {isActive && (
                          <motion.div 
                            layoutId="sidebar-active"
                            className="absolute left-0 w-1 h-6 bg-primary rounded-full -translate-x-1" 
                          />
                        )}
                        <Icon className={cn(
                          "shrink-0 transition-all duration-500", 
                          isActive ? "text-primary scale-110" : "group-hover:scale-110 group-hover:text-foreground", 
                          isSidebarOpen ? "h-5 w-5" : "h-6 w-6"
                        )} strokeWidth={isActive ? 2.5 : 2} />
                        
                        {isSidebarOpen && (
                          <motion.span 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="truncate"
                          >
                            {item.label}
                          </motion.span>
                        )}

                        {!isSidebarOpen && (
                          <div className="absolute left-full ml-4 px-3 py-2 bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all whitespace-nowrap z-50 shadow-2xl">
                            {item.label}
                          </div>
                        )}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 mt-auto">
          <div className={cn(
            "p-1 rounded-2xl bg-muted/20 border border-border/40 backdrop-blur-sm transition-all overflow-hidden",
            !isSidebarOpen && "border-none bg-transparent p-0"
          )}>
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all",
              isSidebarOpen ? "bg-background/80 shadow-sm" : "justify-center"
            )}>
              <div className="relative">
                 <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md animate-pulse" />
                 <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] relative">V4</div>
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black truncate leading-none text-foreground uppercase tracking-tight">DocuPoint</p>
                  <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase tracking-widest opacity-60">Engine v4.2</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
})
