"use client"

import { Printer, Download } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PayslipCard() {
  return (
    <div className="space-y-4">
      {/* Employee selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Nhân viên:</label>
        <select className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
          <option>NV001 - Nguyễn Văn An</option>
          <option>NV002 - Trần Thị Bình</option>
          <option>NV003 - Lê Hoàng Cường</option>
          <option>NV004 - Phạm Minh Đức</option>
          <option>NV005 - Hoàng Thị Em</option>
          <option>NV006 - Võ Thanh Phong</option>
          <option>NV007 - Đặng Thị Giang</option>
          <option>NV008 - Bùi Văn Hải</option>
        </select>
      </div>

      {/* Payslip card */}
      <div className="mx-auto max-w-2xl rounded-lg border bg-white p-8 shadow-sm print:shadow-none">
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-sm font-bold uppercase text-gray-900">
            CÔNG TY TNHH TẬP ĐOÀN NAM THẮNG
          </h2>
          <p className="text-xs text-muted-foreground">
            Địa chỉ: 123 Nguyễn Văn Linh, Quận 7, TP.HCM
          </p>
          <div className="pt-3">
            <h3 className="text-lg font-bold text-gray-900">
              PHIẾU LƯƠNG THÁNG 06/2026
            </h3>
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        {/* Employee info */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-6">
          <div>
            <span className="text-muted-foreground">Mã NV:</span>{" "}
            <span className="font-medium">NV001</span>
          </div>
          <div>
            <span className="text-muted-foreground">Họ tên:</span>{" "}
            <span className="font-medium">Nguyễn Văn An</span>
          </div>
          <div>
            <span className="text-muted-foreground">Phòng ban:</span>{" "}
            <span className="font-medium">Kinh doanh</span>
          </div>
          <div>
            <span className="text-muted-foreground">Chức vụ:</span>{" "}
            <span className="font-medium">Trưởng phòng</span>
          </div>
        </div>

        {/* Income and deductions */}
        <div className="grid grid-cols-2 gap-6">
          {/* Income */}
          <div>
            <h4 className="mb-3 font-semibold text-gray-900 border-b pb-2">Thu nhập</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lương cơ bản</span>
                <span>15.000.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phụ cấp</span>
                <span>3.000.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Làm thêm (OT)</span>
                <span>2.500.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thưởng</span>
                <span>1.000.000</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between font-bold">
                <span>Tổng thu nhập</span>
                <span>21.500.000</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h4 className="mb-3 font-semibold text-gray-900 border-b pb-2">Khấu trừ</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">BHXH (10.5%)</span>
                <span className="text-red-600">1.575.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thuế TNCN</span>
                <span className="text-red-600">1.200.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Khấu trừ khác</span>
                <span className="text-red-600">0</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between font-bold">
                <span>Tổng khấu trừ</span>
                <span className="text-red-600">2.775.000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net pay */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">THỰC NHẬN</p>
          <p className="text-2xl font-bold text-blue-600">18.725.000 ₫</p>
          <p className="text-xs text-muted-foreground mt-1 italic">
            Mười tám triệu bảy trăm hai mươi lăm nghìn đồng
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-center gap-3 print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" />
            In phiếu lương
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
            <Download className="h-4 w-4" />
            Tải xuống PDF
          </button>
        </div>
      </div>
    </div>
  )
}
