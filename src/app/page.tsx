import { Metadata } from 'next'
import { api } from '@/lib/api'

export const metadata: Metadata = {
  title: 'DocuFlow AI - Enterprise RAG & AI Document Automation Platform',
  description: 'Automate enterprise document generation with intelligent RAG workflows, smart industry-ready templates, and secure AI data injection. Try DocuFlow AI for free.',
  keywords: [
    'AI document generator',
    'RAG document automation',
    'enterprise document AI',
    'automated contract generation',
    'smart templates automation',
    'legal tech AI',
    'finance document automation',
    'secure AI document generation',
    'DocuFlow AI'
  ],
  openGraph: {
    title: 'DocuFlow AI - Enterprise RAG & AI Document Automation',
    description: 'Automate enterprise document generation with intelligent RAG workflows, smart industry-ready templates, and secure AI data injection.',
    url: 'https://docuflow.ai',
    siteName: 'DocuFlow AI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://docuflow.ai/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DocuFlow AI - Enterprise Document Automation',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DocuFlow AI - Enterprise RAG & AI Document Automation',
    description: 'Automate enterprise document generation with intelligent RAG workflows, smart industry-ready templates, and secure AI data injection.',
    images: ['https://docuflow.ai/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function LandingPage() {
  const defaultPlans = [
    {
      name: 'Starter',
      price: '$29',
      featured: false,
      features: ['50 AI Documents', 'Basic RAG', '5 Templates'],
    },
    {
      name: 'Growth',
      price: '$99',
      featured: true,
      features: ['Unlimited Docs', 'Advanced RAG', 'API Integrations'],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      featured: false,
      features: ['Dedicated Infra', 'SSO & Security', 'Priority Support'],
    },
  ]

  const defaultIndustries = [
    {
      title: 'Legal Services',
      icon: '⚖️',
      desc: 'NDAs, agreements, policies, compliance docs',
      color: 'from-violet-500 to-fuchsia-500',
    },
    {
      title: 'Finance',
      icon: '🏦',
      desc: 'KYC forms, audits, onboarding workflows',
      color: 'from-emerald-400 to-teal-500',
    },
    {
      title: 'Healthcare',
      icon: '❤️',
      desc: 'Clinical reports and patient documentation',
      color: 'from-pink-400 to-rose-500',
    },
    {
      title: 'Enterprise SaaS',
      icon: '💻',
      desc: 'Contracts, onboarding, automation workflows',
      color: 'from-sky-400 to-blue-500',
    },
  ]

  let apiPlans: any[] = []
  let apiIndustries: any[] = []

  try {
    apiPlans = await api.getPlans()
  } catch (error) {
    console.error('Failed to fetch pricing plans from API:', error)
  }

  try {
    apiIndustries = await api.getIndustries()
  } catch (error) {
    console.error('Failed to fetch industries from API:', error)
  }

  const gradientColors = [
    'from-violet-500 to-fuchsia-500',
    'from-emerald-400 to-teal-500',
    'from-pink-400 to-rose-500',
    'from-sky-400 to-blue-500',
    'from-amber-400 to-orange-500',
    'from-indigo-400 to-violet-500',
  ]

  const plans = (apiPlans && apiPlans.length > 0)
    ? apiPlans.map((plan) => {
        const hasPrice = typeof plan.price === 'number'
        const rawFeatures = plan.limits
          ? Object.entries(plan.limits).map(([key, val]) => {
              const cleanKey = key.replace(/_/g, ' ')
              const cleanVal = val === null || val === -1 ? 'Unlimited' : val
              return `${cleanVal} ${cleanKey}`
            })
          : []
        
        return {
          name: plan.name,
          price: !hasPrice || plan.price === 0
            ? 'Free'
            : plan.price > 1000
              ? 'Custom'
              : `$${plan.price}`,
          featured: plan.price > 50 && plan.price < 500,
          features: rawFeatures.length > 0
            ? rawFeatures
            : ['AI Document Generation', 'RAG Retrieval', 'Standard Templates'],
        }
      })
    : defaultPlans

  const industries = (apiIndustries && apiIndustries.length > 0)
    ? apiIndustries.map((ind, index) => ({
        title: ind.name,
        icon: ind.icon || '📂',
        desc: ind.description || 'Custom industry templates and AI automation workflows.',
        color: gradientColors[index % gradientColors.length],
      }))
    : defaultIndustries

  const steps = [
    {
      title: 'Choose Template',
      desc: 'Pick from industry-ready intelligent templates.',
      icon: '📂',
    },
    {
      title: 'Inject Data',
      desc: 'Connect APIs, CRM data, or upload files.',
      icon: '⚡',
    },
    {
      title: 'AI + RAG Processing',
      desc: 'Generate contextual and accurate documents instantly.',
      icon: '✨',
    },
    {
      title: 'Review & Export',
      desc: 'Download in PDF, DOCX, or sync to workflows.',
      icon: '📄',
    },
  ]

  return (
    <main className="min-h-screen bg-[#070B1A] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.25),transparent_30%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.20),transparent_35%)]" />

      <div className="relative z-10">
        <header className="border-b border-white/[0.08] backdrop-blur-xl bg-white/[0.06] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7B2FF7] via-[#A855F7] to-[#00C6FF] flex items-center justify-center text-xl font-bold shadow-2xl shadow-violet-500/40">
                D
              </div>
              <div>
                <span className="block font-bold text-2xl">DocuFlow AI</span>
                <p className="text-xs text-gray-400">Enterprise RAG Automation</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm text-gray-300">
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#industries" className="hover:text-white transition">Industries</a>
              <a href="#workflow" className="hover:text-white transition">Workflow</a>
              <a href="#pricing" className="hover:text-white transition">Pricing</a>
            </nav>

            <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#7B2FF7] via-[#A855F7] to-[#00C6FF] font-semibold shadow-lg shadow-violet-500/30 hover:scale-105 transition-transform">
              Book Demo
            </button>
          </div>
        </header>

        <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-violet-400/30 bg-violet-500/10 text-violet-300 text-sm mb-8 backdrop-blur-xl">
                ✨ AI Powered Document Generation
              </div>

              <h1 className="text-6xl md:text-7xl font-black leading-tight tracking-tight">
                Create.
                <br />
                Complete.
                <br />
                <span className="bg-gradient-to-r from-[#FF4FD8] via-[#A855F7] to-[#38BDF8] bg-clip-text text-transparent">
                  Automate.
                </span>
              </h1>

              <p className="mt-8 text-xl text-gray-300 leading-relaxed max-w-xl">
                Industry-specific RAG templates + intelligent AI data injection
                to generate enterprise-grade documents in minutes.
              </p>

              <div className="flex flex-wrap gap-5 mt-10">
                <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] font-semibold text-lg shadow-2xl shadow-fuchsia-500/30 hover:scale-105 transition-transform">
                  Start Free Trial
                </button>

                <button className="px-8 py-4 rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-xl font-semibold text-lg hover:bg-white/10 transition">
                  Explore Templates
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12">
                {[
                  '500+ Smart Templates',
                  'AI Data Injection',
                  'Enterprise Security',
                  'Workflow Automation',
                  'Live API Sync',
                  'RAG Knowledge Engine',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.06] backdrop-blur-xl p-4 text-sm text-gray-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-20 -left-10 w-72 h-72 bg-fuchsia-500/30 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/30 rounded-full blur-[100px]" />

              <div className="relative rounded-[36px] border border-white/[0.08] bg-white/10 backdrop-blur-2xl p-6 shadow-[0_20px_80px_rgba(139,92,246,0.35)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-400">AI Generated Document</p>
                    <h3 className="text-2xl font-bold mt-1">Non-Disclosure Agreement</h3>
                  </div>

                  <div className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-sm border border-emerald-400/20">
                    Completed
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-5">
                  <div className="col-span-2 rounded-3xl bg-white text-black p-6 min-h-[420px]">
                    <div className="space-y-4">
                      <div className="h-4 rounded-full bg-gray-200 w-1/2" />
                      <div className="h-3 rounded-full bg-gray-100 w-full" />
                      <div className="h-3 rounded-full bg-gray-100 w-5/6" />
                      <div className="h-3 rounded-full bg-gray-100 w-4/6" />
                    </div>

                    <div className="mt-10 space-y-4">
                      <div className="h-5 rounded-full bg-violet-200 w-1/3" />
                      <div className="h-3 rounded-full bg-gray-100 w-full" />
                      <div className="h-3 rounded-full bg-gray-100 w-full" />
                      <div className="h-3 rounded-full bg-gray-100 w-5/6" />
                    </div>

                    <div className="mt-10 space-y-4">
                      <div className="h-5 rounded-full bg-fuchsia-200 w-1/4" />
                      <div className="h-3 rounded-full bg-gray-100 w-full" />
                      <div className="h-3 rounded-full bg-gray-100 w-4/6" />
                    </div>
                  </div>

                  <div className="rounded-3xl bg-gradient-to-b from-violet-500/20 to-fuchsia-500/20 border border-white/[0.08] p-5 backdrop-blur-xl">
                    <h4 className="font-semibold text-lg mb-5">Injected Data</h4>

                    <div className="space-y-5 text-sm">
                      <div>
                        <p className="text-gray-400">Company</p>
                        <p className="font-medium mt-1">Acme Corporation</p>
                      </div>

                      <div>
                        <p className="text-gray-400">Jurisdiction</p>
                        <p className="font-medium mt-1">Delaware, USA</p>
                      </div>

                      <div>
                        <p className="text-gray-400">Template</p>
                        <p className="font-medium mt-1">Legal NDA Workflow</p>
                      </div>

                      <div className="pt-5 border-t border-white/[0.08]">
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                          <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400" />
                        </div>
                        <p className="mt-3 text-emerald-300 text-sm">
                          96% AI completion accuracy
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-28">
          <div className="rounded-[40px] border border-white/[0.08] bg-gradient-to-r from-[#7B2FF7] via-[#F72585] to-[#00C2FF] p-[1px] shadow-2xl shadow-fuchsia-500/20">
            <div className="rounded-[40px] bg-[#0B1023] px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                ['10K+', 'Documents Generated'],
                ['500+', 'Industry Templates'],
                ['98.7%', 'AI Accuracy'],
                ['70%', 'Faster Processing'],
              ].map(([number, label]) => (
                <div key={label}>
                  <h3 className="text-5xl font-black bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                    {number}
                  </h3>
                  <p className="mt-3 text-gray-300">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="industries" className="max-w-7xl mx-auto px-6 pb-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex px-5 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] text-violet-300 text-sm backdrop-blur-xl">
              INDUSTRY READY
            </div>

            <h2 className="mt-8 text-5xl font-black">
              Built for Every
              <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                {' '}Enterprise Workflow
              </span>
            </h2>

            <p className="mt-6 text-xl text-gray-400 leading-relaxed">
              Reusable AI-powered templates designed for compliance-heavy and data-driven industries.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
            {industries.map((industry) => (
              <div
                key={industry.title}
                className="group rounded-[32px] border border-white/[0.08] bg-white/[0.06] p-8 backdrop-blur-xl hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/20"
              >
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${industry.color} flex items-center justify-center text-4xl shadow-xl`}>
                  {industry.icon}
                </div>

                <h3 className="mt-8 text-2xl font-bold">{industry.title}</h3>

                <p className="mt-4 text-gray-400 leading-relaxed">
                  {industry.desc}
                </p>

                <button className="mt-8 text-fuchsia-400 font-semibold group-hover:translate-x-2 transition-transform">
                  View Templates →
                </button>
              </div>
            ))}
          </div>
        </section>

        <section id="workflow" className="max-w-7xl mx-auto px-6 pb-32">
          <div className="rounded-[40px] border border-white/[0.08] bg-white/[0.06] backdrop-blur-2xl p-12">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-5xl font-black">
                From Template to
                <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  {' '}Completed Document
                </span>
              </h2>

              <p className="mt-6 text-xl text-gray-400">
                Intelligent AI workflows built for enterprise-grade document generation.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 mt-20">
              {steps.map((step, index) => (
                <div key={step.title} className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-500 flex items-center justify-center text-5xl shadow-2xl shadow-violet-500/20 mx-auto">
                    {step.icon}
                  </div>

                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-black border border-white/[0.08] text-sm text-gray-300">
                    {index + 1}
                  </div>

                  <h3 className="mt-8 text-2xl font-bold text-center">
                    {step.title}
                  </h3>

                  <p className="mt-4 text-gray-400 text-center leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="max-w-7xl mx-auto px-6 pb-32">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-5xl font-black">
              Flexible Pricing for
              <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                {' '}Growing Teams
              </span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mt-20">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[36px] p-[1px] ${
                  plan.featured
                    ? 'bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-500 scale-105'
                    : 'bg-white/10'
                }`}
              >
                <div className="rounded-[36px] bg-[#0C1124] p-10 h-full">
                  {plan.featured && (
                    <div className="inline-flex px-4 py-2 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/20 text-fuchsia-300 text-sm mb-6">
                      Most Popular
                    </div>
                  )}

                  <h3 className="text-3xl font-bold">{plan.name}</h3>

                  <div className="mt-6 text-6xl font-black">
                    {plan.price}
                    {plan.price !== 'Custom' && plan.price !== 'Free' && (
                      <span className="text-xl text-gray-400">/mo</span>
                    )}
                  </div>

                  <div className="space-y-5 mt-10">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 text-gray-300">
                        <div className="w-2 h-2 rounded-full bg-fuchsia-400" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <button className={`w-full mt-12 py-4 rounded-2xl font-semibold text-lg transition-transform hover:scale-105 ${
                    plan.featured
                      ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-500'
                      : 'bg-white/10 border border-white/[0.08]'
                  }`}>
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="relative overflow-hidden rounded-[40px] border border-white/[0.08] bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#2563EB] p-16 shadow-2xl shadow-violet-500/30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[120px]" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="max-w-2xl">
                <h2 className="text-5xl font-black leading-tight">
                  Transform Enterprise Knowledge into Automated Documents
                </h2>

                <p className="mt-6 text-xl text-white/80 leading-relaxed">
                  Launch AI-powered workflows using reusable templates, contextual RAG retrieval, and intelligent automation.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-5">
                <button className="px-8 py-5 rounded-2xl bg-white text-black font-bold text-lg hover:scale-105 transition-transform">
                  Start Free Trial
                </button>

                <button className="px-8 py-5 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl font-bold text-lg hover:bg-white/20 transition">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
