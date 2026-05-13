"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { TemplateBuilder } from "@/components/features/template-builder"

export default function EditTemplatePage() {
  const params = useParams()
  const id = params.id as string

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Modify Blueprint</h1>
          <p className="text-sm text-muted-foreground mt-1">Update your intelligence template structure.</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <TemplateBuilder id={id} />
      </div>
    </div>
  )
}
