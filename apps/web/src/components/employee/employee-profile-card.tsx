import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Mail, Phone, Building2, MapPin, Hash } from "lucide-react";

interface EmployeeProfileCardProps {
  employee: {
    hoTen: string;
    maNV: string;
    chucVu: string;
    trangThai: "dang-lam" | "thu-viec" | "nghi-viec";
    email: string;
    sdt: string;
    phongBan: string;
    chiNhanh: string;
  };
}

const statusConfig: Record<
  string,
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

export function EmployeeProfileCard({ employee }: EmployeeProfileCardProps) {
  const status = statusConfig[employee.trangThai];

  return (
    <div className="rounded-lg border bg-card p-6 space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div
          className={cn(
            "flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold text-white",
            getAvatarColor(employee.hoTen)
          )}
        >
          {getInitials(employee.hoTen)}
        </div>
        <div>
          <h2 className="text-xl font-bold">{employee.hoTen}</h2>
          <p className="text-sm text-muted-foreground">{employee.chucVu}</p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {/* Quick Info */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center gap-3 text-sm">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Mã NV:</span>
          <span className="ml-auto font-mono">{employee.maNV}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Email:</span>
          <span className="ml-auto">{employee.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">SĐT:</span>
          <span className="ml-auto">{employee.sdt}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Phòng ban:</span>
          <span className="ml-auto">{employee.phongBan}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Chi nhánh:</span>
          <span className="ml-auto">{employee.chiNhanh}</span>
        </div>
      </div>
    </div>
  );
}
