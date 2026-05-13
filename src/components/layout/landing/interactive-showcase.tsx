"use client"

import * as React from "react"
import { 
  FileText, 
  MessageSquare, 
  Sparkles, 
  Zap, 
  Search, 
  MousePointer2, 
  Layers,
  CheckCircle2,
  Table as TableIcon
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function InteractiveShowcase() {
  return (
    <section className="py-20 md:py-32 bg-[#020617] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="space-y-6">
               <Badge className="bg-indigo-500/20 text-indigo-400 border-none font-black text-[10px] tracking-widest h-6 px-3">INTERACTIVE INTELLIGENCE</Badge>
               <h2 className="text-4xl md:text-7xl font-black text-white leading-[0.95] tracking-tighter">
                 Multimodal analysis <br /> <span className="text-slate-500">in real-time.</span>
               </h2>
               <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                 Experience the first side-by-side multimodal viewer. Ask complex questions about tables, charts, and text simultaneously.
               </p>
            </div>

            <div className="space-y-8">
               <div className="flex gap-6 group">
                  <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
                     <TableIcon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                     <h4 className="text-xl font-bold text-white mb-2">Table-Aware Logic</h4>
                     <p className="text-slate-400 font-medium">Query specific rows and columns directly. Gemini understands structural dependencies in spreadsheets and PDFs.</p>
                  </div>
               </div>

               <div className="flex gap-6 group">
                  <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-fuchsia-500/10 group-hover:border-fuchsia-500/20 transition-all">
                     <MessageSquare className="h-6 w-6 text-fuchsia-400" />
                  </div>
                  <div>
                     <h4 className="text-xl font-bold text-white mb-2">Interactive Chat Sidebar</h4>
                     <p className="text-slate-400 font-medium">No more context switching. Chat with your document while viewing the source text and images side-by-side.</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="relative group">
            {/* Mockup UI */}
            <div className="bg-[#0b1220] rounded-[2.5rem] border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 transition-transform duration-1000 group-hover:scale-[1.02]">
               <div className="h-14 border-b border-white/5 bg-white/5 flex items-center px-6 gap-3">
                  <div className="flex gap-1.5">
                     <div className="w-3 h-3 rounded-full bg-rose-500/20" />
                     <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                     <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                  </div>
                  <div className="h-6 w-px bg-white/5 mx-2" />
                  <div className="bg-white/5 rounded-md px-3 py-1 text-[10px] font-bold text-white/40 uppercase tracking-widest">Enterprise_Audit_V4.pdf</div>
               </div>
               
               <div className="grid grid-cols-5 h-[500px]">
                  <div className="col-span-3 p-8 border-r border-white/5 space-y-6">
                     <div className="h-4 w-1/3 bg-white/5 rounded-full" />
                     <div className="space-y-3 pt-4">
                        <div className="h-3 w-full bg-white/5 rounded-full" />
                        <div className="h-3 w-full bg-white/5 rounded-full" />
                        <div className="h-3 w-3/4 bg-white/5 rounded-full" />
                     </div>
                     <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-6 space-y-4">
                        <div className="flex justify-between items-center">
                           <div className="h-3 w-1/4 bg-indigo-400/20 rounded-full" />
                           <Badge className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black h-4">DETECTED</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="h-12 bg-white/5 rounded-lg" />
                           <div className="h-12 bg-white/5 rounded-lg" />
                        </div>
                     </div>
                  </div>
                  <div className="col-span-2 bg-[#020617]/50 p-6 flex flex-col">
                     <div className="flex-1 space-y-6">
                        <div className="flex gap-3">
                           <div className="h-6 w-6 rounded-full bg-white/10 shrink-0" />
                           <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none text-[11px] font-medium text-slate-400">
                             What are the payment terms in section 4.2?
                           </div>
                        </div>
                        <div className="flex gap-3">
                           <div className="h-6 w-6 rounded-full bg-indigo-500/20 shrink-0 flex items-center justify-center">
                              <Sparkles className="h-3 w-3 text-indigo-400" />
                           </div>
                           <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl rounded-tl-none space-y-3 shadow-xl">
                             <p className="text-[11px] font-bold text-indigo-300 leading-relaxed">
                               Based on section 4.2 (Page 12), the terms are Net-30 with a 2% discount if paid within 10 days.
                             </p>
                             <div className="flex items-center gap-2 pt-2 border-t border-indigo-500/10">
                                <Search className="h-2.5 w-2.5 text-indigo-400" />
                                <span className="text-[9px] font-black text-indigo-400/60 uppercase">Verified in Audit_Source.pdf</span>
                             </div>
                           </div>
                        </div>
                     </div>
                     <div className="mt-auto relative">
                        <div className="h-10 bg-white/5 rounded-xl border border-white/10 flex items-center px-4 justify-between">
                           <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Ask Gemini...</span>
                           <Zap className="h-3 w-3 text-indigo-500" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Float Elements */}
            <div className="absolute -top-12 -right-12 h-32 w-32 bg-fuchsia-600/20 blur-[60px] rounded-full animate-pulse" />
            <div className="absolute -bottom-20 -left-20 h-48 w-48 bg-indigo-600/10 blur-[80px] rounded-full animate-pulse delay-1000" />
            
            <div className="absolute top-1/4 -right-8 bg-[#0b1220] border border-white/10 rounded-2xl p-4 shadow-2xl z-20 animate-in fade-in slide-in-from-right-10 duration-1000 delay-500">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                     <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Data Integrity</p>
                     <p className="text-xs font-bold text-white tracking-tight">99.9% Extraction Confidence</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
