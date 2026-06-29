"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface EmployeeTabsProps {
  thongTinCaNhan: { label: string; value: string }[];
  giaDinh: { hoTen: string; quanHe: string; namSinh: string; ngheNghiep: string }[];
  hopDong: { loai: string; tuNgay: string; denNgay: string; trangThai: string }[];
  khenThuongKyLuat: { ngay: string; loai: "khen-thuong" | "ky-luat"; noiDung: string; quyetDinh: string }[];
}

const tabs = [
  { id: "thong-tin", label: "Thông tin cá nhân" },
  { id: "gia-dinh", label: "Gia đình" },
  { id: "hop-dong", label: "Hợp đồng" },
  { id: "khen-thuong", label: "Khen thưởng / Kỷ luật" },
];

export function EmployeeTabs({
  thongTinCaNhan,
  giaDinh,
  hopDong,
  khenThuongKyLuat,
}: EmployeeTabsProps) {
  const [activeTab, setActiveTab] = useState("thong-tin");

  return (
    <div className="rounded-lg border bg-card">
      {/* Tab Headers */}
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "thong-tin" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {thongTinCaNhan.map((item, index) => (
              <div key={index} className="space-y-1">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "gia-dinh" && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Quan hệ</TableHead>
                  <TableHead>Năm sinh</TableHead>
                  <TableHead>Nghề nghiệp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {giaDinh.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                      Chưa có thông tin
                    </TableCell>
                  </TableRow>
                ) : (
                  giaDinh.map((member, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{member.hoTen}</TableCell>
                      <TableCell>{member.quanHe}</TableCell>
                      <TableCell>{member.namSinh}</TableCell>
                      <TableCell>{member.ngheNghiep}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "hop-dong" && (
          <div className="space-y-4">
            {hopDong.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Chưa có hợp đồng</p>
            ) : (
              hopDong.map((contract, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <p className="font-medium">{contract.loai}</p>
                    <p className="text-sm text-muted-foreground">
                      {contract.tuNgay} - {contract.denNgay}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium px-2.5 py-0.5 rounded-full",
                      contract.trangThai === "Đang hiệu lực"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    )}
                  >
                    {contract.trangThai}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "khen-thuong" && (
          <div className="space-y-4">
            {khenThuongKyLuat.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>
            ) : (
              <div className="relative border-l-2 border-muted pl-6 space-y-6">
                {khenThuongKyLuat.map((item, index) => (
                  <div key={index} className="relative">
                    <div
                      className={cn(
                        "absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-background",
                        item.loai === "khen-thuong" ? "bg-green-500" : "bg-red-500"
                      )}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {item.loai === "khen-thuong" ? "Khen thưởng" : "Kỷ luật"}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.ngay}</span>
                      </div>
                      <p className="text-sm">{item.noiDung}</p>
                      <p className="text-xs text-muted-foreground">QĐ: {item.quyetDinh}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
