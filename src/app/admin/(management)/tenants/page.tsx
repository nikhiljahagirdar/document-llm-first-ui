"use client"

import * as React from "react"
import { api } from "@/lib/api"
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
  Users, 
  Building2, 
  Search, 
  MoreVertical, 
  ShieldAlert,
  ShieldCheck,
  Ban,
  Filter
} from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import * as Types from "@/types/api"

export default function TenantsAdminPage() {
  const [tenants, setTenants] = React.useState<Types.TenantResponse[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  const fetchTenants = React.useCallback(async () => {
    try {
      const data = await api.listAllTenants()
      setTenants(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchTenants()
  }, [fetchTenants])

  const handleSuspend = async (id: string) => {
    try {
      await api.suspendTenant(id)
      fetchTenants()
    } catch (err) {
      console.error(err)
    }
  }

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-card-foreground flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-md shadow-md text-white">
              <Building2 className="h-6 w-6" />
            </div>
            Organizations
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-1">Manage all registered organizations and their data.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-card p-1.5 rounded-md border shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search tenants..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-11 w-64 border-none bg-slate-50 dark:bg-slate-950 rounded-md font-medium"
            />
          </div>
          <Button variant="ghost" size="icon" className="rounded-md h-11 w-11"><Filter className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="bg-card rounded-md border-none shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50">
            <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="w-[300px] font-semibold tracking-normal text-xs h-16 px-8">Organization</TableHead>
              <TableHead className="font-semibold tracking-normal text-xs h-16">Plan Type</TableHead>
              <TableHead className="font-semibold tracking-normal text-xs h-16">Status</TableHead>
              <TableHead className="font-semibold tracking-normal text-xs h-16">Provisioned</TableHead>
              <TableHead className="text-right font-semibold tracking-normal text-xs h-16 px-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-xs font-semibold tracking-normal text-slate-400">Loading Data...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <p className="text-xs font-semibold tracking-normal text-slate-400 opacity-50">No tenants detected in registry.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTenants.map((tenant) => (
                <TableRow key={tenant.tenant_id} className="border-b border-slate-50 dark:border-slate-800/50 group hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors">
                  <TableCell className="px-8 h-20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-md bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-semibold text-xs">
                        {tenant.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-card-foreground">{tenant.name}</p>
                        <p className="text-xs font-bold text-slate-400 tracking-normal">/{tenant.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-slate-200 dark:border-slate-800 text-xs font-semibold tracking-normal h-6 px-3">
                      {tenant.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tenant.is_active ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-semibold text-xs tracking-normal h-6 px-3">
                        <ShieldCheck className="h-3 w-3 mr-1.5" /> ONLINE
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-500/10 text-rose-600 border-none font-semibold text-xs tracking-normal h-6 px-3">
                        <Ban className="h-3 w-3 mr-1.5" /> SUSPENDED
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-[11px] font-bold text-slate-500">
                      {tenant.created_on ? new Date(tenant.created_on).toLocaleDateString() : 'N/A'}
                    </p>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-md border-none shadow-2xl p-2 bg-card">
                        <DropdownMenuLabel className="text-xs font-semibold tracking-normal text-slate-400 p-3">Organization Actions</DropdownMenuLabel>
                        <Link href="/admin/users">
                          <DropdownMenuItem className="rounded-md font-bold text-sm p-3 cursor-pointer">
                            <Users className="h-4 w-4 mr-3 text-slate-400" /> View Users
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/admin/logs">
                          <DropdownMenuItem className="rounded-md font-bold text-sm p-3 cursor-pointer">
                            <ShieldAlert className="h-4 w-4 mr-3 text-slate-400" /> Audit Logs
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800 my-2" />
                        {tenant.is_active ? (
                          <DropdownMenuItem 
                            onClick={() => handleSuspend(tenant.tenant_id)}
                            className="rounded-md font-bold text-sm p-3 cursor-pointer text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                          >
                            <Ban className="h-4 w-4 mr-3" /> Suspend Account
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="rounded-md font-bold text-sm p-3 cursor-pointer text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                            <ShieldCheck className="h-4 w-4 mr-3" /> Restore Account
                          </DropdownMenuItem>
                        )}
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
