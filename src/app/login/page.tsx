"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { Loader2 } from "lucide-react"

export default function ModernLoginPage() {
  const { login, isLoading, error, isHydrated, isAuthenticated } = useAuthStore()
  const router = useRouter()

  React.useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isHydrated, isAuthenticated, router])

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const username = (formData.get("username") as string || "").trim()
      const password = (formData.get("password") as string || "").trim()

      try {
        await login(username, password)
      } catch (err) {
        // Error is handled in the store
      }
    },
    [login]
  )

  return (
    <main className="min-h-screen overflow-hidden bg-[#070B1A] relative text-white flex items-center justify-center px-6 py-10">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] rounded-full bg-[#8B5CF6]/30 blur-[120px]" />
        <div className="absolute bottom-[-150px] right-[-100px] w-[450px] h-[450px] rounded-full bg-[#00C6FF]/20 blur-[140px]" />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-[#F72585]/20 blur-[120px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl grid lg:grid-cols-2 rounded-[40px] overflow-hidden border border-white/[0.08] bg-white/[0.04] backdrop-blur-3xl shadow-[0_25px_120px_rgba(139,92,246,0.25)]">
        {/* Left Side */}
        <div className="relative hidden lg:flex flex-col justify-between p-16 overflow-hidden bg-gradient-to-br from-[#7B2FF7]/20 via-[#A855F7]/10 to-[#00C6FF]/10 border-r border-white/[0.08]">
          <div>
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition">
                <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-[#7B2FF7] via-[#D946EF] to-[#00C6FF] flex items-center justify-center text-2xl font-black shadow-2xl shadow-violet-500/40 text-white animate-pulse">
                  D
                </div>

                <div>
                  <h1 className="text-3xl font-black">DocuFlow AI</h1>
                  <p className="text-gray-400 mt-1">
                    Intelligent RAG Document Automation
                  </p>
                </div>
              </Link>
            </div>

            <div className="mt-24 max-w-xl">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300 text-sm backdrop-blur-xl mb-8">
                ✨ Enterprise AI Workspace
              </div>

              <h2 className="text-6xl font-black leading-[1.05] tracking-tight">
                Build.
                <br />
                Generate.
                <br />
                <span className="bg-gradient-to-r from-[#FF4FD8] via-[#A855F7] to-[#38BDF8] bg-clip-text text-transparent">
                  Automate.
                </span>
              </h2>

              <p className="mt-8 text-xl text-gray-300 leading-relaxed">
                AI-powered RAG templates and enterprise workflows designed to generate accurate documents instantly.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5 mt-16 mb-44">
            {[
              ['10K+', 'Documents'],
              ['98.7%', 'Accuracy'],
              ['500+', 'Templates'],
            ].map(([number, label]) => (
              <div
                key={label}
                className="rounded-3xl border border-white/[0.08] bg-white/[0.06] backdrop-blur-xl p-6"
              >
                <h3 className="text-3xl font-black bg-gradient-to-r from-[#FF4FD8] to-[#38BDF8] bg-clip-text text-transparent">
                  {number}
                </h3>
                <p className="mt-2 text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Floating UI Card */}
          <div className="absolute bottom-8 right-8 w-[280px] hidden xl:block rounded-[28px] border border-white/[0.08] bg-white/[0.08] backdrop-blur-2xl p-5 shadow-2xl shadow-violet-500/20">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm text-gray-400">AI Processing</p>
                <h4 className="font-bold text-lg mt-1">Document Workflow</h4>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7B2FF7] to-[#00C6FF] flex items-center justify-center text-xl">
                ⚡
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">AI Completion</span>
                  <span>96%</span>
                </div>

                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className="w-[96%] h-full rounded-full bg-gradient-to-r from-[#FF4FD8] to-[#38BDF8]" />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-sm text-gray-300">
                  Secure RAG Engine Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Login */}
        <div className="relative flex items-center justify-center p-8 md:p-14">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-4 mb-10 justify-center">
              <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition text-white">
                <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-[#7B2FF7] via-[#D946EF] to-[#00C6FF] flex items-center justify-center text-2xl font-black shadow-2xl shadow-violet-500/40 text-white">
                  D
                </div>

                <div>
                  <h1 className="text-3xl font-black">DocuFlow AI</h1>
                  <p className="text-gray-400 text-sm">
                    Enterprise AI Platform
                  </p>
                </div>
              </Link>
            </div>

            <div className="rounded-[36px] border border-white/[0.08] bg-white/[0.06] backdrop-blur-2xl p-8 md:p-10 shadow-2xl shadow-violet-500/10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-gradient-to-br from-[#7B2FF7] via-[#D946EF] to-[#00C6FF] shadow-2xl shadow-violet-500/30 text-4xl mb-6">
                  🔐
                </div>

                <h2 className="text-4xl font-black tracking-tight">
                  Welcome Back
                </h2>

                <p className="mt-4 text-gray-400 text-lg leading-relaxed">
                  Access your AI document workspace and continue building enterprise workflows.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10">
                <button type="button" className="flex items-center justify-center gap-3 py-4 rounded-2xl border border-white/[0.08] bg-white/[0.05] hover:bg-white/[0.08] transition-all font-medium cursor-pointer">
                  <span className="text-xl">G</span>
                  Google
                </button>

                <button type="button" className="flex items-center justify-center gap-3 py-4 rounded-2xl border border-white/[0.08] bg-white/[0.05] hover:bg-white/[0.08] transition-all font-medium cursor-pointer">
                  <span className="text-xl">⌘</span>
                  GitHub
                </button>
              </div>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]" />
                </div>

                <div className="relative flex justify-center text-sm uppercase">
                  <span className="bg-[#0E1325] px-4 text-gray-500 tracking-wider">
                    Or continue with
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 text-red-300 text-sm font-semibold border border-red-500/20 animate-pulse">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="username" className="block text-sm text-gray-400 mb-3 ml-1">
                    Email Address
                  </label>

                  <div className="relative">
                    <input
                      type="email"
                      id="username"
                      name="username"
                      required
                      placeholder="you@company.com"
                      className="w-full h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] px-5 outline-none focus:border-violet-400/40 focus:ring-4 focus:ring-violet-500/10 transition-all text-lg placeholder:text-gray-500 text-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <label htmlFor="password" className="block text-sm text-gray-400">
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-sm text-violet-300 hover:text-violet-200 transition"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    placeholder="Enter your password"
                    className="w-full h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] px-5 outline-none focus:border-violet-400/40 focus:ring-4 focus:ring-violet-500/10 transition-all text-lg placeholder:text-gray-500 text-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-3 text-gray-400 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-white/10 bg-white/5"
                    />
                    Remember me
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-16 rounded-2xl bg-gradient-to-r from-[#7B2FF7] via-[#D946EF] to-[#00C6FF] font-bold text-lg shadow-2xl shadow-violet-500/30 hover:scale-[1.02] transition-transform flex items-center justify-center cursor-pointer text-white"
                >
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  ) : (
                    "Sign In to Workspace"
                  )}
                </button>
              </form>

              <div className="mt-10 text-center text-gray-400">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-violet-300 hover:text-violet-200 font-semibold transition">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
