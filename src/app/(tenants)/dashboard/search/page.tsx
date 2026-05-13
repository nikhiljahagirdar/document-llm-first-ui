"use client"

import * as React from "react"
import { api } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search as SearchIcon, 
  Loader2, 
  Sparkles, 
  FileText, 
  ChevronRight, 
  Command, 
  Filter,
  History,
  Zap,
  Globe,
  Database
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface SearchResult {
  document_id: string
  filename: string
  status: string | null
  created_on: string | null
  industry_name?: string | null
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function SearchPage() {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [searched, setSearched] = React.useState(false)

  const handleSearch = React.useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()
      if (!query.trim()) return

      setLoading(true)
      setSearched(true)
      setResults([])

      try {
        const data = await api.getDocuments(query)
        setResults((data as unknown as SearchResult[]) || [])
      } catch (err) {
        console.error("Search failed:", err)
      } finally {
        setLoading(false)
      }
    },
    [query]
  )

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 relative">
      <div className="flex flex-col gap-6 relative z-10">
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full glass border border-primary/20 w-fit">
          <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Semantic Discovery active</span>
        </div>
        <div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-none">
            Deep <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-purple-600">Archive</span>
          </h1>
          <p className="text-muted-foreground/60 text-lg font-bold mt-4 uppercase tracking-widest text-[13px]">Scan across your entire intelligence infrastructure.</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative group z-10">
        <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none group-focus-within:bg-primary/10 transition-all duration-700" />
        <Card className="rounded-[2.5rem] border-border/40 bg-background/40 backdrop-blur-3xl shadow-2xl overflow-hidden p-2 relative border">
          <CardContent className="p-0">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1 group/input">
                <div className="absolute left-8 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-primary/5 text-primary opacity-50 group-focus-within/input:opacity-100 transition-all duration-500">
                  <SearchIcon className="h-6 w-6" />
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-24 w-full pl-20 pr-10 rounded-[2rem] border-none bg-transparent text-2xl font-black placeholder:text-muted-foreground/20 focus:outline-none transition-all text-foreground"
                  placeholder="Ask anything about your data..."
                  disabled={loading}
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-20 pointer-events-none">
                   <Command className="h-4 w-4" />
                   <span className="text-xs font-black uppercase">ENTER</span>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={loading || !query.trim()}
                className="h-24 md:h-20 my-auto mx-2 px-12 rounded-[1.8rem] bg-foreground text-background hover:bg-foreground/90 font-black tracking-widest text-[12px] uppercase shadow-2xl transition-all active:scale-95 gap-4 group/btn shrink-0"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                  <>
                    Initialize Search 
                    <div className="bg-background/20 p-2 rounded-lg group-hover/btn:translate-x-1 transition-transform">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 z-10 relative">
         <FilterChip icon={<Database />} label="Metadata Only" />
         <FilterChip icon={<Globe />} label="Global Range" />
         <FilterChip icon={<Zap />} label="Vector Match" />
         <FilterChip icon={<History />} label="Recency Rank" />
      </div>

      <AnimatePresence mode="wait">
        {searched && (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-10 relative z-10"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-8 px-2">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight uppercase tracking-[0.05em]">Match Matrix</h2>
                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Ranked by Contextual Relevance</p>
              </div>
              <Badge variant="outline" className="rounded-full font-black tracking-widest text-[10px] border-primary/20 text-primary px-4 py-1.5 glass">
                {results.length} NODES FOUND
              </Badge>
            </div>

            {loading ? (
              <div className="grid gap-8 md:grid-cols-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-64 rounded-[2.5rem] bg-muted/20 animate-pulse border border-border/40" />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2">
                {results.map((res) => (
                  <motion.div key={res.document_id} variants={item}>
                    <Card 
                      className="rounded-[2.5rem] border-border/40 bg-background/40 backdrop-blur-3xl p-10 space-y-8 transition-all hover:shadow-2xl group cursor-pointer border hover:-translate-y-2 duration-500 overflow-hidden relative" 
                      onClick={() => window.location.href = `/dashboard/documents/${res.document_id}`}
                    >
                      <div className="absolute -top-10 -right-10 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-700 group-hover:scale-150">
                         <FileText className="h-48 w-48" />
                      </div>

                      <div className="flex justify-between items-start relative z-10">
                        <div className="bg-primary/5 p-3 rounded-2xl text-primary border border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-700">
                          <FileText className="h-7 w-7" />
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] tracking-[0.2em] px-3 py-1 uppercase rounded-full">
                          {res.status || "READY"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-4 relative z-10">
                        <CardTitle className="text-2xl font-black tracking-tight text-foreground/90 group-hover:text-primary transition-colors duration-500 leading-tight line-clamp-1">{res.filename}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                           <Badge variant="outline" className="h-6 px-3 text-[9px] font-black uppercase tracking-[0.1em] border-border/60 text-muted-foreground/60 rounded-lg">
                             {res.industry_name || "GENERAL"}
                           </Badge>
                           <Badge variant="outline" className="h-6 px-3 text-[9px] font-black uppercase tracking-[0.1em] border-border/60 text-muted-foreground/60 rounded-lg">
                             CORE ASSET
                           </Badge>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-border/40 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                           <div className="h-2 w-2 rounded-full bg-border" />
                           <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">IDENT: {res.document_id.slice(0, 8)}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-3 font-black text-[10px] uppercase tracking-[0.2em] text-primary hover:bg-primary/5 rounded-xl group-hover:translate-x-1 transition-all duration-500">
                          EXPLORE INTEL <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div variants={item} className="flex flex-col items-center justify-center text-center py-40 space-y-8 glass rounded-[3rem] border-dashed border-2 border-border/40">
                <div className="bg-muted/10 p-12 rounded-[2.5rem] relative">
                  <div className="absolute inset-0 bg-muted/20 rounded-full blur-3xl animate-pulse" />
                  <SearchIcon className="h-16 w-16 text-muted-foreground/20 relative z-10" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-foreground/30 uppercase tracking-tighter">No Signal Found</h3>
                  <p className="text-muted-foreground/40 font-bold uppercase tracking-[0.2em] text-[10px] max-w-xs mx-auto leading-relaxed">The repository did not return any matches for your current parameters.</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FilterChip({ icon, label }: any) {
  return (
    <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-muted/5 border border-border/40 hover:border-primary/40 hover:bg-background transition-all duration-500 group">
      <div className="text-muted-foreground/40 group-hover:text-primary transition-colors">
        {React.cloneElement(icon, { className: "h-4 w-4" })}
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-hover:text-foreground transition-colors">{label}</span>
    </button>
  )
}
