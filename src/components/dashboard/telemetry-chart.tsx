"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TelemetryChartProps {
  data: number[]
  label: string
  color?: string
  limit?: number
}

export const TelemetryChart = React.memo(function TelemetryChart({ 
  data, 
  label, 
  color = "rgb(79, 70, 229)", // indigo-600
  limit = 100 
}: TelemetryChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 })

  React.useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        })
      }
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const max = limit
  const points = React.useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || data.length === 0) return ""
    
    const stepX = dimensions.width / (data.length - 1 || 1)
    const stepY = dimensions.height / max

    return data.map((val, i) => {
      const x = i * stepX
      const y = dimensions.height - (val * stepY)
      return `${x},${y}`
    }).join(" ")
  }, [data, dimensions, max])

  return (
    <div className="flex flex-col space-y-4 w-full h-full">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-sm font-bold text-foreground">{data[data.length - 1]?.toFixed(1)}%</span>
      </div>
      <div ref={containerRef} className="flex-1 min-h-[120px] relative">
        <svg 
          width="100%" 
          height="100%" 
          className="overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <line x1="0" y1="0" x2="100%" y2="0" stroke="currentColor" strokeWidth="1" className="text-border/30" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-border/30" />
          <line x1="0" y1="100%" x2="100%" y2="100%" stroke="currentColor" strokeWidth="1" className="text-border/30" />

          {/* Area under the curve */}
          <polyline
            fill={`${color}10`}
            stroke="none"
            points={`0,${dimensions.height} ${points} ${dimensions.width},${dimensions.height}`}
          />

          {/* The line itself */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="transition-all duration-700 ease-in-out"
          />
          
          {/* Glowing dot at the end */}
          {data.length > 0 && (
            <circle
              cx={dimensions.width}
              cy={dimensions.height - (data[data.length - 1] * (dimensions.height / max))}
              r="4"
              fill={color}
              className="animate-pulse shadow-lg"
              style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            />
          )}
        </svg>
      </div>
    </div>
  )
})
