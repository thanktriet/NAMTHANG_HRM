"use client"

import { X, FileText, FileDown, RefreshCw, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContractDetailPanelProps {
  contract: {
    id: number
    code: string
    type: string
    employee: string
    employeeCode: string
    department: string
    startDate: string
    endDate: string
    status: string
    salary: string
    allowance: string
    workHours: number
    signDate: string
  }
  onClose: () => void
}

export function ContractDetailPanel({ contract, onClose }: ContractDetailPanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md transform overflow-y-auto bg-background shadow-xl transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Chi tiết hợp đồng</h2>
            <p className="text-sm text-muted-foreground">{contract.code}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Contract Info */}
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
              Thông tin hợp đồng
            </h3>
            <div className="space-y-2 rounded-lg border p-4">
              <InfoRow label="Mã HĐ" value={contract.code} />
              <InfoRow label="Loại HĐ" value={contract.type} />
              <InfoRow label="Thời hạn" value={`${contract.startDate} — ${contract.endDate}`} />
              <InfoRow label="Ngày ký" value={contract.signDate} />
              <InfoRow label="Trạng thái" value={contract.status} badge />
            </div>
          </section>

          {/* Employee Info */}
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
              Thông tin nhân viên
            </h3>
            <div className="space-y-2 rounded-lg border p-4">
              <InfoRow label="Họ tên" value={contract.employee} />
              <InfoRow label="Mã NV" value={contract.employeeCode} />
              <InfoRow label="Phòng ban" value={contract.department} />
            </div>
          </section>

          {/* Salary Terms */}
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
              Điều khoản lương
            </h3>
            <div className="space-y-2 rounded-lg border p-4">
              <InfoRow label="Lương cơ bản" value={`${contract.salary} đ`} />
              <InfoRow label="Phụ cấp" value={`${contract.allowance} đ`} />
              <InfoRow label="Giờ làm/tuần" value={`${contract.workHours} giờ`} />
            </div>
          </section>

          {/* Actions */}
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
              Hành động
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                <FileText className="h-4 w-4" />
                Xuất Word
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">
                <FileDown className="h-4 w-4" />
                Xuất PDF
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700">
                <RefreshCw className="h-4 w-4" />
                Gia hạn
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700">
                <Trash2 className="h-4 w-4" />
                Thanh lý
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

function InfoRow({ label, value, badge }: { label: string; value: string; badge?: boolean }) {
  function getStatusColor(status: string) {
    switch (status) {
      case "Đang hiệu lực": return "bg-green-100 text-green-700"
      case "Sắp hết hạn": return "bg-orange-100 text-orange-700"
      case "Hết hạn": return "bg-red-100 text-red-700"
      case "Đã thanh lý": return "bg-gray-100 text-gray-700"
      default: return ""
    }
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      {badge ? (
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", getStatusColor(value))}>
          {value}
        </span>
      ) : (
        <span className="text-sm font-medium">{value}</span>
      )}
    </div>
  )
}
