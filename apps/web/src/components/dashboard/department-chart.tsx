"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Kinh doanh", value: 120 },
  { name: "Vận tải", value: 245 },
  { name: "Kế toán", value: 45 },
  { name: "Nhân sự", value: 38 },
  { name: "IT", value: 28 },
  { name: "Khác", value: 110 },
];

const COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f97316", "#06b6d4", "#6b7280"];

export function DepartmentChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nhân sự theo phòng ban</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-2xl font-bold"
            >
              586
            </text>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
