import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  UserRoundPlus,
  Receipt,
  FileText,
  BarChart3,
} from "lucide-react";

const actions = [
  { label: "Tạo tin tuyển dụng", icon: UserPlus },
  { label: "Thêm nhân viên", icon: UserRoundPlus },
  { label: "Lập phiếu lương", icon: Receipt },
  { label: "Tạo hợp đồng", icon: FileText },
  { label: "Báo cáo tháng", icon: BarChart3 },
];

export function QuickActions() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-primary/5 hover:border-primary transition-colors"
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
