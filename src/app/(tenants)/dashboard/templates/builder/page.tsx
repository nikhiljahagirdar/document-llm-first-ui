"use client"

import * as React from "react"
import { TemplateBuilder } from "@/components/features/template-builder"
import Link from "next/link"

export default function TemplateBuilderPage() {
  return (
    <div className="space-y-6 flex flex-col min-h-[calc(100vh-120px)] pb-20">
      <div className="px-1 space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          <Link href="/dashboard/templates" className="hover:text-primary transition-colors">Blueprints</Link>
          <span className="opacity-30">/</span>
          <span className="text-primary">New Construction</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Intelligence <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">Architect</span>
            </h1>
            <p className="text-muted-foreground font-medium text-sm">Engineer rich semantic templates powered by dynamic AI injection.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 h-full">
        <TemplateBuilder />
      </div>
    </div>
  )
}