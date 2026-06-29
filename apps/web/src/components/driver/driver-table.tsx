"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface Driver {
  id: string
  code: string
  name: string
  licenseClass: string
  licenseNumber: string
  licenseExpiry: string
  vehicle: string
  status: "active" | "leave" | "inactive"
  violations: number
}

interface DriverTableProps {
  drivers: Driver[]
}

function getStatusBadge(status: Driver["status"]) {
  const config = {
    active: { label: "Đang hoạt động", className: "bg-green-100 text-green-700 border-green-200" },
    leave: { label: "Nghỉ phép", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    inactive: { label: "Ngừng hoạt động", className: "bg-red-100 text-red-700 border-red-200" },
  }
  const { label, className } = config[status]
  return <Badge variant="outline" className={className}>{label}</Badge>
}

function isExpiringSoon(dateStr: string): boolean {
  const expiry = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays <= 30
}

export function DriverTable({ drivers }: DriverTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Mã NV</TableHead>
            <TableHead>Họ tên</TableHead>
            <TableHead>Hạng GPLX</TableHead>
            <TableHead>Số GPLX</TableHead>
            <TableHead>Hạn GPLX</TableHead>
            <TableHead>Xe phụ trách</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-center">Vi phạm</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell className="font-medium">{driver.code}</TableCell>
              <TableCell>{driver.name}</TableCell>
              <TableCell>{driver.licenseClass}</TableCell>
              <TableCell>{driver.licenseNumber}</TableCell>
              <TableCell className={cn(isExpiringSoon(driver.licenseExpiry) && "text-destructive font-medium")}>
                {driver.licenseExpiry}
              </TableCell>
              <TableCell>{driver.vehicle}</TableCell>
              <TableCell>{getStatusBadge(driver.status)}</TableCell>
              <TableCell className="text-center">
                {driver.violations > 0 ? (
                  <span className="text-destructive font-medium">{driver.violations}</span>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
