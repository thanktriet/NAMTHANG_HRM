"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, AlertTriangle, FileText, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationType = "info" | "warning" | "success" | "document";

interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  time: string;
}

const notifications: Notification[] = [
  {
    id: 1,
    type: "info",
    message: "Có 3 đơn xin nghỉ phép chờ duyệt",
    time: "5 phút trước",
  },
  {
    id: 2,
    type: "warning",
    message: "Hợp đồng của Nguyễn Văn A sắp hết hạn (còn 7 ngày)",
    time: "1 giờ trước",
  },
  {
    id: 3,
    type: "success",
    message: "Trần Thị B đã hoàn thành thử việc",
    time: "2 giờ trước",
  },
  {
    id: 4,
    type: "document",
    message: "Báo cáo nhân sự tháng 5 đã sẵn sàng",
    time: "3 giờ trước",
  },
  {
    id: 5,
    type: "warning",
    message: "5 nhân viên chưa chấm công hôm nay",
    time: "4 giờ trước",
  },
];

const iconMap: Record<NotificationType, { icon: typeof Bell; color: string }> = {
  info: { icon: Bell, color: "text-blue-500 bg-blue-50" },
  warning: { icon: AlertTriangle, color: "text-orange-500 bg-orange-50" },
  success: { icon: UserCheck, color: "text-green-500 bg-green-50" },
  document: { icon: FileText, color: "text-purple-500 bg-purple-50" },
};

export function NotificationsWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Thông báo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => {
            const { icon: Icon, color } = iconMap[notification.type];
            return (
              <div
                key={notification.id}
                className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors"
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                    color
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {notification.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-center">
          <a
            href="#"
            className="text-sm text-primary hover:underline"
          >
            Xem tất cả
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
