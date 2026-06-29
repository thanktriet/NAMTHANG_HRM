"use client"

import { Plus, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

type AdvanceStatus = "pending" | "approved" | "deducted"

interface AdvanceRow {
  id: string
  employeeCode: string
  fullName: string
  amount: number
  requestDate: string
  reason: string
  status: AdvanceStatus
}

const advanceData: AdvanceRow[] = [
  { id: "1", employeeCode: "NV004", fullName: "Phạm Minh Đức", amount: 5000000, requestDate: "10/06/2026", reason: "Chi phí y tế", status: "pending" },
  { id: "2", employeeCode: "NV006", fullName: "Võ Thanh Phong", amount: 3000000, requestDate: "08/06/2026", reason: "Sửa xe", status: "approved" },
  { id: "3", employeeCode: "NV002", fullName: "Trần Thị Bình", amount: 8000000, requestDate: "05/06/2026", reason: "Đóng học phí", status: "approved" },
  { id: "4", employeeCode: "NV008", fullName: "Bùi Văn Hải", amount: 4000000, requestDate: "12/06/2026", reason: "Chi phí cá nhân", status: "pending" },
  { id: "5", employeeCode: "NV005", fullName: "Hoàng Thị Em", amount: 6000000, requestDate: "01/06/2026", reason: "Trả nợ", status: "deducted" },
]

const statusConfig: Record<AdvanceStatus, { label: string; className: string }> = {
  pending: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Đã duyệt", className: "bg-green-100 text-green-700" },
  deducted: { label: "Đã khấu trừ", className: "bg-gray-100 text-gray-700" },
}

function formatCurrency(value: number): string {
  return value.toLocaleString("vi-VN") + "₫"
}

export default function AdvanceTable() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Tạo yêu cầu
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <th className="px-4 py-3 whitespace-nowrap">Mã NV</th>
              <th className="px-4 py-3 whitespace-nowrap">Họ tên</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Số tiền</th>
              <th className="px-4 py-3 whitespace-nowrap">Ngày yêu cầu</th>
              <th className="px-4 py-3 whitespace-nowrap">Lý do</th>
              <th className="px-4 py-3 whitespace-nowrap">Trạng thái</th>
              <th className="px-4 py-3 text-center whitespace-nowrap">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {advanceData.map((row) => {
              const status = statusConfig[row.status]
              return (
                <tr key={row.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium">{row.employeeCode}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.fullName}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(row.amount)}</td>
                  <td className="px-4 py-3">{row.requestDate}</td>
                  <td className="px-4 py-3">{row.reason}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", status.className)}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.status === "pending" ? (
                      <div className="flex items-center justify-center gap-2">
                        <button className="inline-flex items-center gap-1 rounded-md border border-green-300 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50">
                          <Check className="h-3 w-3" />
                          Duyệt
                        </button>
                        <button className="inline-flex items-center gap-1 rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">
                          <X className="h-3 w-3" />
                          Từ chối
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
