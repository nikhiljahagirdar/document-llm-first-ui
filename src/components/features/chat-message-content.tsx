"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { cn } from "@/lib/utils"

interface ChatMessageContentProps {
  content: string
  role: "user" | "ai"
}

export function ChatMessageContent({ content, role }: ChatMessageContentProps) {
  const [tableTheme, setTableTheme] = React.useState<"indigo" | "emerald" | "rose" | "amber" | "sky">("indigo")

  const themeClasses = {
    indigo: "prose-th:bg-indigo-600/10 prose-th:text-indigo-600 prose-strong:text-indigo-400",
    emerald: "prose-th:bg-emerald-600/10 prose-th:text-emerald-600 prose-strong:text-emerald-400",
    rose: "prose-th:bg-rose-600/10 prose-th:text-rose-600 prose-strong:text-rose-400",
    amber: "prose-th:bg-amber-600/10 prose-th:text-amber-600 prose-strong:text-amber-400",
    sky: "prose-th:bg-sky-600/10 prose-th:text-sky-600 prose-strong:text-sky-400",
  }

  return (
    <div className="relative group/content">
      {role === "ai" && content.includes("<table") && (
        <div className="absolute -right-2 -top-2 flex gap-1 opacity-0 group-hover/content:opacity-100 transition-opacity z-20">
          {(["indigo", "emerald", "rose", "amber", "sky"] as const).map((t) => (
            <button 
              key={t}
              onClick={() => setTableTheme(t)}
              className={cn(
                "h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm",
                t === "indigo" && "bg-indigo-500",
                t === "emerald" && "bg-emerald-500",
                t === "rose" && "bg-rose-500",
                t === "amber" && "bg-amber-500",
                t === "sky" && "bg-sky-500"
              )}
            />
          ))}
        </div>
      )}
      <div className={cn(
        "prose prose-sm max-w-none dark:prose-invert",
        "prose-headings:font-black prose-headings:tracking-tight prose-headings:uppercase prose-headings:text-[10px] prose-headings:text-indigo-400 prose-headings:mb-2 prose-headings:mt-4",
        "prose-p:leading-relaxed prose-p:font-medium prose-p:text-inherit",
        "prose-strong:font-black",
        "prose-table:border-collapse prose-table:w-full prose-table:my-4 prose-table:rounded-xl prose-table:overflow-hidden prose-table:border prose-table:border-white/10",
        "prose-th:px-4 prose-th:py-2 prose-th:text-[10px] prose-th:font-black prose-th:uppercase prose-th:tracking-widest prose-th:border-b prose-th:border-white/10",
        "prose-td:px-4 prose-td:py-2 prose-td:text-xs prose-td:font-bold prose-td:border-b prose-td:border-white/5",
        themeClasses[tableTheme],
        role === "ai" ? "text-[#111b21] dark:text-[#e9edef]" : "text-[#111b21] dark:text-[#e9edef]"
      )}>
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
