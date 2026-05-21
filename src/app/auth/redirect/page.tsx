"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"

function RedirectContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (!code) {
      setError("No authorization code provided.")
      setTimeout(() => router.push("/dashboard/integrations"), 3000)
      return
    }

    api.googleAuthCallback({ code, state: state || undefined })
      .then(() => {
        router.push("/dashboard/integrations?success=true")
      })
      .catch((err) => {
        setError(err.message || "Failed to authorize Google Drive.")
        setTimeout(() => router.push("/dashboard/integrations"), 3000)
      })
  }, [searchParams, router])

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
      {error ? (
        <div className="text-center space-y-4">
          <div className="text-destructive font-bold text-xl">Authorization Failed</div>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm">Redirecting back to dashboard...</p>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <h1 className="text-2xl font-bold tracking-tight">Connecting Google Drive...</h1>
          <p className="text-muted-foreground">Please wait while we secure your connection.</p>
        </div>
      )}
    </div>
  )
}

export default function GoogleAuthRedirect() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <RedirectContent />
    </Suspense>
  )
}
