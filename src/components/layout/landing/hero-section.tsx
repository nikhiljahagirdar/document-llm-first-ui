"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, ChevronRight, Zap, ShieldCheck, FileText, Globe, MousePointer2, Star } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 overflow-hidden bg-[#020617] flex flex-col justify-center min-h-[85vh]">
      {/* Dynamic Background with Mesh Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(79,70,229,0.15),transparent_70%)]" />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[120px]" />
        
        {/* Animated Grid with Perspective */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10 w-full px-6">
        {/* Modern Badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs font-bold mb-10 animate-in fade-in slide-in-from-top-8 duration-1000 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span className="text-slate-300 tracking-wide uppercase">Advanced Document Intelligence</span>
        </div>
        
        {/* Elite Title */}
        <h1 className="text-5xl sm:text-7xl md:text-9xl font-extrabold tracking-tighter mb-8 leading-[0.9] text-white animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
          The <span className="relative">
            Intelligent
            <svg className="absolute -bottom-2 left-0 w-full h-3 text-indigo-500/30 -z-10" viewBox="0 0 100 12" preserveAspectRatio="none">
              <path d="M0,10 Q50,0 100,10" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span> <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-indigo-400 bg-[length:200%_auto] animate-gradient">Layer for Docs.</span>
        </h1>
        
        {/* High-Contrast Description */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          Capture, classify, and query unstructured data with human-level precision. 
          Built for teams that demand absolute accuracy.
        </p>
        
        {/* Action Stack */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 animate-in fade-in slide-in-from-bottom-14 duration-1000 delay-500">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-sm font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-500/40 transition-all duration-300 hover:scale-105 active:scale-95 group">
              Start Building Free
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-sm font-bold rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-xl">
              Book a Strategy Call
            </Button>
          </Link>
        </div>

        {/* Social Proof / Trusted By */}
        <div className="pt-12 border-t border-white/5 animate-in fade-in duration-1000 delay-700">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-8">Empowering Modern Enterprises</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {['Acme Corp', 'Global Logistics', 'Fintech Pro', 'HealthStack', 'CloudScale'].map((brand) => (
              <span key={brand} className="text-xl md:text-2xl font-black tracking-tighter text-slate-400">{brand}</span>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 8s linear infinite;
        }
      `}</style>
    </section>
  )
}
