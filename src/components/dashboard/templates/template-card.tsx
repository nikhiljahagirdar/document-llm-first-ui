"use client"

import * as React from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import * as Types from "@/types/api"
import { getS3SignedUrl } from "@/lib/s3"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  FileText, 
  ChevronRight, 
  FileDown, 
  MoreVertical,
  Pencil,
  Trash2
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TemplateCardProps {
  template: Types.TemplateResponse
  isPublic?: boolean
  onRefresh: () => void
}

export const TemplateCard = React.memo(function TemplateCard({ 
  template, 
  isPublic, 
  onRefresh 
}: TemplateCardProps) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to decommission this blueprint?")) return
    try {
      await api.deleteTemplate(template.template_id)
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Card className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden">
      <div className="h-1.5 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
      <CardHeader className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            {isPublic && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">System</Badge>}
            {!isPublic && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-border">
                  <Link href={`/dashboard/templates/builder/${template.template_id}`}>
                    <DropdownMenuItem className="text-xs font-bold gap-2 cursor-pointer">
                      <Pencil className="h-3.5 w-3.5" /> Edit Blueprint
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem className="text-xs font-bold gap-2 text-destructive cursor-pointer" onClick={handleDelete}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <CardTitle className="text-lg font-black truncate tracking-tight">{template.template_name}</CardTitle>
        <CardDescription className="text-xs font-medium line-clamp-2 mt-2 h-8 leading-relaxed">
          {template.description || "No strategic description provided."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="flex flex-wrap gap-2 mb-6">
           {(template as any).industry_name && <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary">{(template as any).industry_name}</Badge>}
           {(template as any).category_name && <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-border text-muted-foreground">{(template as any).category_name}</Badge>}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
          <div className="flex items-center gap-2">
            {template.header_image && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-[9px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5"
                onClick={async () => {
                  const url = await getS3SignedUrl(template.header_image!)
                  if (url) window.open(url, '_blank')
                }}
              >
                <FileDown className="h-3.5 w-3.5 mr-2" /> Source
              </Button>
            )}
          </div>
          <Link href={`/dashboard/templates/studio?template_id=${template.template_id}&industry_id=${template.industry_id || ''}`}>
            <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              Deploy <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
})
