"use client"

import * as React from "react"
import { api } from "@/lib/api"
import * as Types from "@/types/api"
import { 
  Plus, 
  Save, 
  Code2, 
  Eye, 
  Layout, 
  Type, 
  Layers, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  ChevronRight,
  HelpCircle,
  FileText,
  Bold,
  Italic,
  Underline,
  List,
  Heading1,
  Heading2,
  Quote,
  BrainCircuit,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Palette,
  ChevronDown,
  ListOrdered,
  Eraser,
  Grid,
  Undo2,
  Redo2,
  RefreshCw,
  Strikethrough,
  Minus,
  Video,
  Braces,
  Trash2,
  PlusSquare,
  Columns,
  Rows,
  Database,
  FileSpreadsheet,
  FileJson,
  Upload,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Slate Imports
import { createEditor, Descendant, Editor, Transforms, Text, Element as SlateElement, Range, Path } from 'slate'
import { Slate, Editable, withReact, useSlate } from 'slate-react'
import { withHistory } from 'slate-history'

// Define custom types for Slate
type CustomElement = 
  | { type: 'paragraph'; align?: string; children: (CustomText | CustomElement)[] }
  | { type: 'h1'; align?: string; children: CustomText[] }
  | { type: 'h2'; align?: string; children: CustomText[] }
  | { type: 'h3'; align?: string; children: CustomText[] }
  | { type: 'h4'; align?: string; children: CustomText[] }
  | { type: 'h5'; align?: string; children: CustomText[] }
  | { type: 'block-quote'; align?: string; children: CustomText[] }
  | { type: 'bulleted-list'; children: CustomElement[] }
  | { type: 'numbered-list'; children: CustomElement[] }
  | { type: 'list-item'; children: CustomText[] }
  | { type: 'table'; children: TableRowElement[] }
  | { type: 'table-row'; children: TableCellElement[] }
  | { type: 'table-cell'; children: CustomText[] }
  | { type: 'link'; url: string; children: CustomText[] }
  | { type: 'image'; url: string; children: [{ text: '' }] }
  | { type: 'video'; url: string; children: [{ text: '' }] }
  | { type: 'horizontal-rule'; children: [{ text: '' }] };

type TableRowElement = { type: 'table-row'; children: TableCellElement[] };
type TableCellElement = { type: 'table-cell'; children: CustomText[] };

type CustomText = { 
  text: string; 
  bold?: boolean; 
  italic?: boolean; 
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  backgroundColor?: string;
}

declare module 'slate' {
  interface CustomTypes {
    Editor: any
    Element: CustomElement
    Text: CustomText
  }
}

const initialValue: Descendant[] = [
  {
    type: 'h1',
    align: 'center',
    children: [{ text: 'Standard Intelligence Blueprint', bold: true }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Start building your professional template here...' }],
  },
]

const COLORS = [
  { name: 'Default', value: 'inherit' },
  { name: 'Primary', value: 'hsl(var(--primary))' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Slate', value: '#475569' },
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#000000' },
]

const DEFAULT_VARIABLES = [
  "{{client_name}}",
  "{{client_email}}",
  "{{invoice_number}}",
  "{{current_date}}",
  "{{due_date}}",
  "{{total_amount}}",
  "{{currency}}",
  "{{industry}}",
  "{{company_name}}",
  "{{signature_block}}"
]

export function TemplateBuilder({ 
  id, 
  initialIndustryId, 
  initialCategoryId, 
  initialSubcategoryId 
}: { 
  id?: string, 
  initialIndustryId?: string, 
  initialCategoryId?: string, 
  initialSubcategoryId?: string 
}) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [industryId, setIndustryId] = React.useState(initialIndustryId || "")
  const [categoryId, setCategoryId] = React.useState(initialCategoryId || "")
  const [subcategoryId, setSubcategoryId] = React.useState(initialSubcategoryId || "")
  
  const [industries, setIndustries] = React.useState<Types.IndustryResponse[]>([])
  const [loading, setLoading] = React.useState(false)
  const [isFetching, setIsFetching] = React.useState(!!id)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [previewMode, setPreviewMode] = React.useState(false)
  const [aiPrompt, setAiPrompt] = React.useState("")

  // Data Source State
  const [dataVariables, setDataVariables] = React.useState<string[]>([])
  const [isDataLoaded, setIsDataLoaded] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const imageInputRef = React.useRef<HTMLInputElement>(null)

  const parseCSV = (text: string) => {
    const lines = text.split('\n')
    if (lines.length === 0) return []
    const headers = lines[0].split(',').map(h => h.trim().replace(/["']/g, ''))
    return headers.filter(h => h).map(h => `{{${h}}}`)
  }

  const parseJSON = (text: string) => {
    try {
      const obj = JSON.parse(text)
      const target = Array.isArray(obj) ? obj[0] : obj
      const keys = Object.keys(target)
      return keys.map(k => `{{${k}}}`)
    } catch {
      return []
    }
  }

  const handleDataUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      let vars: string[] = []
      if (file.name.endsWith('.json')) {
        vars = parseJSON(text)
      } else if (file.name.endsWith('.csv')) {
        vars = parseCSV(text)
      } else {
        alert("Please upload a .json or .csv file. Excel support coming soon.")
        return
      }

      if (vars.length > 0) {
        setDataVariables(vars)
        setIsDataLoaded(true)
      } else {
        alert("Could not extract variables from file. Please check format.")
      }
    }
    reader.readAsText(file)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const url = event.target?.result as string
      const text = { text: '' }
      const image = { type: 'image', url, children: [text] }
      Transforms.insertNodes(editor, image as any)
    }
    reader.readAsDataURL(file)
  }

  // Slate Editor instance with enhanced plugins
  const editor = React.useMemo(() => {
    const e = withHistory(withReact(createEditor()))
    const { isInline, isVoid } = e
    
    e.isInline = (element: any) => element.type === 'link' || isInline(element)
    e.isVoid = (element: any) => 
      ['image', 'video', 'horizontal-rule'].includes(element.type) || isVoid(element)
    
    return e
  }, [])

  const [value, setValue] = React.useState<Descendant[]>(initialValue)

  React.useEffect(() => {
    api.getIndustries().then(data => setIndustries(data || []))
    
    if (id) {
      setIsFetching(true)
      api.getTemplate(id).then(data => {
        if (data) {
          setName(data.template_name || "")
          setDescription(data.description || "")
          setIndustryId(data.industry_id || initialIndustryId || "")
          setCategoryId(data.category_id || initialCategoryId || "")
          setSubcategoryId(data.subcategory_id || initialSubcategoryId || "")
          
          if (data.template_schema && (data.template_schema as any).slate_json) {
            setValue((data.template_schema as any).slate_json)
          } else if (data.html_content) {
             // Fallback or conversion logic if needed
          }
        }
      }).finally(() => setIsFetching(false))
    }
  }, [id, initialIndustryId, initialCategoryId, initialSubcategoryId])

  // Utility to convert Slate value to HTML
  const serializeToHtml = (nodes: Descendant[]): string => {
// ... same serializeToHtml
    return nodes.map(n => {
      if (SlateElement.isElement(n)) {
        const children = serializeToHtml(n.children as Descendant[])
        const align = (n as any).align ? ` style="text-align: ${(n as any).align}"` : ''
        switch (n.type) {
          case 'h1': return `<h1${align}>${children}</h1>`
          case 'h2': return `<h2${align}>${children}</h2>`
          case 'h3': return `<h3${align}>${children}</h3>`
          case 'h4': return `<h4${align}>${children}</h4>`
          case 'h5': return `<h5${align}>${children}</h5>`
          case 'block-quote': return `<blockquote${align}>${children}</blockquote>`
          case 'bulleted-list': return `<ul>${children}</ul>`
          case 'numbered-list': return `<ol>${children}</ol>`
          case 'list-item': return `<li>${children}</li>`
          case 'link': return `<a href="${(n as any).url}" target="_blank">${children}</a>`
          case 'table': return `<table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; margin: 20px 0;"><tbody>${children}</tbody></table>`
          case 'table-row': return `<tr>${children}</tr>`
          case 'table-cell': return `<td style="border: 1px solid #ddd; padding: 12px;">${children}</td>`
          case 'image': return `<img src="${(n as any).url}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0;" />`
          case 'video': 
            const videoUrl = (n as any).url
            if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
              const id = videoUrl.split('v=')[1] || videoUrl.split('/').pop()
              return `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen style="border-radius: 12px; margin: 20px 0;"></iframe>`
            }
            return `<video src="${videoUrl}" controls style="max-width: 100%; border-radius: 8px;"></video>`
          case 'horizontal-rule': return `<hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />`
          default: return `<p${align}>${children}</p>`
        }
      } else {
        const textNode = n as CustomText
        let text = textNode.text
        if (textNode.bold) text = `<strong>${text}</strong>`
        if (textNode.italic) text = `<em>${text}</em>`
        if (textNode.underline) text = `<u>${text}</u>`
        if (textNode.strikethrough) text = `<del>${text}</del>`
        
        const styles = []
        if (textNode.color && textNode.color !== 'inherit') styles.push(`color: ${textNode.color}`)
        if (textNode.backgroundColor) styles.push(`background-color: ${textNode.backgroundColor}`)
        
        if (styles.length > 0) {
          text = `<span style="${styles.join('; ')}">${text}</span>`
        }
        return text
      }
    }).join('')
  }

  const handleSave = async () => {
    if (!name) {
      alert("Please provide a template identity.")
      return
    }
    setLoading(true)
    try {
      const html = serializeToHtml(value)
      const payload: any = {
        template_name: name,
        html_content: html,
        description,
        document_type: "Professional Blueprint",
        industry_id: industryId || null,
        category_id: categoryId || null,
        subcategory_id: subcategoryId || null,
        template_schema: { slate_json: value },
        config: null
      }

      if (id) {
        await api.updateTemplate(id, payload)
        alert("Intelligence Blueprint updated successfully!")
      } else {
        await api.createTemplate(payload)
        alert("Intelligence Blueprint committed successfully!")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAiGenerate = async (overridePrompt?: string) => {
    const promptToUse = overridePrompt || aiPrompt
    if (!promptToUse) return
    setIsGenerating(true)
    try {
      const prompt = `Act as a professional document architect. Generate a highly structured, enterprise-grade template for: "${promptToUse}". 
      Use {{placeholder_name}} for dynamic fields. 
      Use H1 and H2 headers, bulleted lists, and tables where appropriate.
      Return the content in a format I can parse into paragraphs.`
      
      const res = await api.generateDocument({ 
        prompt,
        industry_id: industryId || undefined,
        category_id: categoryId || undefined
      })
      
      const generatedText = res.content || `Generated Blueprint for: ${promptToUse}\n\n` + 
        `# {{title}}\n\n` + 
        `## 1. Executive Overview\n` +
        `{{overview_details}}\n\n` +
        `## 2. Strategic Objectives\n` +
        `* {{objective_1}}\n` +
        `* {{objective_2}}\n\n` +
        `Best regards,\n{{architect_name}}`

      Transforms.delete(editor, {
        at: {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        },
      })
      
      const lines = generatedText.split('\n')
      const newNodes: Descendant[] = lines.map(line => {
        if (line.startsWith('# ')) {
          return { type: 'h1', children: [{ text: line.replace('# ', '') }] }
        }
        if (line.startsWith('## ')) {
          return { type: 'h2', children: [{ text: line.replace('## ', '') }] }
        }
        if (line.startsWith('* ')) {
          return { type: 'bulleted-list', children: [{ type: 'list-item', children: [{ text: line.replace('* ', '') }] }] } as any
        }
        return { type: 'paragraph', children: [{ text: line || ' ' }] }
      })
      
      Transforms.insertNodes(editor, newNodes)
      setName(promptToUse.substring(0, 50))
      
    } catch (err) {
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedIndustry = industries.find(i => i.industry_id === industryId)
  const categories = selectedIndustry?.categories || []
  const subcategories = categories.find((c: Types.CategoryResponse) => c.category_id === categoryId)?.subcategories || []

  // Slate Render Functions
  const renderElement = React.useCallback((props: any) => {
    const { element, attributes, children } = props
    const style = { textAlign: element.align || 'left' }

    switch (element.type) {
      case 'h1': return <h1 {...attributes} style={style} className="text-4xl font-black mt-8 mb-6 tracking-tight text-foreground">{children}</h1>
      case 'h2': return <h2 {...attributes} style={style} className="text-3xl font-extrabold mt-6 mb-4 tracking-tight text-foreground/90">{children}</h2>
      case 'h3': return <h3 {...attributes} style={style} className="text-2xl font-bold mt-5 mb-3 text-foreground/80">{children}</h3>
      case 'h4': return <h4 {...attributes} style={style} className="text-xl font-bold mt-4 mb-2 text-foreground/70">{children}</h4>
      case 'h5': return <h5 {...attributes} style={style} className="text-lg font-bold mt-3 mb-2 text-foreground/60">{children}</h5>
      case 'block-quote': return <blockquote {...attributes} style={style} className="border-l-4 border-primary pl-6 py-2 italic my-6 bg-primary/5 rounded-r-lg text-lg text-primary/80">{children}</blockquote>
      case 'bulleted-list': return <ul {...attributes} className="list-disc ml-8 my-6 space-y-2">{children}</ul>
      case 'numbered-list': return <ol {...attributes} className="list-decimal ml-8 my-6 space-y-2">{children}</ol>
      case 'list-item': return <li {...attributes} className="text-base leading-relaxed">{children}</li>
      case 'link': return (
        <a {...attributes} href={element.url} className="text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-all">
          {children}
        </a>
      )
      case 'table': return (
        <div className="my-8 overflow-x-auto rounded-xl border border-border shadow-sm">
          <table {...attributes} className="w-full border-collapse">
            <tbody className="divide-y divide-border">{children}</tbody>
          </table>
        </div>
      )
      case 'table-row': return <tr {...attributes} className="divide-x divide-border">{children}</tr>
      case 'table-cell': return <td {...attributes} className="p-4 min-w-[100px] bg-background/50 relative group/cell">{children}</td>
      case 'image': return (
        <div {...attributes} contentEditable={false} className="my-8 relative group">
          <img src={element.url} alt="" className="w-full rounded-2xl shadow-2xl border border-border" />
          <Button variant="destructive" size="icon" className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all h-8 w-8" onClick={() => Transforms.removeNodes(editor, { at: Path.parent(editor.selection!.anchor.path) })}><Trash2 className="h-4 w-4" /></Button>
          {children}
        </div>
      )
      case 'video': return (
        <div {...attributes} contentEditable={false} className="my-8 relative group aspect-video">
           <iframe width="100%" height="100%" src={element.url.includes('youtube') ? `https://www.youtube.com/embed/${element.url.split('v=')[1]}` : element.url} frameBorder="0" className="rounded-2xl shadow-2xl" />
           <Button variant="destructive" size="icon" className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all h-8 w-8" onClick={() => Transforms.removeNodes(editor, { at: Path.parent(editor.selection!.anchor.path) })}><Trash2 className="h-4 w-4" /></Button>
           {children}
        </div>
      )
      case 'horizontal-rule': return (
        <div {...attributes} contentEditable={false} className="my-10 border-t-2 border-border border-dashed relative group">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-4 py-1 rounded-full border border-border text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Section Break</div>
          {children}
        </div>
      )
      default: return <p {...attributes} style={style} className="mb-4 leading-relaxed text-base text-foreground/80">{children}</p>
    }
  }, [editor])

  const renderLeaf = React.useCallback((props: any) => {
    let { children } = props
    const { leaf } = props

    if (leaf.bold) children = <strong className="font-black">{children}</strong>
    if (leaf.italic) children = <em className="italic">{children}</em>
    if (leaf.underline) children = <u className="underline decoration-current/30 underline-offset-2">{children}</u>
    if (leaf.strikethrough) children = <span className="line-through decoration-rose-500/50">{children}</span>
    
    if (leaf.color || leaf.backgroundColor) {
      children = (
        <span style={{ color: leaf.color, backgroundColor: leaf.backgroundColor }}>
          {children}
        </span>
      )
    }

    return <span {...props.attributes}>{children}</span>
  }, [])

  return (
    <div className="flex flex-col space-y-8 h-full min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Settings Top */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-2xl border-border bg-card shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl text-primary border border-primary/20">
                  <Layout className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-extrabold tracking-tight">Blueprint Config</CardTitle>
                  <CardDescription className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">Metadata Enrichment</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <Button 
                  onClick={async () => {
                    const ind = industries.find(i => i.industry_id === industryId)?.name || ""
                    const cat = (categories as Types.CategoryResponse[]).find((c) => c.category_id === categoryId)?.name || ""
                    const sub = (subcategories as Types.SubcategoryResponse[]).find((s) => s.subcategory_id === subcategoryId)?.name || ""
                    
                    if (!ind) {
                      alert("Please select at least an industry vertical.")
                      return
                    }

                    const prompt = `Professional ${sub || cat || ind} Document Blueprint`
                    setAiPrompt(prompt)
                    await handleAiGenerate(prompt)
                  }}
                  disabled={!industryId || isGenerating}
                  size="sm"
                  className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-indigo-500/20 rounded-xl transition-all"
                 >
                   {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                   AI Architect
                 </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/60">Template Identity</label>
                  <Input 
                    placeholder="e.g. Corporate Intelligence Report" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 border-border font-bold text-sm rounded-xl bg-muted/5 focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/60">Domain Description</label>
                  <textarea 
                    placeholder="Synthesise the purpose of this template..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-20 p-3 rounded-xl border border-border bg-muted/5 font-medium text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                     <Layers className="h-3 w-3" /> Industry Vertical
                   </label>
                   <Select value={industryId} onValueChange={(val) => {
                     setIndustryId(val)
                     setCategoryId("")
                     setSubcategoryId("")
                   }}>
                     <SelectTrigger className="h-10 border-border font-bold text-sm rounded-xl bg-muted/5">
                       <SelectValue placeholder="Select Domain" />
                     </SelectTrigger>
                     <SelectContent className="rounded-xl border-border shadow-2xl">
                       {industries.map(ind => <SelectItem key={ind.industry_id} value={ind.industry_id} className="font-bold text-sm py-2 cursor-pointer">{ind.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/60">Category</label>
                     <Select value={categoryId} onValueChange={(val) => {
                       setCategoryId(val)
                       setSubcategoryId("")
                     }} disabled={!industryId}>
                       <SelectTrigger className="h-10 border-border font-bold text-sm rounded-xl bg-muted/5">
                         <SelectValue placeholder="Category" />
                       </SelectTrigger>
                       <SelectContent className="rounded-xl border-border shadow-2xl">
                         {categories.map((cat: Types.CategoryResponse) => <SelectItem key={cat.category_id} value={cat.category_id} className="font-bold text-sm py-2 cursor-pointer">{cat.name}</SelectItem>)}
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/60">Subcategory</label>
                     <Select value={subcategoryId} onValueChange={setSubcategoryId} disabled={!categoryId}>
                       <SelectTrigger className="h-10 border-border font-bold text-sm rounded-xl bg-muted/5">
                         <SelectValue placeholder="Subcategory" />
                       </SelectTrigger>
                       <SelectContent className="rounded-xl border-border shadow-2xl">
                         {subcategories.map((sub: Types.SubcategoryResponse) => <SelectItem key={sub.subcategory_id} value={sub.subcategory_id} className="font-bold text-sm py-2 cursor-pointer">{sub.name}</SelectItem>)}
                       </SelectContent>
                     </Select>
                   </div>
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-primary/20 bg-primary/[0.03] shadow-none ring-1 ring-primary/10 overflow-hidden flex flex-col">
           <CardHeader className="p-6 pb-4">
             <CardTitle className="text-sm font-extrabold flex items-center gap-3 text-primary uppercase tracking-widest">
               <Database className="h-5 w-5" />
               Semantic Data Source
             </CardTitle>
           </CardHeader>
           <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-between space-y-4">
             <p className="text-[10px] font-medium text-primary/70 leading-relaxed italic border-l-2 border-primary/20 pl-4">
               {isDataLoaded 
                 ? "Data source active. Use the Braces icon in the toolbar to inject semantic variables." 
                 : "Upload a JSON or CSV file to enable semantic variable injection."}
             </p>
             <div className="flex flex-wrap gap-2">
               {(isDataLoaded ? dataVariables : DEFAULT_VARIABLES).slice(0, 10).map(tag => (
                 <Badge key={tag} variant="outline" className={cn(
                   "bg-background text-[9px] font-extrabold px-2 py-0.5 rounded-lg shadow-sm transition-all",
                   isDataLoaded ? "border-primary text-primary" : "border-muted-foreground/20 text-muted-foreground/40"
                 )}>
                   {tag}
                 </Badge>
               ))}
             </div>
             {!isDataLoaded && (
               <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full h-10 border-primary/20 text-primary hover:bg-primary/5 font-extrabold text-[9px] uppercase tracking-widest gap-2 rounded-xl mt-auto"
               >
                 <Upload className="h-3.5 w-3.5" />
                 Initialize Data Source
               </Button>
             )}
           </CardContent>
        </Card>
      </div>

      {/* Editor Main */}
      <Card className="flex-1 rounded-2xl border-border bg-card shadow-2xl overflow-hidden flex flex-col relative min-h-[800px]">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-indigo-500 to-violet-500 z-20" />
        <CardHeader className="p-8 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl text-primary shadow-inner border border-primary/20">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-extrabold tracking-tight">Blueprint Architect</CardTitle>
                <CardDescription className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">High-Fidelity Document Core</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1 bg-background p-1 rounded-xl border border-border shadow-sm mr-4">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground" onClick={() => editor.undo()} disabled={editor.history.undos.length === 0}><Undo2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground" onClick={() => editor.redo()} disabled={editor.history.redos.length === 0}><Redo2 className="h-4 w-4" /></Button>
               </div>
               <Button variant="ghost" size="sm" className="h-10 px-4 text-[10px] font-extrabold uppercase tracking-widest gap-2 rounded-xl" onClick={() => setPreviewMode(!previewMode)}>
                 {previewMode ? <Code2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                 {previewMode ? "Editor" : "Visualise"}
               </Button>
               <Button size="sm" className="h-10 px-6 text-[10px] font-extrabold uppercase tracking-widest gap-2 rounded-xl shadow-lg shadow-primary/20 bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={handleSave} disabled={loading}>
                 {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 fill-current" />}
                 Commit Blueprint
               </Button>
            </div>
          </div>
        </CardHeader>

        {/* Slate Enhanced Toolbar */}
        {!previewMode && (
          <div className="px-6 py-4 border-b border-border bg-muted/10 flex flex-wrap items-center gap-4 sticky top-0 z-30 backdrop-blur-md">
            <div className="flex items-center gap-1.5 bg-background p-1.5 rounded-2xl border border-border shadow-sm ring-1 ring-border/5">
              <HeadingDropdown editor={editor} />
            </div>

            <div className="flex items-center gap-1 bg-background p-1.5 rounded-2xl border border-border shadow-sm ring-1 ring-border/5">
              <ToolbarButton editor={editor} format="bold" icon={<Bold className="h-4 w-4" />} />
              <ToolbarButton editor={editor} format="italic" icon={<Italic className="h-4 w-4" />} />
              <ToolbarButton editor={editor} format="underline" icon={<Underline className="h-4 w-4" />} />
              <ToolbarButton editor={editor} format="strikethrough" icon={<Strikethrough className="h-4 w-4" />} />
            </div>

            <div className="flex items-center gap-1 bg-background p-1.5 rounded-2xl border border-border shadow-sm ring-1 ring-border/5">
              <ToolbarButton editor={editor} format="numbered-list" icon={<ListOrdered className="h-4 w-4" />} isBlock />
              <ToolbarButton editor={editor} format="bulleted-list" icon={<List className="h-4 w-4" />} isBlock />
              <ToolbarButton editor={editor} format="block-quote" icon={<Quote className="h-4 w-4" />} isBlock />
              <div className="w-px h-4 bg-border mx-1" />
              <Button 
                 variant="ghost" 
                 size="sm" 
                 className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted rounded-md"
                 onClick={() => Transforms.insertNodes(editor, { type: 'horizontal-rule', children: [{ text: '' }] } as any)}
                 title="Horizontal Rule"
              >
                 <Minus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 bg-background p-1.5 rounded-2xl border border-border shadow-sm ring-1 ring-border/5">
              <ColorPicker editor={editor} type="color" icon={<Type className="h-4 w-4" />} />
              <ColorPicker editor={editor} type="backgroundColor" icon={<Palette className="h-4 w-4" />} />
            </div>

            <div className="flex items-center gap-1 bg-background p-1.5 rounded-2xl border border-border shadow-sm ring-1 ring-border/5">
              <AlignButton editor={editor} align="left" icon={<AlignLeft className="h-4 w-4" />} />
              <AlignButton editor={editor} align="center" icon={<AlignCenter className="h-4 w-4" />} />
              <AlignButton editor={editor} align="right" icon={<AlignRight className="h-4 w-4" />} />
            </div>

            <div className="flex items-center gap-1 bg-background p-1.5 rounded-2xl border border-border shadow-sm ring-1 ring-border/5">
              <LinkButton editor={editor} />
              <ImageButton editor={editor} onUploadClick={() => imageInputRef.current?.click()} />
              <input 
                type="file" 
                ref={imageInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload}
              />
              <VideoButton editor={editor} />
              <TableButton editor={editor} />
              <div className="w-px h-4 bg-border mx-1" />
              <VariableButton 
                editor={editor} 
                variables={dataVariables} 
                isLoaded={isDataLoaded}
                onUploadClick={() => fileInputRef.current?.click()}
              />
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json,.csv" 
                onChange={handleDataUpload}
              />
            </div>

            <div className="flex items-center gap-1 ml-auto">
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className="h-9 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl gap-2 text-[10px] font-black uppercase tracking-widest"
                 onClick={() => {
                   Editor.removeMark(editor, 'bold')
                   Editor.removeMark(editor, 'italic')
                   Editor.removeMark(editor, 'underline')
                   Editor.removeMark(editor, 'strikethrough')
                   Editor.removeMark(editor, 'color')
                   Editor.removeMark(editor, 'backgroundColor')
                 }}
               >
                 <Eraser className="h-4 w-4" />
                 Clear
               </Button>
            </div>
            
            {/* Contextual Table Controls */}
            <TableControls editor={editor} />
          </div>
        )}

        <CardContent className="flex-1 p-0 flex flex-col min-h-0 bg-accent/5">
          <Slate editor={editor} initialValue={value} onChange={setValue}>
            <ScrollArea className="flex-1">
              <div className="max-w-5xl mx-auto p-4 md:p-12 min-h-full">
                <div className="bg-card shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] rounded-2xl border border-border p-8 md:px-20 md:py-24 relative min-h-[1000px]">
                  <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder="Initialise document deconstruction..."
                    spellCheck
                    autoFocus
                    readOnly={previewMode}
                    className="outline-none prose dark:prose-invert prose-slate max-w-none font-medium leading-relaxed"
                  />
                </div>
              </div>
            </ScrollArea>
          </Slate>
        </CardContent>
      </Card>

      {/* AI Generator Bar */}
      <Card className="rounded-2xl border-primary/20 bg-primary/[0.03] shadow-xl overflow-hidden ring-1 ring-primary/10">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse fill-current" />
              </div>
              <Input 
                placeholder="Ask Gemini to architect a blueprint (e.g. 'Master Service Agreement' or 'Enterprise Risk Assessment')"
                className="pl-12 h-14 border-primary/10 bg-background/80 rounded-xl font-medium text-sm focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-inner"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
              />
            </div>
            <Button 
              onClick={() => handleAiGenerate()} 
              disabled={isGenerating || !aiPrompt}
              className="h-14 px-10 font-bold text-xs uppercase tracking-widest gap-3 bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 fill-current" />}
              Initialise
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ToolbarButton({ editor, format, icon, isBlock = false }: { editor: any, format: string, icon: React.ReactNode, isBlock?: boolean }) {
  const isActive = isBlock 
    ? Array.from(Editor.nodes(editor, { match: (n: any) => n.type === format })).length > 0
    : (Editor.marks(editor) as any)?.[format] === true

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 w-8 p-0 rounded-md transition-all",
        isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
      )}
      onClick={(e) => {
        e.preventDefault()
        if (isBlock) {
          const isActive = Array.from(Editor.nodes(editor, { match: (n: any) => n.type === format })).length > 0
          Transforms.setNodes(
            editor,
            { type: isActive ? 'paragraph' : format } as any
          )
        } else {
          Editor.addMark(editor, format, true)
        }
      }}
    >
      {icon}
    </Button>
  )
}

function HeadingDropdown({ editor }: { editor: any }) {
  const currentType = Array.from(Editor.nodes(editor, { match: (n: any) => ['h1', 'h2', 'h3', 'h4', 'h5', 'paragraph'].includes(n.type) }))[0]?.[0] as any
  const value = currentType?.type || 'paragraph'

  return (
    <Select value={value} onValueChange={(val) => {
      Transforms.setNodes(editor, { type: val } as any)
    }}>
      <SelectTrigger className="h-8 border-none bg-transparent font-bold text-[10px] uppercase gap-2 w-[110px] focus:ring-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-border shadow-2xl">
        <SelectItem value="paragraph" className="font-bold text-xs">Paragraph</SelectItem>
        <SelectItem value="h1" className="font-bold text-lg">H1 Header</SelectItem>
        <SelectItem value="h2" className="font-bold text-base">H2 Header</SelectItem>
        <SelectItem value="h3" className="font-bold text-sm">H3 Header</SelectItem>
        <SelectItem value="h4" className="font-bold text-xs">H4 Header</SelectItem>
        <SelectItem value="h5" className="font-bold text-[10px]">H5 Header</SelectItem>
      </SelectContent>
    </Select>
  )
}

function ColorPicker({ editor, type, icon }: { editor: any, type: 'color' | 'backgroundColor', icon: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
          {icon}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3 rounded-xl border-border shadow-2xl bg-popover/90 backdrop-blur-xl">
        <div className="grid grid-cols-5 gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              className="h-6 w-6 rounded-md border border-border shadow-sm transition-transform hover:scale-110 active:scale-95"
              style={{ backgroundColor: c.value === 'inherit' ? 'transparent' : c.value }}
              onClick={() => {
                if (c.value === 'inherit') {
                  Editor.removeMark(editor, type)
                } else {
                  Editor.addMark(editor, type, c.value)
                }
              }}
              title={c.name}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function AlignButton({ editor, align, icon }: { editor: any, align: string, icon: React.ReactNode }) {
  const isActive = Array.from(Editor.nodes(editor, { match: (n: any) => n.align === align })).length > 0

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 w-8 p-0 rounded-md transition-all",
        isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
      )}
      onClick={(e) => {
        e.preventDefault()
        Transforms.setNodes(editor, { align } as any)
      }}
    >
      {icon}
    </Button>
  )
}

function LinkButton({ editor }: { editor: any }) {
  const insertLink = (url: string) => {
    if (!url) return
    const { selection } = editor
    const isCollapsed = selection && Range.isCollapsed(selection)
    const link = {
      type: 'link',
      url,
      children: isCollapsed ? [{ text: url }] : [],
    }

    if (isCollapsed) {
      Transforms.insertNodes(editor, link as any)
    } else {
      Transforms.wrapNodes(editor, link as any, { split: true })
      Transforms.collapse(editor, { edge: 'end' })
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
          <LinkIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 rounded-xl border-border shadow-2xl bg-popover">
        <div className="flex gap-2">
          <Input 
            placeholder="https://..." 
            className="h-9 text-xs font-bold" 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                insertLink(e.currentTarget.value)
              }
            }}
          />
          <Button size="sm" className="h-9 px-4 font-bold text-[10px] uppercase">Link</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ImageButton({ editor, onUploadClick }: { editor: any, onUploadClick?: () => void }) {
  const insertImage = (url: string) => {
    if (!url) return
    const text = { text: '' }
    const image = { type: 'image', url, children: [text] }
    Transforms.insertNodes(editor, image as any)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 rounded-xl border-border shadow-2xl bg-popover">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Image URL..." 
              className="h-9 text-xs font-bold" 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  insertImage(e.currentTarget.value)
                }
              }}
            />
            <Button size="sm" className="h-9 px-4 font-bold text-[10px] uppercase">Embed</Button>
          </div>
          
          {onUploadClick && (
            <div className="pt-2 border-t border-border">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-9 font-bold text-[10px] uppercase gap-2"
                onClick={onUploadClick}
              >
                <Upload className="h-3.5 w-3.5" />
                Upload Image
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function VideoButton({ editor }: { editor: any }) {
  const insertVideo = (url: string) => {
    if (!url) return
    const video = { type: 'video', url, children: [{ text: '' }] }
    Transforms.insertNodes(editor, video as any)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
          <Video className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 rounded-xl border-border shadow-2xl bg-popover">
        <div className="flex gap-2">
          <Input 
            placeholder="Video URL (YouTube)..." 
            className="h-9 text-xs font-bold" 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                insertVideo(e.currentTarget.value)
              }
            }}
          />
          <Button size="sm" className="h-9 px-4 font-bold text-[10px] uppercase">Embed</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function TableButton({ editor }: { editor: any }) {
  const insertTable = () => {
    const table: any = {
      type: 'table',
      children: [
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'Header 1', bold: true }] },
            { type: 'table-cell', children: [{ text: 'Header 2', bold: true }] },
          ],
        },
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'Cell 1' }] },
            { type: 'table-cell', children: [{ text: 'Cell 2' }] },
          ],
        },
      ],
    }
    Transforms.insertNodes(editor, table)
  }

  return (
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground" onClick={insertTable}>
      <TableIcon className="h-4 w-4" />
    </Button>
  )
}

function VariableButton({ 
  editor, 
  variables, 
  isLoaded, 
  onUploadClick 
}: { 
  editor: any, 
  variables: string[], 
  isLoaded: boolean, 
  onUploadClick: () => void 
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "h-8 w-8 p-0 rounded-md transition-all",
            isLoaded ? "text-primary bg-primary/10 shadow-inner" : "text-muted-foreground hover:bg-muted"
          )}
          title={isLoaded ? "Inject Variables" : "Upload Data Source First"}
        >
          <Braces className={cn("h-4 w-4", isLoaded && "animate-pulse")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 rounded-2xl border-border shadow-2xl bg-popover/90 backdrop-blur-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {!isLoaded ? (
          <div className="p-8 text-center space-y-5">
             <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto text-primary border border-primary/20 shadow-inner rotate-3 hover:rotate-0 transition-transform">
                <Database className="h-8 w-8" />
             </div>
             <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-2 text-foreground">No Data Source</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">Upload a JSON or CSV file to unlock semantic variable injection and automated blueprinting.</p>
             </div>
             <Button onClick={onUploadClick} size="sm" className="w-full font-black text-[10px] uppercase h-11 gap-2 rounded-xl shadow-lg shadow-primary/20">
                <Upload className="h-4 w-4" />
                Initialize Data
             </Button>
          </div>
        ) : (
          <div className="flex flex-col min-h-0">
             <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Variables</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors" onClick={onUploadClick} title="Change Data Source">
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
             </div>
             <ScrollArea className="max-h-80">
                <div className="p-2 flex flex-col gap-1">
                  {variables.map((v) => (
                    <button
                      key={v}
                      className="text-left px-4 py-3 text-xs font-bold rounded-xl hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-between group"
                      onClick={() => {
                        Editor.insertText(editor, v)
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary/40 transition-colors" />
                        {v}
                      </span>
                      <Plus className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all" />
                    </button>
                  ))}
                </div>
             </ScrollArea>
             <div className="p-3 bg-muted/10 border-t border-border flex items-center justify-center">
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/50">Semantic Schema v1.0</p>
             </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

function TableControls({ editor }: { editor: any }) {
  const [inTable, setInTable] = React.useState(false)

  React.useEffect(() => {
    const table = Array.from(Editor.nodes(editor, { match: (n: any) => n.type === 'table' }))[0]
    setInTable(!!table)
  }, [editor.selection])

  if (!inTable) return null

  const addRow = () => {
    const cell = Array.from(Editor.nodes(editor, { match: (n: any) => n.type === 'table-cell' }))[0]
    if (!cell) return
    const rowPath = Path.parent(cell[1])
    const tablePath = Path.parent(rowPath)
    const row = Array.from(Editor.nodes(editor, { at: rowPath, match: (n: any) => n.type === 'table-row' }))[0][0] as any
    
    const newRow = {
      type: 'table-row',
      children: row.children.map(() => ({ type: 'table-cell', children: [{ text: '' }] }))
    }
    
    Transforms.insertNodes(editor, newRow as any, { at: Path.next(rowPath) })
  }

  const addCol = () => {
    const tableEntry = Array.from(Editor.nodes(editor, { match: (n: any) => n.type === 'table' }))[0]
    if (!tableEntry) return
    const [table, tablePath] = tableEntry as any
    
    table.children.forEach((row: any, i: number) => {
      Transforms.insertNodes(
        editor, 
        { type: 'table-cell', children: [{ text: '' }] } as any, 
        { at: [...tablePath, i, row.children.length] }
      )
    })
  }

  const deleteTable = () => {
    Transforms.removeNodes(editor, { match: (n: any) => n.type === 'table' })
  }

  return (
    <>
      <div className="h-6 w-px bg-border mx-2 animate-in fade-in" />
      <div className="flex items-center gap-1 bg-amber-500/10 p-1.5 rounded-xl border border-amber-500/20 shadow-sm animate-in zoom-in-95">
        <Button variant="ghost" size="sm" className="h-8 px-2 text-amber-600 hover:bg-amber-500/20 gap-2" onClick={addRow}>
          <Rows className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase">Row</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-amber-600 hover:bg-amber-500/20 gap-2" onClick={addCol}>
          <Columns className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase">Col</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-500/10" onClick={deleteTable}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </>
  )
}
