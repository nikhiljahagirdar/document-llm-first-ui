import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DoclingDocument {
  body: any
  texts: any[]
  groups: any[]
  tables: any[]
  [key: string]: any
}

interface DoclingRendererProps {
  document: DoclingDocument
  className?: string
}

export function DoclingRenderer({ document, className }: DoclingRendererProps) {
  if (!document || !document.body) return null

  // Helper to resolve references like "#/texts/2"
  const resolveRef = (ref: string) => {
    if (!ref || !ref.startsWith("#/")) return null
    const parts = ref.split("/")
    const type = parts[1] // e.g., "texts", "groups", "tables"
    const index = parseInt(parts[2], 10)
    
    if (type === "texts" && document.texts) return document.texts[index]
    if (type === "groups" && document.groups) return document.groups[index]
    if (type === "tables" && document.tables) return document.tables[index]
    if (type === "body") return document.body
    return null
  }

  const renderText = (textObj: any) => {
    if (!textObj || !textObj.text) return null
    
    const formatting = textObj.formatting || {}
    const isListItem = textObj.label === "list_item"

    const content = (
      <span
        className={cn(
          formatting.bold && "font-bold",
          formatting.italic && "italic",
          formatting.underline && "underline",
          formatting.strikethrough && "line-through",
          "text-foreground/90 transition-colors"
        )}
      >
        {textObj.text}
      </span>
    )

    if (isListItem) {
      return <li className="mb-0.5 leading-relaxed">{content}</li>
    }

    // Default to paragraph-like behavior
    return <p className="mb-2 leading-relaxed whitespace-pre-wrap">{content}</p>
  }

  const renderTable = (tableObj: any) => {
    if (!tableObj || !tableObj.data || !tableObj.data.grid) return null
    const grid = tableObj.data.grid

    return (
      <div className="my-4 overflow-x-auto rounded-xl border border-border shadow-sm bg-card/50 backdrop-blur-sm">
        <Table>
          <TableBody>
            {grid.map((row: any[], rowIdx: number) => (
              <TableRow key={rowIdx} className="border-b border-border/50 last:border-0 hover:bg-primary/[0.01]">
                {row.map((cell: any, colIdx: number) => (
                  <TableCell 
                    key={colIdx} 
                    className={cn(
                      "p-3 align-top border-r border-border/30 last:border-0",
                      cell.column_header && "bg-muted/30 font-bold text-foreground"
                    )}
                    colSpan={cell.col_span || 1}
                    rowSpan={cell.row_span || 1}
                  >
                    {cell.text}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  const renderGroup = (groupObj: any, index?: number): React.ReactNode => {
    if (!groupObj || !groupObj.children) return null

    const children = groupObj.children.map((child: any, idx: number) => {
      const resolved = resolveRef(child.$ref)
      return <React.Fragment key={idx}>{renderElement(resolved, child.$ref)}</React.Fragment>
    })

    if (groupObj.label === "list") {
      return <ul className="list-disc ml-6 mb-4 space-y-0.5 marker:text-primary/40">{children}</ul>
    }

    // Treat non-list groups as semantic sections or pages
    return (
      <div className="space-y-1 relative group/page">
        {index !== undefined && (
          <div className="flex items-center gap-4 my-6 opacity-30 group-hover/page:opacity-100 transition-opacity py-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground whitespace-nowrap">
              Page {index}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
        )}
        <div className="space-y-1">{children}</div>
      </div>
    )
  }

  const renderElement = (element: any, ref?: string): React.ReactNode => {
    if (!element) return null

    // Distinguish by structure/labels
    if (element.text !== undefined) {
      return renderText(element)
    }

    if (element.data && element.data.grid) {
      return renderTable(element)
    }

    if (element.children) {
      const index = ref?.includes("/groups/") ? parseInt(ref.split("/").pop() || "", 10) : undefined
      return renderGroup(element, index)
    }

    return null
  }

  return (
    <div className={cn("prose prose-slate dark:prose-invert max-w-none font-sans antialiased", className)}>
      {document.body?.children?.map((child: any, idx: number) => {
        const resolved = resolveRef(child.$ref)
        return <React.Fragment key={idx}>{renderElement(resolved, child.$ref)}</React.Fragment>
      })}
    </div>
  )
}
