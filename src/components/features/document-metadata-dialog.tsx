"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { FileEdit, Loader2, CheckCircle2 } from "lucide-react"
import { api } from "@/lib/api"
import * as Types from "@/types/api"

interface DocumentMetadataDialogProps {
  isOpen: boolean
  onClose: (isOpen: boolean) => void
  docId: string
  industries: Types.IndustryResponse[]
  initialIndustryId: string
  initialCategoryId: string
  initialSubcategoryId: string
  onSaved: () => void
}

export const DocumentMetadataDialog = React.memo(function DocumentMetadataDialog({
  isOpen,
  onClose,
  docId,
  industries,
  initialIndustryId,
  initialCategoryId,
  initialSubcategoryId,
  onSaved
}: DocumentMetadataDialogProps) {
  const [selectedIndustryId, setSelectedIndustryId] = React.useState<string>(initialIndustryId)
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>(initialCategoryId)
  const [selectedSubcategoryId, setSelectedSubcategoryId] = React.useState<string>(initialSubcategoryId)
  const [isSavingMetadata, setIsSavingMetadata] = React.useState(false)

  // Reset local state when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedIndustryId(initialIndustryId)
      setSelectedCategoryId(initialCategoryId)
      setSelectedSubcategoryId(initialSubcategoryId)
    }
  }, [isOpen, initialIndustryId, initialCategoryId, initialSubcategoryId])

  const handleSaveMetadata = async () => {
    setIsSavingMetadata(true)
    try {
      // In this specific UI flow, they are triggering a reprocess to apply new metadata implicitly 
      // depending on backend API capabilities. Currently, it was mapped to reprocessDocument.
      // (If there's a dedicated updateMetadata endpoint, it should be used instead).
      // For parity with existing behavior:
      await api.reprocessDocument(docId) 
      onSaved()
      onClose(false)
    } catch (err) {
      console.error("Failed to save metadata", err)
    } finally {
      setIsSavingMetadata(false)
    }
  }

  const selectedIndustry = industries.find(i => i.industry_id === selectedIndustryId)
  const categories = selectedIndustry?.categories || []
  const subcategories = categories.find((c: Types.CategoryResponse) => c.category_id === selectedCategoryId)?.subcategories || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5 text-primary" /> Manage Metadata
          </DialogTitle>
          <DialogDescription className="text-xs font-bold uppercase tracking-wider">
            Categorize document for improved RAG context.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Industry</label>
            <Select 
              value={selectedIndustryId} 
              onValueChange={(val) => { 
                setSelectedIndustryId(val)
                setSelectedCategoryId("")
                setSelectedSubcategoryId("")
              }}
            >
              <SelectTrigger className="w-full h-11 border-border bg-muted/30 font-bold text-xs">
                <SelectValue placeholder="Select Industry" />
              </SelectTrigger>
              <SelectContent className="border-border shadow-2xl">
                {industries.map(ind => (
                  <SelectItem key={ind.industry_id} value={ind.industry_id} className="font-bold text-xs">
                    {ind.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</label>
            <Select 
              value={selectedCategoryId} 
              onValueChange={(val) => { 
                setSelectedCategoryId(val)
                setSelectedSubcategoryId("")
              }} 
              disabled={!selectedIndustryId}
            >
              <SelectTrigger className="w-full h-11 border-border bg-muted/30 font-bold text-xs">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="border-border shadow-2xl">
                {categories.map((cat: Types.CategoryResponse) => (
                  <SelectItem key={cat.category_id} value={cat.category_id} className="font-bold text-xs">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subcategory</label>
            <Select 
              value={selectedSubcategoryId} 
              onValueChange={setSelectedSubcategoryId} 
              disabled={!selectedCategoryId}
            >
              <SelectTrigger className="w-full h-11 border-border bg-muted/30 font-bold text-xs">
                <SelectValue placeholder="Select Subcategory" />
              </SelectTrigger>
              <SelectContent className="border-border shadow-2xl">
                {subcategories.map((sub: Types.SubcategoryResponse) => (
                  <SelectItem key={sub.subcategory_id} value={sub.subcategory_id} className="font-bold text-xs">
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onClose(false)} className="font-bold text-xs">
            Cancel
          </Button>
          <Button onClick={handleSaveMetadata} disabled={isSavingMetadata} className="font-bold text-xs gap-2">
            {isSavingMetadata ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />} 
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
