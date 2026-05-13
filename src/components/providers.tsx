"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ErrorBoundary } from "@/components/error-boundary"
import { NotificationProvider } from "@/components/notification-provider"
import QueryProvider from "@/components/providers/query-provider"
import { useOfflineSync } from "@/hooks/use-offline-sync"

export function Providers({ 
  children,
  googleClientId 
}: { 
  children: React.ReactNode
  googleClientId: string 
}) {
  useOfflineSync();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme={false}
      disableTransitionOnChange
    >
      <QueryProvider>
        <NotificationProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </NotificationProvider>
      </QueryProvider>
    </NextThemesProvider>
  )
}
