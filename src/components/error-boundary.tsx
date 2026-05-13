"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RotateCcw } from "lucide-react"

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-md border-2 border-dashed border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-500">
          <div className="bg-rose-50 dark:bg-rose-950/30 p-6 rounded-full">
            <AlertCircle className="h-12 w-12 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-normal text-card-foreground">System Interrupted</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
              A temporary interruption occurred in the UI layer. We&apos;ve logged the event for analysis.
            </p>
          </div>
          <Button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-md h-12 px-8 font-semibold tracking-normal text-xs shadow-md gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Restart View
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
