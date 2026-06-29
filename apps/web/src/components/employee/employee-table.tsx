"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Employee {
  id: string;
  maNV: string;
  hoTen: string;
  phongBan: string;
  chucVu: string;
  chiNhanh: string;
  ngayVao: string;
  trangThai: "dang-lam" | "thu-viec" | "nghi-viec";
}

interface EmployeeTableProps {
  data: Employee[];
  onRowClick?: (employee: Employee) => void;
  isLoading?: boolean;
}

const statusConfig: Record<
  Employee["trangThai"],
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  "dang-lam": { label: "Đang làm việc", variant: "success" },
  "thu-viec": { label: "Thử việc", variant: "warning" },
  "nghi-viec": { label: "Nghỉ việc", variant: "destructive" },
};

function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-rose-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function EmployeeTable({ data, onRowClick, isLoading }: EmployeeTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <input type="checkbox" className="rounded border-input" />
            </TableHead>
            <TableHead>Mã NV</TableHead>
            <TableHead>Họ tên</TableHead>
            <TableHead>Phòng ban</TableHead>
            <TableHead>Chức vụ</TableHead>
            <TableHead>Chi nhánh</TableHead>
            <TableHead>Ngày vào</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                Không có dữ liệu nhân viên
              </TableCell>
            </TableRow>
          ) : (
            data.map((employee) => {
              const status = statusConfig[employee.trangThai];
              return (
                <TableRow
                  key={employee.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onRowClick?.(employee)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="rounded border-input" />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{employee.maNV}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white",
                          getAvatarColor(employee.hoTen)
                        )}
                      >
                        {getInitials(employee.hoTen)}
                      </div>
                      <span className="font-medium">{employee.hoTen}</span>
                    </div>
                  </TableCell>
                  <TableCell>{employee.phongBan}</TableCell>
                  <TableCell>{employee.chucVu}</TableCell>
                  <TableCell>{employee.chiNhanh}</TableCell>
                  <TableCell>{employee.ngayVao}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
