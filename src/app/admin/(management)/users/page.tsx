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
  Shield, 
  User, 
  ShieldCheck,
  Mail,
  Calendar,
  Search,
  Filter,
  UserPlus
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import * as Types from "@/types/api"

export default function UsersAdminPage() {
  const [users, setUsers] = React.useState<Types.UserResponse[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  const fetchUsers = React.useCallback(async () => {
    try {
      // For now, let's assume we fetch all users or use tenant list logic
      const data = await api.listAllTenants()
      // This is a placeholder since we don't have a direct listAllUsers yet in the simple API
      // In a real scenario, we'd have api.listAllUsers()
      setUsers([])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-card-foreground flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-md shadow-md text-white text-card-foreground">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            Global Users
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-1 text-card-foreground">Manage users and their permissions across the system.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-card p-1.5 rounded-md border shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search users..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-11 w-64 border-none bg-slate-50 dark:bg-slate-950 rounded-md font-medium"
              />
            </div>
            <Button variant="ghost" size="icon" className="rounded-md h-11 w-11"><Filter className="h-4 w-4" /></Button>
          </div>
          <Button className="rounded-full bg-indigo-600 hover:bg-indigo-500 font-semibold tracking-normal text-xs h-12 px-8 shadow-md text-white border-none gap-2">
            <UserPlus className="h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-md border-none shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50">
              <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="font-semibold tracking-normal text-xs h-16 px-10">User Identity</TableHead>
                <TableHead className="font-semibold tracking-normal text-xs h-16">Role</TableHead>
                <TableHead className="font-semibold tracking-normal text-xs h-16">Status</TableHead>
                <TableHead className="font-semibold tracking-normal text-xs h-16">Joined</TableHead>
                <TableHead className="font-semibold tracking-normal text-xs h-16 px-10 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-40">
                    <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="font-semibold tracking-normal text-xs">Loading Users...</p>
                  </div>
                </TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-30">
                    <User className="h-12 w-12" />
                    <p className="font-semibold tracking-normal text-xs">No user accounts detected</p>
                  </div>
                </TableCell></TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.user_id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors group">
                    <TableCell className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                          <AvatarFallback className="bg-indigo-50 text-indigo-600 font-semibold tracking-normal text-xs">
                            {(u.first_name || u.email)[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-card-foreground text-base tracking-tight">{u.first_name || u.email}</span>
                          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs tracking-normal">
                            <Mail className="h-3 w-3" /> {u.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-indigo-600" />
                        <span className="font-semibold text-slate-600 dark:text-slate-300 tracking-normal text-xs">{u.role?.name || u.role_name || 'MEMBER'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "font-semibold  tracking-normal text-xs px-2.5 h-6 border-none shadow-sm",
                        u.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                      )}>
                        {u.is_active ? "ACTIVE" : "SUSPENDED"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                        <Calendar className="h-3.5 w-3.5" />
                        {u.created_on ? new Date(u.created_on).toLocaleDateString() : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="px-10 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                            <MoreVertical className="h-5 w-5 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-md border-none shadow-2xl p-2 bg-card">
                          <DropdownMenuLabel className="text-xs font-semibold tracking-normal text-slate-400 p-3">User Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="rounded-md font-bold text-sm p-3 cursor-pointer">
                            <User className="h-4 w-4 mr-3 text-slate-400" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-md font-bold text-sm p-3 cursor-pointer">
                            <Shield className="h-4 w-4 mr-3 text-slate-400" /> Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800 my-2" />
                          <DropdownMenuItem className="rounded-md font-bold text-sm p-3 cursor-pointer text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                            Deactivate Account
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
    </div>
  )
}
