"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import * as Types from "@/types/api"

interface InvoiceRowProps {
  invoice: Types.InvoiceResponse
}

export const InvoiceRow = React.memo(function InvoiceRow({ invoice }: InvoiceRowProps) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
      <td className="px-10 py-6 font-mono font-bold text-indigo-600 dark:text-indigo-400">#{invoice.invoice_id.slice(0, 8)}</td>
      <td className="px-8 py-6">
        <Badge className={cn("font-semibold tracking-normal text-xs px-3 h-6 border-none shadow-sm", invoice.status === "paid" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400")}>
          {invoice.status}
        </Badge>
      </td>
      <td className="px-8 py-6 font-semibold text-card-foreground">${invoice.amount} <span className="text-slate-400 opacity-50 font-bold ml-1">{invoice.currency}</span></td>
      <td className="px-8 py-6 text-slate-500 dark:text-slate-400 font-bold">{formatDate(invoice.created_on)}</td>
      <td className="px-10 py-6 text-right">
        {invoice.hosted_invoice_url ? (
          <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="gap-2 h-10 rounded-md font-semibold tracking-normal text-xs hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
              Download <ArrowUpRight className="h-3 w-3" />
            </Button>
          </a>
        ) : (
          <span className="text-slate-300 font-semibold text-xs tracking-normal">Locked</span>
        )}
      </td>
    </tr>
  )
})
