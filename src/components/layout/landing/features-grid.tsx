"use client"

import * as React from "react"
import { 
  FileSearch, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  Brain, 
  Boxes, 
  Sparkles, 
  Layers, 
  Database, 
  Lock, 
  MessageSquare, 
  Layout, 
  FileCode, 
  History, 
  Braces,
  PieChart,
  CloudUpload,
  Globe
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const features = [
  {
    title: "Document Hub 2.0",
    description: "Universal drag-and-drop ingestion for PDF, Images, XLSX, and DOCX. Real-time telemetry tracks every byte from extraction to indexing.",
    icon: <CloudUpload className="h-6 w-6" />,
    gradient: "from-indigo-500 to-violet-600",
    shadow: "shadow-indigo-500/20",
    size: "large",
    tags: ["Multimodal", "S3 Native"]
  },
  {
    title: "Semantic RAG Chat",
    description: "Interactive AI dialogues grounded in your verified data. Table-aware intelligence enables deep querying of complex spreadsheets.",
    icon: <MessageSquare className="h-6 w-6" />,
    gradient: "from-fuchsia-500 to-pink-600",
    shadow: "shadow-fuchsia-500/20",
    size: "small",
    tags: ["LLM", "Contextual"]
  },
  {
    title: "Template Architect",
    description: "Pro-grade editor with semantic variable injection. Define {{placeholders}} and let AI generate high-fidelity reports instantly.",
    icon: <Layout className="h-6 w-6" />,
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/20",
    size: "small",
    tags: ["Rich Text", "Injection"]
  },
  {
    title: "Dynamic Versioning",
    description: "Full lifecycle traceability. Revert to previous document states or template iterations with a single click. Zero data loss.",
    icon: <History className="h-6 w-6" />,
    gradient: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/20",
    size: "small",
    tags: ["Audit", "V4 Stable"]
  },
  {
    title: "Multimodal OCR",
    description: "Proprietary Gemini-backed vision engine. Translates unstructured layouts into semantic markdown with 99.9% accuracy.",
    icon: <Brain className="h-6 w-6" />,
    gradient: "from-blue-500 to-cyan-600",
    shadow: "shadow-blue-500/20",
    size: "small",
    tags: ["Vision", "GPT-Ready"]
  },
  {
    title: "Governance Console",
    description: "Enterprise RBAC with granular permissions. Multi-tenant architecture ensures complete isolation of organizational assets.",
    icon: <ShieldCheck className="h-6 w-6" />,
    gradient: "from-rose-500 to-red-600",
    shadow: "shadow-rose-500/20",
    size: "large",
    tags: ["RBAC", "Security"]
  }
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 md:py-32 bg-[#020617] relative overflow-hidden border-y border-white/5">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-fuchsia-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-4xl mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-[1px] w-12 bg-indigo-500" />
            <span className="text-indigo-400 font-black text-xs uppercase tracking-[0.4em]">Core Technology</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] mb-12">
            The standard for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">intelligent assets.</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-3xl">
            We've engineered a unified stack that deconstructs unstructured files into actionable intelligence using the world's most advanced vision models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className={cn(
                "group relative p-px rounded-[2rem] overflow-hidden transition-all duration-700 hover:scale-[1.01] hover:-translate-y-1",
                feature.size === "large" ? "md:col-span-3" : "md:col-span-2"
              )}
            >
              {/* Gradient Border Effect */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-100 transition-opacity duration-700",
                feature.gradient
              )} />
              
              <div className="relative bg-[#0b1220]/90 backdrop-blur-3xl rounded-[calc(2rem-1px)] p-10 md:p-12 h-full flex flex-col border border-white/5">
                <div className="flex justify-between items-start mb-10">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 bg-gradient-to-br",
                    feature.gradient,
                    feature.shadow
                  )}>
                    {feature.icon}
                  </div>
                  <div className="flex gap-2">
                    {feature.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-black text-white/30 uppercase tracking-widest border border-white/10 px-2 py-1 rounded-md group-hover:border-white/20 transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <h4 className="text-2xl font-black mb-4 tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r transition-all duration-700 group-hover:from-white group-hover:to-slate-400">
                  {feature.title}
                </h4>
                
                <p className="text-slate-400 text-base leading-relaxed font-medium mb-12 flex-1">
                  {feature.description}
                </p>
                
                <div className="flex items-center text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] gap-2 group-hover:gap-4 transition-all duration-300">
                  <span>Explore Logic</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Injection Visualizer (Micro-feature) */}
        <div className="mt-32 p-12 rounded-[3rem] bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent border border-indigo-500/20 backdrop-blur-sm relative group overflow-hidden">
           <div className="absolute top-0 right-0 p-20 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <Braces className="h-64 w-64 text-indigo-500" />
           </div>
           
           <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                 <Badge className="bg-indigo-500/20 text-indigo-400 border-none font-black text-[10px] tracking-widest h-6 px-3">SMART INJECTION</Badge>
                 <h3 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight">Zero-friction <br /> document generation.</h3>
                 <p className="text-slate-400 text-lg font-medium leading-relaxed">
                   Our injection engine maps extracted metadata directly into your custom templates. Build a report once, generate a thousand variants automatically.
                 </p>
                 <div className="flex flex-wrap gap-3">
                    {["{{client_name}}", "{{audit_score}}", "{{risk_factor}}", "{{compliance_date}}"].map(v => (
                      <div key={v} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-indigo-400 font-mono text-xs font-bold">
                        {v}
                      </div>
                    ))}
                 </div>
              </div>
              <div className="bg-[#020617] rounded-2xl border border-white/10 shadow-2xl p-8 relative overflow-hidden">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-rose-500/20" />
                       <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                       <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                    </div>
                    <span className="text-[10px] font-bold text-white/20 tracking-widest uppercase">Live Synthesis Engine</span>
                 </div>
                 <div className="space-y-4">
                    <div className="h-4 w-3/4 bg-white/5 rounded-full animate-pulse" />
                    <div className="h-4 w-full bg-white/5 rounded-full animate-pulse delay-75" />
                    <div className="h-4 w-1/2 bg-white/5 rounded-full animate-pulse delay-150" />
                    <div className="h-4 w-5/6 bg-indigo-500/20 rounded-full animate-pulse delay-300" />
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent pointer-events-none" />
              </div>
           </div>
        </div>
      </div>
    </section>
  )
}
