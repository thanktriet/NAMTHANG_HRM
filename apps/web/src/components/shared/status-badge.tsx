import { Badge } from "@/components/ui/badge";

type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled";

const statusConfig: Record<StatusType, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  active: { label: "Đang hoạt động", variant: "success" },
  inactive: { label: "Ngừng hoạt động", variant: "secondary" },
  pending: { label: "Chờ duyệt", variant: "warning" },
  approved: { label: "Đã duyệt", variant: "success" },
  rejected: { label: "Từ chối", variant: "destructive" },
  completed: { label: "Hoàn thành", variant: "default" },
  cancelled: { label: "Đã hủy", variant: "outline" },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) return null;

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
