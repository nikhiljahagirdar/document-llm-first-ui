"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  Cloud, 
  FileIcon, 
  DownloadCloud,
  FileText,
  MoreVertical
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export default function IntegrationsPage() {
  const { toast } = useToast()
  const [googleStatus, setGoogleStatus] = React.useState<{ connected: boolean; email?: string } | null>(null)
  const [files, setFiles] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [syncing, setSyncing] = React.useState(false)
  const [importing, setImporting] = React.useState<string | null>(null)

  const checkStatus = React.useCallback(async () => {
    try {
      const status = await api.getGoogleStatus()
      setGoogleStatus(status)
      if (status && status.connected) {
        try {
           const driveFiles = await api.listGoogleFiles()
           setFiles(driveFiles || [])
        } catch (err) {
           console.error("Failed to load google files", err)
        }
      }
    } catch (err) {
      console.error(err)
      setGoogleStatus({ connected: false })
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    checkStatus()
  }, [checkStatus])

  const handleConnect = async () => {
    try {
      const response = await api.getGoogleAuthUrl()
      if (response && response.url) {
        window.location.href = response.url
      }
    } catch (err) {
      toast({
        title: "Connection Error",
        description: "Unable to retrieve auth URL. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await api.syncGoogleDrive()
      toast({
        title: "Sync Success",
        description: "Google Drive sync initialized. New documents will appear shortly.",
      })
      await checkStatus()
    } catch (err) {
      toast({
        title: "Sync Failed",
        description: "Unable to trigger document synchronization.",
        variant: "destructive"
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleImport = async (file: any) => {
    setImporting(file.id)
    try {
      await api.importGoogleDoc({
        google_doc_id: file.id,
        filename: file.name,
        mime_type: file.mimeType
      })
      toast({
        title: "Document Imported",
        description: `${file.name} is now processing.`,
      })
    } catch (err) {
       toast({
        title: "Import Failed",
        description: "Could not fetch the document contents.",
        variant: "destructive"
      })
    } finally {
      setImporting(null)
    }
  }

  if (loading) {
     return (
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
           <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
           <p className="text-muted-foreground font-bold text-sm">Loading Integrations...</p>
        </div>
     )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">App Marketplace</h1>
        <p className="text-muted-foreground text-lg font-medium mt-1">Extend functionalities by connecting external apps.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Google Drive Connection Card */}
        <Card className="col-span-1 rounded-2xl border-border bg-card overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
           <div className="p-8 border-b border-border/50 flex flex-col items-center text-center space-y-4 bg-muted/10">
              <div className="h-20 w-20 rounded-3xl bg-white dark:bg-white/5 shadow-xl flex items-center justify-center relative group">
                  <Globe className="h-10 w-10 text-primary group-hover:rotate-12 transition-transform duration-500" />
                 {googleStatus?.connected && (
                    <div className="absolute -bottom-2 -right-2 h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-card shadow-lg">
                       <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    </div>
                 )}
              </div>
              <div className="space-y-1">
                 <h3 className="text-xl font-bold">Google Drive</h3>
                 <p className="text-xs text-muted-foreground font-medium">Cloud Storage & Documents</p>
              </div>
              {googleStatus?.connected ? (
                 <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 uppercase text-[10px] font-bold">Connected</Badge>
              ) : (
                 <Badge variant="secondary" className="uppercase text-[10px] font-bold">Not Configured</Badge>
              )}
           </div>
           
           <CardContent className="p-6 flex-1 flex flex-col justify-between">
              <p className="text-sm text-muted-foreground text-center mb-6">
                 Enable direct importing of PDFs and documents directly from your Google Workspace environment into DocuPoint.
              </p>
              
              {googleStatus?.connected ? (
                 <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-muted/30 border border-border/50 flex items-center gap-3">
                       <Cloud className="h-4 w-4 text-primary opacity-50" />
                       <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-bold text-foreground truncate">{googleStatus.email || "Active User"}</p>
                          <p className="text-[10px] text-muted-foreground">Primary Account</p>
                       </div>
                    </div>
                    <Button 
                       variant="outline" 
                       className="w-full font-bold text-sm h-11 rounded-xl gap-2"
                       onClick={handleSync}
                       disabled={syncing}
                    >
                       <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
                       Sync Library
                    </Button>
                 </div>
              ) : (
                 <Button 
                    className="w-full font-bold text-sm h-12 rounded-xl bg-[#4285F4] hover:bg-[#357ae8] text-white shadow-lg shadow-blue-500/10"
                    onClick={handleConnect}
                 >
                    Connect Drive <ExternalLink className="h-4 w-4 ml-2" />
                 </Button>
              )}
           </CardContent>
        </Card>

        {/* Drive File Browser */}
        <Card className="md:col-span-2 rounded-2xl border-border bg-card shadow-sm overflow-hidden flex flex-col">
           <CardHeader className="border-b border-border p-6 flex flex-row items-center justify-between">
              <div>
                 <CardTitle className="text-lg">Cloud Documents</CardTitle>
                 <CardDescription className="text-xs">Browse and import remote resources.</CardDescription>
              </div>
              {googleStatus?.connected && (
                 <Badge variant="outline" className="bg-muted/20">{files.length} Found</Badge>
              )}
           </CardHeader>
           
           <CardContent className="p-0 flex-1 h-[500px] flex flex-col">
              {!googleStatus?.connected ? (
                 <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground opacity-50 space-y-4">
                    <AlertCircle className="h-12 w-12" />
                    <p className="font-bold text-sm">Please connect your Google Account to view cloud documents.</p>
                 </div>
              ) : files.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                       <FileIcon className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                    <div>
                       <p className="font-bold text-foreground">No Documents Found</p>
                       <p className="text-xs text-muted-foreground">We couldn't locate compatible documents in your drive root.</p>
                    </div>
                 </div>
              ) : (
                 <ScrollArea className="flex-1">
                    <div className="divide-y divide-border/40">
                       {files.map((file) => (
                          <div key={file.id} className="p-4 hover:bg-muted/20 transition-colors flex items-center gap-4 group">
                             <div className="h-10 w-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                                <FileText className="h-5 w-5 text-primary" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{file.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{file.mimeType?.split('.').pop() || "Unknown Type"}</p>
                             </div>
                             <Button 
                                size="sm" 
                                variant="secondary"
                                className="rounded-lg font-bold text-xs h-9 gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleImport(file)}
                                disabled={importing === file.id}
                             >
                                {importing === file.id ? (
                                   <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                   <DownloadCloud className="h-3.5 w-3.5" />
                                )}
                                Import
                             </Button>
                          </div>
                       ))}
                    </div>
                 </ScrollArea>
              )}
           </CardContent>
        </Card>
      </div>

      {/* Upcoming Integrations */}
      <div className="space-y-6">
         <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-widest">
            <div className="h-[1px] bg-border flex-1" />
            <span>Roadmap Releases</span>
            <div className="h-[1px] bg-border flex-1" />
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 opacity-60">
            <div className="border border-border rounded-xl p-6 text-center bg-card/50 flex flex-col items-center gap-3">
               <div className="h-10 w-10 bg-muted rounded-full" />
               <p className="font-bold text-sm">Dropbox</p>
            </div>
            <div className="border border-border rounded-xl p-6 text-center bg-card/50 flex flex-col items-center gap-3">
               <div className="h-10 w-10 bg-muted rounded-full" />
               <p className="font-bold text-sm">Slack</p>
            </div>
            <div className="border border-border rounded-xl p-6 text-center bg-card/50 flex flex-col items-center gap-3">
               <div className="h-10 w-10 bg-muted rounded-full" />
               <p className="font-bold text-sm">Notion</p>
            </div>
            <div className="border border-border rounded-xl p-6 text-center bg-card/50 flex flex-col items-center gap-3">
               <div className="h-10 w-10 bg-muted rounded-full" />
               <p className="font-bold text-sm">Box</p>
            </div>
         </div>
      </div>
    </div>
  )
}
