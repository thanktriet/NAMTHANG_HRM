"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Bell, RefreshCw } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface License {
  id: string
  driverName: string
  licenseNumber: string
  licenseClass: string
  issueDate: string
  expiryDate: string
  daysRemaining: number
  status: "valid" | "expiring" | "expired"
}

interface LicenseTableProps {
  licenses: License[]
}

function getStatusBadge(status: License["status"]) {
  const config = {
    valid: { label: "Còn hiệu lực", className: "bg-green-100 text-green-700 border-green-200" },
    expiring: { label: "Sắp hết hạn", className: "bg-orange-100 text-orange-700 border-orange-200" },
    expired: { label: "Hết hạn", className: "bg-red-100 text-red-700 border-red-200" },
  }
  const { label, className } = config[status]
  return <Badge variant="outline" className={className}>{label}</Badge>
}

function getRowClassName(status: License["status"]) {
  if (status === "expired") return "bg-red-50/50"
  if (status === "expiring") return "bg-orange-50/50"
  return ""
}

export function LicenseTable({ licenses }: LicenseTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tài xế</TableHead>
            <TableHead>Số GPLX</TableHead>
            <TableHead>Hạng</TableHead>
            <TableHead>Ngày cấp</TableHead>
            <TableHead>Hết hạn</TableHead>
            <TableHead className="text-center">Còn lại</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {licenses.map((license) => (
            <TableRow key={license.id} className={getRowClassName(license.status)}>
              <TableCell className="font-medium">{license.driverName}</TableCell>
              <TableCell>{license.licenseNumber}</TableCell>
              <TableCell>{license.licenseClass}</TableCell>
              <TableCell>{license.issueDate}</TableCell>
              <TableCell className={cn(
                license.status === "expired" && "text-destructive font-medium",
                license.status === "expiring" && "text-orange-600 font-medium"
              )}>
                {license.expiryDate}
              </TableCell>
              <TableCell className="text-center">
                <span className={cn(
                  "font-medium",
                  license.daysRemaining <= 0 && "text-destructive",
                  license.daysRemaining > 0 && license.daysRemaining <= 30 && "text-orange-600",
                  license.daysRemaining > 30 && "text-muted-foreground"
                )}>
                  {license.daysRemaining <= 0 ? "Đã hết hạn" : `${license.daysRemaining} ngày`}
                </span>
              </TableCell>
              <TableCell>{getStatusBadge(license.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
