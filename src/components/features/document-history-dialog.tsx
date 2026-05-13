"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { History, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import * as Types from "@/types/api"

interface DocumentHistoryDialogProps {
  isOpen: boolean
  onClose: (isOpen: boolean) => void
  doc: Types.DocumentResponse | null
  docId: string
  onRestore: () => void
}

export const DocumentHistoryDialog = React.memo(function DocumentHistoryDialog({
  isOpen,
  onClose,
  doc,
  docId,
  onRestore
}: DocumentHistoryDialogProps) {
  const [loading, setLoading] = React.useState(false)

  const handleRestore = async (version: Types.DocumentVersionResponse) => {
    try {
      setLoading(true)
      await api.updateDocumentContent(docId, version.content)
      onRestore()
      onClose(false)
    } catch (err) {
      console.error("Failed to restore version", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Document Versions
          </DialogTitle>
          <DialogDescription className="text-xs font-bold uppercase tracking-wider">
            Track changes and revert to previous states.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] py-4">
          <div className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            {!loading && doc?.versions && doc.versions.length > 0 ? (
              doc.versions.slice().reverse().map((v: Types.DocumentVersionResponse, i: number) => (
                <div key={v.version_id} className={cn(
                  "p-4 rounded-md border flex items-center justify-between group transition-colors",
                  i === 0 ? "border-primary/20 bg-primary/5" : "border-border bg-muted/10 hover:border-primary/30"
                )}>
                  <div>
                    <p className="text-sm font-bold">Version {v.version_number}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      {v.created_by} • {new Date(v.created_on || Date.now()).toLocaleString()}
                    </p>
                  </div>
                  {i === 0 ? (
                    <Badge className="bg-emerald-500 text-white border-none text-[10px] font-bold">ACTIVE</Badge>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRestore(v)}
                      className="h-8 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Restore
                    </Button>
                  )}
                </div>
              ))
            ) : !loading && (
              <div className="p-4 rounded-md border border-border bg-muted/10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Initial Version</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    System Generated • {new Date(doc?.created_on || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <Badge className="bg-emerald-500 text-white border-none text-[10px] font-bold">ACTIVE</Badge>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
})
