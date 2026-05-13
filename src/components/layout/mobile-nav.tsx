"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  MessageSquare, 
  Search, 
  FileText,
  User
} from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Search", href: "/dashboard/search", icon: Search },
  { label: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { label: "Assets", href: "/dashboard/content", icon: FileText },
  { label: "Profile", href: "/settings", icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-t border-border/40 z-50 flex lg:hidden items-center justify-around px-2 pb-safe">
      {items.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "p-1 rounded-lg transition-all duration-300",
              isActive && "bg-primary/10"
            )}>
              <Icon className={cn(
                "h-5 w-5",
                isActive && "scale-110"
              )} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            {isActive && (
              <div className="w-1 h-1 rounded-full bg-primary" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
