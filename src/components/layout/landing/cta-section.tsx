"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 md:py-32 bg-[#020617] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_70%)] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="bg-gradient-to-br from-indigo-600 to-fuchsia-600 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Sparkles className="h-64 w-64 text-white" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-8 relative z-10">
            Ready to automate your <br className="hidden md:block" /> document operations?
          </h2>
          <p className="text-xl text-indigo-100 font-medium mb-12 max-w-2xl mx-auto relative z-10">
            Join 500+ enterprises using DocuPoint to transform unstructured data into actionable intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-16 px-10 bg-white text-indigo-600 hover:bg-indigo-50 font-black rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group/btn">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 px-10 border-white/20 bg-white/10 text-white hover:bg-white/20 font-black rounded-2xl backdrop-blur-md">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
