"use client"

import * as React from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  MoreVertical, 
  GitBranch,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

interface SubcategoryItem {
  subcategory_id: string
  name: string
  category_name: string
  is_active: boolean
  created_on: string
}

export default function SubcategoriesAdminPage() {
  const [subcategories, setSubcategories] = React.useState<SubcategoryItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  const fetchSubcategories = React.useCallback(async () => {
    setLoading(true)
    try {
      const industries = await api.getIndustries()
      const allSubcategories: SubcategoryItem[] = []
      
      industries.forEach((ind: any) => {
        if (ind.categories) {
          ind.categories.forEach((cat: any) => {
            if (cat.subcategories) {
              cat.subcategories.forEach((sub: any) => {
                allSubcategories.push({
                  ...sub,
                  category_name: cat.name
                })
              })
            }
          })
        }
      })
      
      setSubcategories(allSubcategories)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete associated templates.")) return
    try {
      await api.deleteSubcategory(id)
      fetchSubcategories()
    } catch (err) {
      alert("Failed to delete subcategory")
    }
  }

  React.useEffect(() => {
    fetchSubcategories()
  }, [fetchSubcategories])

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-card-foreground flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-md shadow-md text-white">
              <GitBranch className="h-6 w-6" />
            </div>
            Subcategories
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-1">Refine document classification with subcategories.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-card p-1.5 rounded-md border shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search subcategories..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-11 w-64 border-none bg-slate-50 dark:bg-slate-950 rounded-md font-medium"
              />
            </div>
            <Button variant="ghost" size="icon" className="rounded-md h-11 w-11"><Filter className="h-4 w-4" /></Button>
          </div>
          <Button className="rounded-full bg-indigo-600 hover:bg-indigo-500 font-semibold tracking-normal text-xs h-12 px-8 shadow-md text-white border-none gap-2">
            <Plus className="h-4 w-4" /> Add Subcategory
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-md border-none shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50">
            <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="font-semibold tracking-normal text-xs h-16 px-10">Name</TableHead>
              <TableHead className="font-semibold tracking-normal text-xs h-16">Parent Category</TableHead>
              <TableHead className="font-semibold tracking-normal text-xs h-16">Status</TableHead>
              <TableHead className="font-semibold tracking-normal text-xs h-16 px-10 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="h-64 text-center">
                <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              </TableCell></TableRow>
            ) : subcategories.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="h-64 text-center opacity-30 font-semibold tracking-normal text-xs">No subcategories found</TableCell></TableRow>
            ) : (
              subcategories.map((item) => (
                <TableRow key={item.subcategory_id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors group">
                  <TableCell className="px-10 py-6">
                    <span className="font-semibold text-card-foreground text-base tracking-tight">{item.name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Layers className="h-3 w-3 text-indigo-500" />
                      <span className="text-slate-600 dark:text-slate-300 font-bold text-xs tracking-normal">{item.category_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("font-semibold  tracking-normal text-xs px-2.5 h-6 border-none shadow-sm", item.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>
                      {item.is_active ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-10 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                          <MoreVertical className="h-5 w-5 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-md border-none shadow-2xl p-2 bg-card">
                        <DropdownMenuItem className="rounded-md font-bold text-sm p-3 cursor-pointer">
                          <Edit2 className="h-4 w-4 mr-3 text-slate-400" /> Edit Subcategory
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800 my-2" />
                        <DropdownMenuItem className="rounded-md font-bold text-sm p-3 cursor-pointer text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                          <Trash2 className="h-4 w-4 mr-3" /> Remove Subcategory
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
