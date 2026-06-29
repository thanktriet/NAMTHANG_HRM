"use client"

import { cn } from "@/lib/utils"

interface PayrollRow {
  stt: number
  employeeCode: string
  fullName: string
  department: string
  baseSalary: number
  allowance: number
  ot: number
  bonus: number
  insurance: number
  tax: number
  deduction: number
  netPay: number
}

const payrollData: PayrollRow[] = [
  { stt: 1, employeeCode: "NV001", fullName: "Nguyễn Văn An", department: "Kinh doanh", baseSalary: 15000000, allowance: 3000000, ot: 2500000, bonus: 1000000, insurance: 1575000, tax: 1200000, deduction: 0, netPay: 18725000 },
  { stt: 2, employeeCode: "NV002", fullName: "Trần Thị Bình", department: "Kế toán", baseSalary: 12000000, allowance: 2000000, ot: 1000000, bonus: 500000, insurance: 1260000, tax: 850000, deduction: 0, netPay: 13390000 },
  { stt: 3, employeeCode: "NV003", fullName: "Lê Hoàng Cường", department: "IT", baseSalary: 20000000, allowance: 4000000, ot: 3500000, bonus: 2000000, insurance: 2100000, tax: 2500000, deduction: 0, netPay: 24900000 },
  { stt: 4, employeeCode: "NV004", fullName: "Phạm Minh Đức", department: "Nhân sự", baseSalary: 13000000, allowance: 2500000, ot: 1500000, bonus: 800000, insurance: 1365000, tax: 950000, deduction: 0, netPay: 15485000 },
  { stt: 5, employeeCode: "NV005", fullName: "Hoàng Thị Em", department: "Marketing", baseSalary: 14000000, allowance: 2500000, ot: 2000000, bonus: 1000000, insurance: 1470000, tax: 1100000, deduction: 0, netPay: 16930000 },
  { stt: 6, employeeCode: "NV006", fullName: "Võ Thanh Phong", department: "Vận hành", baseSalary: 11000000, allowance: 2000000, ot: 1800000, bonus: 600000, insurance: 1155000, tax: 750000, deduction: 0, netPay: 13495000 },
  { stt: 7, employeeCode: "NV007", fullName: "Đặng Thị Giang", department: "Kinh doanh", baseSalary: 15000000, allowance: 3000000, ot: 2200000, bonus: 1500000, insurance: 1575000, tax: 1300000, deduction: 0, netPay: 18825000 },
  { stt: 8, employeeCode: "NV008", fullName: "Bùi Văn Hải", department: "Kỹ thuật", baseSalary: 18000000, allowance: 3500000, ot: 3000000, bonus: 1500000, insurance: 1890000, tax: 2000000, deduction: 0, netPay: 22110000 },
]

function formatCurrency(value: number): string {
  return value.toLocaleString("vi-VN") + "₫"
}

export default function PayrollTable() {
  const totals = payrollData.reduce(
    (acc, row) => ({
      baseSalary: acc.baseSalary + row.baseSalary,
      allowance: acc.allowance + row.allowance,
      ot: acc.ot + row.ot,
      bonus: acc.bonus + row.bonus,
      insurance: acc.insurance + row.insurance,
      tax: acc.tax + row.tax,
      deduction: acc.deduction + row.deduction,
      netPay: acc.netPay + row.netPay,
    }),
    { baseSalary: 0, allowance: 0, ot: 0, bonus: 0, insurance: 0, tax: 0, deduction: 0, netPay: 0 }
  )

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <th className="px-4 py-3">STT</th>
              <th className="px-4 py-3 whitespace-nowrap">Mã NV</th>
              <th className="px-4 py-3 whitespace-nowrap">Họ tên</th>
              <th className="px-4 py-3 whitespace-nowrap">Phòng ban</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Lương CB</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Phụ cấp</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">OT</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Thưởng</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">BHXH</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Thuế</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Khấu trừ</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Thực nhận</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payrollData.map((row) => (
              <tr key={row.employeeCode} className="hover:bg-gray-50/50">
                <td className="px-4 py-3">{row.stt}</td>
                <td className="px-4 py-3 font-medium">{row.employeeCode}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.fullName}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.department}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(row.baseSalary)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(row.allowance)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(row.ot)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(row.bonus)}</td>
                <td className="px-4 py-3 text-right text-red-600">{formatCurrency(row.insurance)}</td>
                <td className="px-4 py-3 text-right text-red-600">{formatCurrency(row.tax)}</td>
                <td className="px-4 py-3 text-right text-red-600">{formatCurrency(row.deduction)}</td>
                <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrency(row.netPay)}</td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-bold">
              <td className="px-4 py-3" colSpan={4}>Tổng cộng</td>
              <td className="px-4 py-3 text-right">{formatCurrency(totals.baseSalary)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(totals.allowance)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(totals.ot)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(totals.bonus)}</td>
              <td className="px-4 py-3 text-right text-red-600">{formatCurrency(totals.insurance)}</td>
              <td className="px-4 py-3 text-right text-red-600">{formatCurrency(totals.tax)}</td>
              <td className="px-4 py-3 text-right text-red-600">{formatCurrency(totals.deduction)}</td>
              <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrency(totals.netPay)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Hiển thị 1-8 / 8 kết quả</span>
        <div className="flex items-center gap-2">
          <button
            disabled
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Trước
          </button>
          <button
            disabled
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  )
}
