"use client"

import * as React from "react"
import Link from "next/link"
import { FileText, Mail, ArrowUpRight, Globe, MessageSquare, Send } from "lucide-react"

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Enterprise", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-[#020617] pt-32 pb-16 px-6 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12 mb-24">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg text-white group-hover:scale-110 transition-transform duration-500">
                <FileText className="h-6 w-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">DocuPoint</span>
            </Link>
            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10 max-w-sm">
              The intelligent infrastructure for modern document operations. 
              Built for speed, accuracy, and scale.
            </p>
            <div className="flex items-center gap-6">
              {[MessageSquare, Globe, Send, Mail].map((Icon, i) => (
                <Link 
                  key={i} 
                  href="#" 
                  className="text-slate-500 hover:text-white transition-all duration-300 hover:scale-110"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
          
          {footerLinks.map((column) => (
            <div key={column.title} className="col-span-1">
              <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">{column.title}</h4>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="text-slate-500 hover:text-indigo-400 font-medium text-sm transition-all duration-300 flex items-center group/link"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} DocuPoint AI. All rights reserved.
          </p>
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Global Platform
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
