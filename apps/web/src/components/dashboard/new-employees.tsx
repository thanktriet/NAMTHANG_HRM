"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const newEmployees = [
  {
    id: 1,
    name: "Nguyễn Văn Hùng",
    position: "Nhân viên kinh doanh",
    department: "Phòng Kinh doanh",
    joinDate: "15/06/2026",
    initials: "NH",
  },
  {
    id: 2,
    name: "Trần Thị Mai",
    position: "Kế toán viên",
    department: "Phòng Kế toán",
    joinDate: "14/06/2026",
    initials: "TM",
  },
  {
    id: 3,
    name: "Lê Hoàng Nam",
    position: "Lái xe",
    department: "Phòng Vận tải",
    joinDate: "13/06/2026",
    initials: "LN",
  },
  {
    id: 4,
    name: "Phạm Thị Lan",
    position: "Nhân viên IT",
    department: "Phòng IT",
    joinDate: "12/06/2026",
    initials: "PL",
  },
  {
    id: 5,
    name: "Đỗ Minh Tuấn",
    position: "Trưởng nhóm KD",
    department: "Phòng Kinh doanh",
    joinDate: "10/06/2026",
    initials: "ĐT",
  },
];

const avatarColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-cyan-500",
];

export function NewEmployees() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nhân viên mới</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {newEmployees.map((employee, index) => (
            <div
              key={employee.id}
              className="flex-shrink-0 w-48 rounded-lg border p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full ${avatarColors[index]} flex items-center justify-center`}
                >
                  <span className="text-sm font-semibold text-white">
                    {employee.initials}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{employee.name}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{employee.position}</p>
                <p className="text-xs text-muted-foreground">{employee.department}</p>
                <p className="text-xs font-medium">Ngày vào: {employee.joinDate}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
