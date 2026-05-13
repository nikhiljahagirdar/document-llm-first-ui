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
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  ExternalLink,
  Calendar
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
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import Link from "next/link"

interface InvoiceItem {
  invoice_id: string
  tenant_name: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  due_date: string
  created_on: string
}

export default function InvoicesAdminPage() {
  const [invoices, setInvoices] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  const fetchInvoices = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getInvoices()
      setInvoices(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-card-foreground flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-md shadow-md text-white">
              <FileText className="h-6 w-6" />
            </div>
            Tenant Invoices
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-1">Trace and manage billing history.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-card p-1.5 rounded-md border shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search invoices..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-11 w-64 border-none bg-slate-50 dark:bg-slate-950 rounded-md font-medium"
              />
            </div>
            <Button variant="ghost" size="icon" className="rounded-md h-11 w-11"><Filter className="h-4 w-4" /></Button>
          </div>
          <Button variant="outline" className="rounded-full border-2 font-semibold tracking-normal text-xs h-12 px-8">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-md border-none shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50">
            <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="font-semibold tracking-normal text-xs h-16 px-10">Invoice ID</TableHead>
              <TableHead className="font-semibold tracking-normal text-xs h-16">Amount</TableHead>
              <TableHead className="font-semibold tracking-normal text-xs h-16">Status</TableHead>
              <TableHead className="font-semibold tracking-normal text-xs h-16">Created At</TableHead>
              <TableHead className="font-semibold tracking-normal text-xs h-16 px-10 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="h-64 text-center">
                <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              </TableCell></TableRow>
            ) : invoices.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-64 text-center opacity-30 font-semibold tracking-normal text-xs">No invoices found</TableCell></TableRow>
            ) : (
              invoices.map((item) => (
                <TableRow key={item.invoice_id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors group">
                  <TableCell className="px-10 py-6">
                    <span className="font-semibold text-card-foreground text-sm tracking-tight">{item.invoice_id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-card-foreground">${item.amount.toFixed(2)} {item.currency?.toUpperCase()}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "font-semibold  tracking-normal text-xs px-2.5 h-6 border-none shadow-sm",
                      item.status === 'paid' ? "bg-emerald-500/10 text-emerald-600" : 
                      item.status === 'pending' ? "bg-amber-500/10 text-amber-600" : "bg-rose-500/10 text-rose-600"
                    )}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(item.created_on).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="px-10 text-right">
                    {item.hosted_invoice_url && (
                      <Link href={item.hosted_invoice_url} target="_blank">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                          <ExternalLink className="h-4 w-4 text-slate-400" />
                        </Button>
                      </Link>
                    )}
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
