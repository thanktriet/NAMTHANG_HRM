"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const pipelineStages = [
  { label: "Tổng ứng viên", count: 128, color: "bg-blue-500" },
  { label: "Đang xử lý", count: 78, color: "bg-yellow-500" },
  { label: "Phỏng vấn", count: 32, color: "bg-purple-500" },
  { label: "Đạt", count: 16, color: "bg-green-500" },
  { label: "Nhận việc", count: 8, color: "bg-emerald-500" },
  { label: "Không đạt", count: 5, color: "bg-red-500" },
];

export function RecruitmentPipeline() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Tuyển dụng - Pipeline</CardTitle>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Tạo tin tuyển dụng
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-6">
          {pipelineStages.map((stage) => (
            <div key={stage.label} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${stage.color}`} />
              <div className="text-center">
                <p className="text-xl font-bold">{stage.count}</p>
                <p className="text-xs text-muted-foreground">{stage.label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
