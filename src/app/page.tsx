"use client"

import * as React from "react"
import { useAuthStore } from "@/lib/store"
import { Navbar } from "@/components/layout/landing/navbar"
import { HeroSection } from "@/components/layout/landing/hero-section"
import { FeaturesGrid } from "@/components/layout/landing/features-grid"
import { InteractiveShowcase } from "@/components/layout/landing/interactive-showcase"
import { PricingSection } from "@/components/layout/landing/pricing-section"
import { CTASection } from "@/components/layout/landing/cta-section"
import { Footer } from "@/components/layout/landing/footer"

export default function HomePage() {
  const { isAuthenticated, isHydrated } = useAuthStore()

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      <Navbar isHydrated={isHydrated} isAuthenticated={isAuthenticated} />
      <HeroSection />
      <FeaturesGrid />
      <InteractiveShowcase />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  )
}
