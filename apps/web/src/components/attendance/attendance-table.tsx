"use client"

import { cn } from "@/lib/utils"

type AttendanceStatus = "present" | "late" | "absent" | "leave" | "ot"

interface AttendanceRow {
  id: string
  employeeCode: string
  fullName: string
  days: Record<number, AttendanceStatus>
  totalDays: number
  totalOT: number
}

const statusConfig: Record<AttendanceStatus, { label: string; className: string; tooltip: string }> = {
  present: { label: "✓", className: "bg-green-100 text-green-700", tooltip: "Có mặt" },
  late: { label: "T", className: "bg-yellow-100 text-yellow-700", tooltip: "Đi trễ" },
  absent: { label: "V", className: "bg-red-100 text-red-700", tooltip: "Vắng mặt" },
  leave: { label: "P", className: "bg-blue-100 text-blue-700", tooltip: "Nghỉ phép" },
  ot: { label: "OT", className: "bg-purple-100 text-purple-700", tooltip: "Tăng ca" },
}

interface AttendanceTableProps {
  data: AttendanceRow[]
  daysInMonth: number
}

export default function AttendanceTable({ data, daysInMonth }: AttendanceTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
            <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 whitespace-nowrap">Mã NV</th>
            <th className="sticky left-[100px] z-10 bg-gray-50 px-4 py-3 whitespace-nowrap">Họ tên</th>
            {Array.from({ length: daysInMonth }, (_, i) => (
              <th key={i + 1} className="px-2 py-3 text-center min-w-[36px]">
                {i + 1}
              </th>
            ))}
            <th className="px-4 py-3 text-center whitespace-nowrap">Tổng công</th>
            <th className="px-4 py-3 text-center whitespace-nowrap">OT</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50/50">
              <td className="sticky left-0 z-10 bg-white px-4 py-3 font-medium whitespace-nowrap">
                {row.employeeCode}
              </td>
              <td className="sticky left-[100px] z-10 bg-white px-4 py-3 whitespace-nowrap">
                {row.fullName}
              </td>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const status = row.days[i + 1]
                if (!status) {
                  return <td key={i + 1} className="px-2 py-3 text-center">-</td>
                }
                const config = statusConfig[status]
                return (
                  <td key={i + 1} className="px-2 py-3 text-center">
                    <span
                      title={config.tooltip}
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded text-xs font-medium",
                        config.className
                      )}
                    >
                      {config.label}
                    </span>
                  </td>
                )
              })}
              <td className="px-4 py-3 text-center font-semibold">{row.totalDays}</td>
              <td className="px-4 py-3 text-center text-purple-600 font-medium">{row.totalOT}h</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
