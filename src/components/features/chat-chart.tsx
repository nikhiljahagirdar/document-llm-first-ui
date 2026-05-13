"use client"

import * as React from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

interface ChatChartProps {
  data: {
    type: "bar" | "pie" | "line"
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor?: string[]
      borderColor?: string
    }[]
  }
}

const COLOR_PALETTES = [
  { name: "Indigo", colors: ['#4f46e5', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#eef2ff'] },
  { name: "Emerald", colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5'] },
  { name: "Rose", colors: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#fff1f2', '#fff1f2'] },
  { name: "Amber", colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7', '#fffbeb'] },
  { name: "Sky", colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe', '#f0f9ff'] }
]

export function ChatChart({ data }: ChatChartProps) {
  const [paletteIndex, setPaletteIndex] = React.useState(0)
  const COLORS = COLOR_PALETTES[paletteIndex].colors

  const chartData = data.labels.map((label, index) => {
    const entry: any = { name: label }
    data.datasets.forEach((dataset) => {
      entry[dataset.label] = dataset.data[index]
    })
    return entry
  })

  const renderChart = () => {
    switch (data.type) {
      case "bar":
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 700 }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', paddingTop: '20px' }} />
            {data.datasets.map((dataset, idx) => (
              <Bar 
                key={idx} 
                dataKey={dataset.label} 
                fill={COLORS[idx % COLORS.length]} 
                radius={[4, 4, 0, 0]} 
              />
            ))}
          </BarChart>
        )
      case "line":
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 700 }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', paddingTop: '20px' }} />
            {data.datasets.map((dataset, idx) => (
              <Line 
                key={idx} 
                type="monotone" 
                dataKey={dataset.label} 
                stroke={COLORS[idx % COLORS.length]} 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        )
      case "pie":
        const pieData = data.labels.map((label, index) => ({
          name: label,
          value: data.datasets[0].data[index]
        }))
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 700 }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }} />
          </PieChart>
        )
      default:
        return null
    }
  }

  return (
    <Card className="my-4 border-none shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden rounded-2xl">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">
          AI Data Visualization
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-white dark:hover:bg-slate-800">
              <Palette className="h-3.5 w-3.5 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border-slate-200 dark:border-slate-700">
            {COLOR_PALETTES.map((p, i) => (
              <DropdownMenuItem 
                key={i} 
                onClick={() => setPaletteIndex(i)}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest py-2"
              >
                <div className="flex -space-x-1">
                  {p.colors.slice(0, 3).map((c, j) => (
                    <div key={j} className="h-3 w-3 rounded-full border border-white dark:border-slate-900" style={{ backgroundColor: c }} />
                  ))}
                </div>
                {p.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="h-[300px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart() as any}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
