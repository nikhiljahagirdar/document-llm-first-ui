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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Briefcase, 
  ShieldCheck, 
  ChevronRight, 
  FileDown, 
  Loader2, 
  Sparkles,
  Layout,
  MoreVertical,
  Pencil,
  Trash2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TemplateCard } from "@/components/dashboard/templates/template-card"

export default function TemplateListPage() {
  const [industries, setIndustries] = React.useState<Types.IndustryResponse[]>([])
  const [selectedIndustryId, setSelectedIndustryId] = React.useState<string>("all")
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>("all")
  const [selectedSubcategoryId, setSelectedSubcategoryId] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const [publicTemplates, setPublicTemplates] = React.useState<Types.TemplateResponse[]>([])
  const [myTemplates, setMyTemplates] = React.useState<Types.TemplateResponse[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const [inds, pub, mine] = await Promise.all([
        api.getIndustries(),
        api.getPublicTemplates(),
        api.getMyTemplates()
      ])
      setIndustries(inds || [])
      setPublicTemplates(pub || [])
      setMyTemplates(mine || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredPublic = publicTemplates.filter(t => {
    if (selectedIndustryId !== "all" && t.industry_id !== selectedIndustryId) return false
    if (selectedCategoryId !== "all" && t.category_id !== selectedCategoryId) return false
    if (selectedSubcategoryId !== "all" && t.subcategory_id !== selectedSubcategoryId) return false
    if (searchQuery && !t.template_name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const filteredMine = myTemplates.filter(t => {
    if (selectedIndustryId !== "all" && t.industry_id !== selectedIndustryId) return false
    if (selectedCategoryId !== "all" && t.category_id !== selectedCategoryId) return false
    if (selectedSubcategoryId !== "all" && t.subcategory_id !== selectedSubcategoryId) return false
    if (searchQuery && !t.template_name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const categories = industries.find(i => i.industry_id === selectedIndustryId)?.categories || []
  const subcategories = categories.find(c => c.category_id === selectedCategoryId)?.subcategories || []

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Intelligence <span className="text-primary">Blueprints</span></h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Manage and deploy structured document architectures.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/templates/studio">
            <Button variant="outline" className="rounded-xl font-bold text-[10px] uppercase tracking-widest h-11 px-6 gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> AI Studio
            </Button>
          </Link>
          <Link href="/dashboard/templates/builder">
            <Button className="rounded-xl bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-widest h-11 px-6 gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 stroke-[3px]" /> Create Blueprint
            </Button>
          </Link>
        </div>
      </div>

      <Card className="rounded-2xl border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search blueprints..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-background border-border rounded-xl font-medium"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedIndustryId} onValueChange={(val) => { 
              setSelectedIndustryId(val); 
              setSelectedCategoryId("all");
              setSelectedSubcategoryId("all");
            }}>
              <SelectTrigger className="w-[160px] h-11 rounded-xl bg-background border-border font-bold text-[10px] uppercase tracking-wider">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="all" className="text-xs font-bold uppercase">All Industries</SelectItem>
                {industries.map(ind => <SelectItem key={ind.industry_id} value={ind.industry_id} className="text-xs font-bold">{ind.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedCategoryId} onValueChange={(val) => {
              setSelectedCategoryId(val);
              setSelectedSubcategoryId("all");
            }} disabled={selectedIndustryId === "all"}>
              <SelectTrigger className="w-[160px] h-11 rounded-xl bg-background border-border font-bold text-[10px] uppercase tracking-wider">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="all" className="text-xs font-bold uppercase">All Categories</SelectItem>
                {categories.map(cat => <SelectItem key={cat.category_id} value={cat.category_id} className="text-xs font-bold">{cat.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedSubcategoryId} onValueChange={setSelectedSubcategoryId} disabled={selectedCategoryId === "all"}>
              <SelectTrigger className="w-[160px] h-11 rounded-xl bg-background border-border font-bold text-[10px] uppercase tracking-wider">
                <SelectValue placeholder="Subcategory" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="all" className="text-xs font-bold uppercase">All Subcategories</SelectItem>
                {subcategories.map(sub => <SelectItem key={sub.subcategory_id} value={sub.subcategory_id} className="text-xs font-bold">{sub.name}</SelectItem>)}
              </SelectContent>
            </Select>
            
            {(selectedIndustryId !== "all" || searchQuery) && (
              <Button variant="ghost" onClick={() => { 
                setSelectedIndustryId("all"); 
                setSelectedCategoryId("all"); 
                setSelectedSubcategoryId("all");
                setSearchQuery(""); 
              }} className="h-11 px-4 text-[10px] font-bold uppercase text-muted-foreground hover:text-primary">
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Syncing Blueprint Registry...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* My Templates */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-1">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Tenant Blueprints</h2>
              <Badge variant="secondary" className="rounded-lg font-bold text-[10px]">{filteredMine.length}</Badge>
            </div>
            {filteredMine.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMine.map(t => <TemplateCard key={t.template_id} template={t} onRefresh={fetchData} />)}
              </div>
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-border rounded-2xl bg-muted/5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">No tenant blueprints found</p>
              </div>
            )}
          </div>

          {/* Public Templates */}
          <div className="space-y-6 pt-12 border-t border-border">
            <div className="flex items-center gap-3 px-1">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-bold tracking-tight">System Blueprints</h2>
              <Badge variant="outline" className="rounded-lg font-bold text-[10px]">{filteredPublic.length}</Badge>
            </div>
            {filteredPublic.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPublic.map(t => <TemplateCard key={t.template_id} template={t} isPublic onRefresh={fetchData} />)}
              </div>
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-border rounded-2xl bg-muted/5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">No system blueprints found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

