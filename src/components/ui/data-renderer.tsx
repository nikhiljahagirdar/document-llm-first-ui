import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataRendererProps {
  data: any
  className?: string
  depth?: number
}

export function DataRenderer({ data, className, depth = 0 }: DataRendererProps) {
  if (data === null || data === undefined) return null

  // Handle Arrays
  if (Array.isArray(data)) {
    if (data.length === 0) return <p className="text-xs italic text-muted-foreground">Empty List</p>

    // Check if it's an array of objects for table rendering
    const isArrayOfObjects = data.length > 0 && typeof data[0] === 'object' && data[0] !== null && !Array.isArray(data[0])

    if (isArrayOfObjects) {
      const keys = Array.from(new Set(data.flatMap(obj => Object.keys(obj))))
      return (
        <div className={cn("rounded-xl border border-border bg-card overflow-hidden shadow-sm", className)}>
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-border">
                {keys.map(key => (
                  <TableHead key={key} className="h-11 px-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/60 border-r border-border/50 last:border-0">
                    {key.replace(/_/g, ' ')}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, idx) => (
                <TableRow key={idx} className="hover:bg-primary/[0.02] transition-colors border-b border-border/50 last:border-0">
                  {keys.map(key => (
                    <TableCell key={key} className="p-4 border-r border-border/50 last:border-0 align-top">
                      <DataRenderer data={item[key]} depth={depth + 1} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )
    }

    // Simple list
    return (
      <ul className={cn("space-y-2 ml-6 list-disc marker:text-primary/40", className)}>
        {data.map((item, idx) => (
          <li key={idx} className="text-sm font-medium text-foreground/70 leading-relaxed">
            <DataRenderer data={item} depth={depth + 1} />
          </li>
        ))}
      </ul>
    )
  }

  // Handle Objects
  if (typeof data === 'object' && data !== null) {
    // Check if it's a specific object from backend that needs flattening (e.g. {label, type})
    if (data.label && data.type) {
      return <span className="text-sm font-bold text-foreground bg-primary/5 px-2 py-0.5 rounded-md ring-1 ring-primary/10">{String(data.label)}</span>
    }

    // Check if it's a "label" object from the backend
    if (data.label && Object.keys(data).length <= 2) {
      return <span className="text-sm font-bold text-foreground bg-primary/5 px-2 py-0.5 rounded-md ring-1 ring-primary/10">{String(data.label)}</span>
    }

    const entries = Object.entries(data)
    if (entries.length === 0) return <p className="text-xs italic text-muted-foreground/40 uppercase tracking-widest">Empty Dataset</p>

    // Use Grid for objects
    return (
      <div className={cn("grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3", depth > 0 && "grid-cols-1 md:grid-cols-1 lg:grid-cols-1", className)}>
        {entries.map(([key, value]) => (
          <div key={key} className="space-y-1.5 pb-3 border-b border-border/50 last:border-0 group/field">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/40 group-hover/field:text-primary transition-colors">
              {key.replace(/_/g, ' ')}
            </p>
            <div className="text-sm font-semibold leading-relaxed text-foreground/80">
              <DataRenderer data={value} depth={depth + 1} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Primitives
  return <span className="text-sm font-bold text-foreground/90 leading-relaxed">{String(data)}</span>
}
