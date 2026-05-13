"use client"

import * as React from "react"
import { api } from "@/lib/api"
import * as Types from "@/types/api"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Search, 
  MoreVertical, 
  Plus, 
  Trash2, 
  Edit,
  Database,
  Globe,
  Filter
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function IndustriesAdminPage() {
  const [industries, setIndustries] = React.useState<Types.IndustryResponse[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  const fetchIndustries = React.useCallback(async () => {
    try {
      const data = await api.getIndustries()
      setIndustries(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchIndustries()
  }, [fetchIndustries])

  const filteredIndustries = industries.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.description || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-card-foreground flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-md shadow-md text-white">
              <Globe className="h-6 w-6" />
            </div>
            Industry Taxonomy
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-1">Hierarchical classification for document intelligence.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-card p-1.5 rounded-md border shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search industries..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-11 w-64 border-none bg-slate-50 dark:bg-slate-950 rounded-md font-medium"
              />
            </div>
            <Button variant="ghost" size="icon" className="rounded-md h-11 w-11"><Filter className="h-4 w-4" /></Button>
          </div>
          <Button className="rounded-full bg-indigo-600 hover:bg-indigo-500 font-semibold tracking-normal text-xs h-12 px-8 shadow-md text-white border-none gap-2">
            <Plus className="h-4 w-4" /> New Industry
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-md border-none shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50">
            <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="w-[300px] font-semibold tracking-normal text-xs h-16 px-8">Industry Name</TableHead>
              <TableHead className="font-semibold tracking-normal text-xs h-16">Description</TableHead>
              <TableHead className="font-semibold tracking-normal text-xs h-16">Industry ID</TableHead>
              <TableHead className="text-right font-semibold tracking-normal text-xs h-16 px-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-xs font-semibold tracking-normal text-slate-400">Loading Taxonomy...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredIndustries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center opacity-30 gap-4">
                    <Database className="h-12 w-12" />
                    <p className="text-xs font-bold uppercase tracking-widest">No industries detected</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredIndustries.map((industry) => (
                <TableRow key={industry.industry_id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-950/30">
                  <TableCell className="px-8 h-20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-md bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-sm text-card-foreground">{industry.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-medium text-slate-500 max-w-md line-clamp-2">{industry.description || "No description provided."}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-slate-200 dark:border-slate-800 text-[10px] font-bold tracking-widest uppercase h-6 px-3">
                      {industry.industry_id?.slice(0, 8) || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"><Edit className="h-4 w-4 text-slate-400" /></Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md hover:bg-rose-50 text-rose-500"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
