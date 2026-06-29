"use client"

import { StatsCard } from "@/components/shared/stats-card";
import { Users, Briefcase, UserMinus, Wallet } from "lucide-react";

export function StatsRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Tổng nhân sự"
        value="586"
        icon={Users}
        delta={{ value: 12, type: "increase" }}
        className="border-l-4 border-l-blue-500"
      />
      <StatsCard
        title="Đang làm việc"
        value="512"
        icon={Briefcase}
        delta={{ value: 3, type: "increase" }}
        className="border-l-4 border-l-green-500"
      />
      <StatsCard
        title="Nghỉ việc tháng này"
        value="34"
        icon={UserMinus}
        delta={{ value: 5, type: "decrease" }}
        className="border-l-4 border-l-orange-500"
      />
      <StatsCard
        title="Quỹ lương tháng"
        value="1.236.000.000₫"
        icon={Wallet}
        delta={{ value: 8, type: "increase" }}
        className="border-l-4 border-l-purple-500"
      />
    </div>
  );
}
