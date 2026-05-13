"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { 
  Settings, 
  Globe, 
  ShieldCheck, 
  Mail, 
  Cpu,
  Save,
  RefreshCw
} from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-card-foreground flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-md shadow-md text-white">
              <Settings className="h-6 w-6" />
            </div>
            System Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-1">Configure platform behavior, security rules, and AI settings.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full h-12 px-6 font-semibold tracking-normal text-xs border-2">
            <RefreshCw className="h-4 w-4 mr-2" /> Reset Defaults
          </Button>
          <Button className="rounded-full bg-indigo-600 hover:bg-indigo-500 font-semibold tracking-normal text-xs h-12 px-8 shadow-md text-white border-none">
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="rounded-md border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-card overflow-hidden">
          <CardHeader className="p-10 pb-6 border-b border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-xl font-semibold">Platform Identity</CardTitle>
            </div>
            <CardDescription className="text-sm font-medium">Public facing branding and global info.</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <div className="space-y-3">
              <Label className="text-xs font-semibold tracking-normal text-slate-400 ml-1">Platform Name</Label>
              <Input defaultValue="DocuPoint AI" className="rounded-md h-12 border-slate-100 dark:border-slate-800 font-bold" />
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-semibold tracking-normal text-slate-400 ml-1">Support Email</Label>
              <Input defaultValue="ops@docupoint.ai" className="rounded-md h-12 border-slate-100 dark:border-slate-800 font-bold" />
            </div>
            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 rounded-md">
              <div className="space-y-1">
                <p className="font-semibold text-sm">Maintenance Mode</p>
                <p className="text-xs font-medium text-slate-500">Disable all non-admin access.</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-md border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-card overflow-hidden">
          <CardHeader className="p-10 pb-6 border-b border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <Cpu className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-xl font-semibold">AI Settings</CardTitle>
            </div>
            <CardDescription className="text-sm font-medium">Core processing rules for all organizations.</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <div className="space-y-3">
              <Label className="text-xs font-semibold tracking-normal text-slate-400 ml-1">Default AI Model</Label>
              <Input defaultValue="core-extraction-engine" className="rounded-md h-12 border-slate-100 dark:border-slate-800 font-bold" />
            </div>
            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 rounded-md">
              <div className="space-y-1">
                <p className="font-semibold text-sm">Auto-Process Scans</p>
                <p className="text-xs font-medium text-slate-500">Automatically trigger AI analysis on all uploads.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 rounded-md">
              <div className="space-y-1">
                <p className="font-semibold text-sm">Search Persistence</p>
                <p className="text-xs font-medium text-slate-500">Keep search data after document deletion.</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
