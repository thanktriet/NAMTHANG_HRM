"use client"

import { cn } from "@/lib/utils"

interface FunnelData {
  label: string
  value: number
  color: string
}

interface FunnelChartProps {
  data?: FunnelData[]
}

const defaultData: FunnelData[] = [
  { label: "Ứng tuyển", value: 128, color: "#3b82f6" },
  { label: "Sàng lọc", value: 78, color: "#6366f1" },
  { label: "Phỏng vấn", value: 32, color: "#8b5cf6" },
  { label: "Đạt", value: 16, color: "#10b981" },
  { label: "Nhận việc", value: 8, color: "#059669" },
]

export function FunnelChart({ data = defaultData }: FunnelChartProps) {
  const maxValue = data[0]?.value || 1
  const height = 320
  const levelHeight = height / data.length
  const padding = 40
  const svgWidth = 600

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${svgWidth} ${height + 20}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {data.map((item, index) => {
          const widthPercent = item.value / maxValue
          const nextWidthPercent = index < data.length - 1
            ? data[index + 1].value / maxValue
            : widthPercent * 0.7

          const maxBarWidth = svgWidth - padding * 2 - 200
          const currentWidth = maxBarWidth * widthPercent
          const nextWidth = maxBarWidth * nextWidthPercent

          const centerX = svgWidth / 2 + 50
          const y = index * levelHeight + 5

          const x1Left = centerX - currentWidth / 2
          const x1Right = centerX + currentWidth / 2
          const x2Left = centerX - nextWidth / 2
          const x2Right = centerX + nextWidth / 2

          const percentage = Math.round((item.value / maxValue) * 100)
          const conversionRate = index > 0
            ? Math.round((item.value / data[index - 1].value) * 100)
            : 100

          return (
            <g key={item.label}>
              {/* Trapezoid */}
              <path
                d={`M ${x1Left} ${y} L ${x1Right} ${y} L ${x2Right} ${y + levelHeight - 4} L ${x2Left} ${y + levelHeight - 4} Z`}
                fill={item.color}
                opacity={0.85}
                rx={4}
              />

              {/* Label on left */}
              <text
                x={padding - 10}
                y={y + levelHeight / 2 + 4}
                textAnchor="start"
                className="text-xs"
                fill="currentColor"
                fontSize="12"
              >
                {item.label}
              </text>

              {/* Value inside bar */}
              <text
                x={centerX}
                y={y + levelHeight / 2 + 5}
                textAnchor="middle"
                fill="white"
                fontWeight="bold"
                fontSize="14"
              >
                {item.value}
              </text>

              {/* Percentage on right */}
              <text
                x={svgWidth - padding + 10}
                y={y + levelHeight / 2 + 4}
                textAnchor="end"
                fill="currentColor"
                fontSize="11"
                opacity={0.7}
              >
                {percentage}%
              </text>

              {/* Conversion arrow */}
              {index > 0 && (
                <text
                  x={svgWidth - padding + 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill={item.color}
                >
                  ↓ {conversionRate}%
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
