"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { ReactNode } from "react"

interface StatItem {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

interface StatsKpiRowProps {
  stats: StatItem[]
}

export function StatsKpiRow({ stats }: StatsKpiRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between">
            {stat.icon && (
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                {stat.icon}
              </div>
            )}
            {stat.trend && (
              <div className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                stat.trend === "up" && "bg-green-100 text-green-700",
                stat.trend === "down" && "bg-red-100 text-red-700",
                stat.trend === "neutral" && "bg-gray-100 text-gray-700"
              )}>
                {stat.trend === "up" && <TrendingUp className="h-3 w-3" />}
                {stat.trend === "down" && <TrendingDown className="h-3 w-3" />}
                {stat.trend === "neutral" && <Minus className="h-3 w-3" />}
                {stat.trendValue}
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
          <p className="text-2xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
