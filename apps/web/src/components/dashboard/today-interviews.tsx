"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const interviews = [
  {
    id: 1,
    time: "09:00",
    candidate: "Nguyễn Thị Hương",
    position: "Nhân viên kinh doanh",
    status: "Hoàn thành",
    statusVariant: "success" as const,
    initials: "NH",
  },
  {
    id: 2,
    time: "10:30",
    candidate: "Trần Văn Đức",
    position: "Lập trình viên Frontend",
    status: "Đang PV",
    statusVariant: "warning" as const,
    initials: "TĐ",
  },
  {
    id: 3,
    time: "14:00",
    candidate: "Lê Thị Phương",
    position: "Kế toán trưởng",
    status: "Sắp diễn ra",
    statusVariant: "secondary" as const,
    initials: "LP",
  },
  {
    id: 4,
    time: "15:30",
    candidate: "Phạm Hoàng Long",
    position: "Quản lý vận tải",
    status: "Sắp diễn ra",
    statusVariant: "secondary" as const,
    initials: "PL",
  },
];

const avatarColors = [
  "bg-emerald-500",
  "bg-amber-500",
  "bg-indigo-500",
  "bg-rose-500",
];

export function TodayInterviews() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Lịch phỏng vấn hôm nay</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {interviews.map((interview, index) => (
            <div
              key={interview.id}
              className="flex items-center gap-4 rounded-lg border p-3"
            >
              <div className="text-center min-w-[50px]">
                <p className="text-sm font-bold">{interview.time}</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div
                className={`h-9 w-9 rounded-full ${avatarColors[index]} flex items-center justify-center flex-shrink-0`}
              >
                <span className="text-xs font-semibold text-white">
                  {interview.initials}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{interview.candidate}</p>
                <p className="text-xs text-muted-foreground">{interview.position}</p>
              </div>
              <Badge variant={interview.statusVariant}>{interview.status}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
