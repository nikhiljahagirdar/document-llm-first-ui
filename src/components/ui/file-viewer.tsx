"use client"

import * as React from "react"
import { FileText, Download, Loader2, AlertCircle, FileSpreadsheet, FileImage, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"

interface FileViewerProps {
  url: string | null
  filename: string
  fileType?: string
  className?: string
}

export function FileViewer({ url, filename, fileType: explicitFileType, className }: FileViewerProps) {
  const { token } = useAuthStore()
  const [fileType, setFileType] = React.useState<string>(explicitFileType || "")
  const [csvData, setCsvData] = React.useState<string[][]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (explicitFileType) {
      setFileType(explicitFileType)
      return
    }
    if (!url) return

    // Sniff file type from filename or URL
    let ext = filename.split(".").pop()?.toLowerCase() || ""
    
    if (!ext || ext === filename.toLowerCase()) {
      try {
        const path = new URL(url.startsWith('http') ? url : `http://localhost/${url}`).pathname
        const urlExt = path.split(".").pop()?.toLowerCase() || ""
        if (urlExt && urlExt.length < 5) ext = urlExt
      } catch (e) {}
    }
    
    setFileType(ext)

    if (ext === "csv") {
      const loadCsv = async () => {
        setLoading(true)
        setError(null)
        try {
          const res = await fetch(url)
          if (!res.ok) throw new Error("Failed to fetch CSV data")
          const text = await res.text()
          const rows = text.split("\n")
            .filter(row => row.trim())
            .map(row => row.split(","))
          setCsvData(rows)
        } catch (err) {
          console.error("CSV load error:", err)
          setError("Could not parse CSV data. It might be too large or malformed.")
        } finally {
          setLoading(false)
        }
      }
      loadCsv()
    }
  }, [url, filename])

  if (!url) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-12 text-center space-y-4 opacity-30", className)}>
        <File className="h-12 w-12" />
        <p className="text-[10px] font-bold uppercase tracking-widest">No Source Resource Available</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-20 space-y-4", className)}>
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Buffering Data Stream...</p>
      </div>
    )
  }

  // IMAGE RENDERER
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileType)) {
    return (
      <div className={cn("flex items-center justify-center bg-muted/20 p-4 h-full", className)}>
        <img 
          src={url} 
          alt={filename} 
          className="max-w-full max-h-full object-contain shadow-2xl rounded-md" 
          onError={() => setError("Image failed to load. Check S3 permissions or CORS.")}
        />
        {error && <p className="absolute bottom-4 text-[10px] text-destructive bg-background/80 px-2 py-1 rounded">{error}</p>}
      </div>
    )
  }

  // PDF RENDERER (Using native browser viewer via object/iframe)
  if (fileType === "pdf") {
    // We don't append hash fragments to blob URLs as it can break some browser implementations
    const pdfUrl = url.startsWith('blob:') ? url : `${url}#toolbar=0&navpanes=0`
    
    return (
      <div className={cn("w-full h-full min-h-[600px] bg-background/50 flex flex-col relative rounded-xl overflow-hidden border border-border/50 shadow-2xl", className)}>
        <object
          data={pdfUrl}
          type="application/pdf"
          className="w-full h-full border-none"
        >
          <iframe 
            src={pdfUrl} 
            className="w-full h-full border-none"
            title={filename}
          >
            <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-4">
              <AlertCircle className="h-10 w-10 text-destructive opacity-50" />
              <p className="text-xs font-bold uppercase tracking-widest">PDF Rendering Not Supported</p>
              <Button asChild variant="outline" size="sm">
                <a href={url} target="_blank" rel="noreferrer">Open in New Tab</a>
              </Button>
            </div>
          </iframe>
        </object>
      </div>
    )
  }

  // OFFICE DOCS RENDERER (Using Microsoft Online Viewer)
  if (["docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(fileType)) {
    const encodedUrl = encodeURIComponent(url)
    const officeUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`
    
    return (
      <div className={cn("w-full h-full min-h-[600px] bg-background/50 flex flex-col relative rounded-xl overflow-hidden border border-border/50 shadow-2xl", className)}>
        <iframe 
          src={officeUrl} 
          className="w-full h-full border-none"
          title={filename}
        />
        <div className="absolute top-2 right-2 flex gap-2">
           <Button variant="outline" size="sm" asChild className="h-8 text-[9px] font-bold uppercase tracking-widest bg-background/80 backdrop-blur-sm">
             <a href={url} target="_blank" rel="noreferrer">
               <Download className="h-3 w-3 mr-1.5" /> Raw Source
             </a>
           </Button>
        </div>
      </div>
    )
  }

  // CSV RENDERER (Advanced Table)
  if (fileType === "csv") {
    if (error) {
      return (
        <div className={cn("flex flex-col items-center justify-center p-12 text-center space-y-4", className)}>
          <AlertCircle className="h-10 w-10 text-destructive opacity-50" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.open(url)}>
            Open Raw CSV
          </Button>
        </div>
      )
    }

    return (
      <ScrollArea className={cn("w-full h-full border-none", className)}>
        <div className="p-4">
          <table className="w-full text-left border-collapse border border-border bg-card rounded-md overflow-hidden text-xs">
            <thead className="bg-muted/50">
              <tr>
                {csvData[0]?.map((header, i) => (
                  <th key={i} className="p-3 border border-border font-bold uppercase tracking-widest text-[10px] text-primary">
                    {header.trim() || `Col ${i + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.slice(1).map((row, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  {row.map((cell, j) => (
                    <td key={j} className="p-3 border border-border font-medium text-foreground/80">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    )
  }

  // DEFAULT DOWNLOAD / FALLBACK
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center space-y-6", className)}>
      <div className="h-20 w-20 rounded-md bg-primary/10 flex items-center justify-center text-primary animate-pulse">
        <FileText className="h-10 w-10" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold tracking-tight">{filename}</h3>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Format: {fileType || "Binary Stream"}</p>
        <p className="text-[9px] text-muted-foreground max-w-[200px] mx-auto mt-2 italic">Direct display not supported for this format. Please download for offline verification.</p>
      </div>
      <Button asChild className="rounded-xl font-bold text-xs uppercase tracking-widest px-8 shadow-lg shadow-primary/20">
        <a href={url} target="_blank" rel="noreferrer" download={filename}>
          <Download className="h-4 w-4 mr-2" /> Download Source
        </a>
      </Button>
    </div>
  )
}
