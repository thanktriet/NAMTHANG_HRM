"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "T1", tuyenMoi: 12, nghiViec: 5, dieuChuyen: 3 },
  { month: "T2", tuyenMoi: 8, nghiViec: 7, dieuChuyen: 2 },
  { month: "T3", tuyenMoi: 15, nghiViec: 4, dieuChuyen: 5 },
  { month: "T4", tuyenMoi: 10, nghiViec: 6, dieuChuyen: 4 },
  { month: "T5", tuyenMoi: 18, nghiViec: 8, dieuChuyen: 3 },
  { month: "T6", tuyenMoi: 14, nghiViec: 5, dieuChuyen: 6 },
  { month: "T7", tuyenMoi: 20, nghiViec: 9, dieuChuyen: 4 },
  { month: "T8", tuyenMoi: 16, nghiViec: 7, dieuChuyen: 5 },
  { month: "T9", tuyenMoi: 11, nghiViec: 6, dieuChuyen: 3 },
  { month: "T10", tuyenMoi: 13, nghiViec: 4, dieuChuyen: 7 },
  { month: "T11", tuyenMoi: 17, nghiViec: 8, dieuChuyen: 2 },
  { month: "T12", tuyenMoi: 22, nghiViec: 10, dieuChuyen: 5 },
];

export function HrChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Biến động nhân sự</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="tuyenMoi"
              name="Tuyển mới"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="nghiViec"
              name="Nghỉ việc"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="dieuChuyen"
              name="Điều chuyển"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
