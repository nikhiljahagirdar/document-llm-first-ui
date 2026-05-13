"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, ArrowRight, Menu, X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavbarProps {
  isHydrated: boolean
  isAuthenticated: boolean
}

export const Navbar = React.memo(function Navbar({ isHydrated, isAuthenticated }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "#features", label: "Capabilities" },
    { href: "#pricing", label: "Pricing" },
    { href: "#", label: "Enterprise" },
    { href: "#", label: "Docs" },
  ]

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-500",
      scrolled 
        ? "bg-white/70 dark:bg-[#020617]/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 py-3 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.1)]" 
        : "bg-transparent border-b border-transparent py-6"
    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-indigo-600 p-2 rounded-xl shadow-lg text-white transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <span className="font-extrabold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">
            DocuPoint
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.label}
                href={link.href} 
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all duration-300 relative group/link"
              >
                {link.label}
                <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-indigo-500 scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            ))}
          </div>
          
          <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-2" />

          {isHydrated && (
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold px-6 h-10 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
                    Console
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white rounded-full px-5">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 h-10 shadow-lg shadow-indigo-500/25 group/btn transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                      Start Free
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-[#020617] border-b border-slate-200 dark:border-white/5 p-6 flex flex-col gap-8 animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-3xl">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link 
                key={link.label}
                href={link.href} 
                onClick={() => setIsOpen(false)} 
                className="text-lg font-bold text-slate-900 dark:text-white p-2 hover:text-indigo-500 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full h-12 rounded-2xl border-2 font-bold">Sign In</Button>
            </Link>
            <Link href="/register" onClick={() => setIsOpen(false)}>
              <Button className="w-full h-12 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
})
