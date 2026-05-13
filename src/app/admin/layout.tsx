"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, useUIStore } from "@/lib/store"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isHydrated } = useAuthStore()
  const { isSidebarOpen } = useUIStore()
  const router = useRouter()

  const isSuperAdmin = user?.role_name === 'SuperAdmin' || user?.email === 'admin@example.com'

  React.useEffect(() => {
    if (isHydrated && !isLoading) {
      if (!user) {
        router.push("/login")
      } else if (!isSuperAdmin) {
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, isHydrated, isSuperAdmin, router])

  if (!isHydrated || isLoading || !user || !isSuperAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="font-semibold text-primary tracking-widest text-xs uppercase">Authorising Admin Access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Structural Sidebar (Shared with dashboard for consistency) */}
      <Sidebar />

      {/* Primary Viewport */}
      <div className="flex flex-col flex-1 min-w-0 h-full relative overflow-hidden bg-slate-50/50 dark:bg-transparent">
        <Header />
        <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
