"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, useUIStore } from "@/lib/store"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Loader2 } from "lucide-react"
import { ErrorBoundary } from "@/components/error-boundary"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated, isLoading, isHydrated, refreshUser } = useAuthStore()
  const { isSidebarOpen } = useUIStore()
  const router = useRouter()
  const [isVerifying, setIsVerifying] = React.useState(true)

  const isSuperAdmin = user?.role_name === 'SuperAdmin' || user?.email === 'admin@example.com'

  React.useEffect(() => {
    const verifyAccess = async () => {
      if (!isHydrated || isLoading) return

      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      if (!isSuperAdmin && (!user?.tenant_id)) {
        await refreshUser()
      }
      
      setIsVerifying(false)
    }

    verifyAccess()
  }, [isHydrated, isLoading, isAuthenticated, isSuperAdmin, user?.tenant_id, refreshUser, router])

  React.useEffect(() => {
    if (!isVerifying && isAuthenticated && !isSuperAdmin && (!user?.tenant_id)) {
      router.push("/onboarding")
    }
  }, [isVerifying, isAuthenticated, isSuperAdmin, user?.tenant_id, router])

  if (!isHydrated || isLoading || isVerifying || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-xs font-semibold tracking-normal text-muted-foreground uppercase tracking-widest">Initialising Terminal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#fafafa] dark:bg-[#020617]">
      {/* Structural Sidebar */}
      <Sidebar />

      {/* Primary Viewport */}
      <div className="flex flex-col flex-1 min-w-0 h-full relative overflow-hidden">
        {/* Modern Global Background Mesh - Premium feel */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 mesh-gradient">
          <div className="absolute inset-0 noise" />
        </div>

        <Header />
        
        <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar scroll-smooth pb-10 lg:pb-0">
          <div className="px-6 md:px-12 py-2 md:py-3">
            <div className="max-w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  )
}
