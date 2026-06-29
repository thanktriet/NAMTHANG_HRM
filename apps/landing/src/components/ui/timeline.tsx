import { clsx } from "clsx";
import { Check, Clock, X as XIcon } from "lucide-react";
import type { ApplicationStatus } from "@/types/candidate";

interface TimelineStep {
  key: ApplicationStatus;
  label: string;
}

const STEPS: TimelineStep[] = [
  { key: "da_nhan_ho_so", label: "Đã nhận hồ sơ" },
  { key: "dang_danh_gia", label: "Đang đánh giá" },
  { key: "moi_phong_van", label: "Mời phỏng vấn" },
  { key: "cho_nhan_viec", label: "Chờ nhận việc" },
  { key: "da_nhan_viec", label: "Đã nhận việc" },
  { key: "khong_phu_hop", label: "Không phù hợp" },
];

interface TimelineProps {
  currentStatus: ApplicationStatus;
  ngayNop: string;
}

export function Timeline({ currentStatus, ngayNop }: TimelineProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);
  const isRejected = currentStatus === "khong_phu_hop";

  return (
    <div className="relative pl-8 py-4">
      {STEPS.map((step, index) => {
        const isCompleted = !isRejected && index < currentIndex;
        const isActive = index === currentIndex;
        const isRejectedStep = isRejected && step.key === "khong_phu_hop";

        return (
          <div key={step.key} className="relative pb-6 last:pb-0">
            {/* Vertical line */}
            {index < STEPS.length - 1 && (
              <div
                className={clsx("absolute left-[-20px] top-6 w-0.5 h-full", {
                  "bg-green-500": isCompleted,
                  "bg-gray-200": !isCompleted,
                })}
              />
            )}
            {/* Dot */}
            <div
              className={clsx(
                "absolute left-[-28px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center",
                {
                  "bg-green-500 text-white": isCompleted,
                  "bg-primary text-white ring-4 ring-primary/20": isActive && !isRejectedStep,
                  "bg-red-500 text-white ring-4 ring-red-100": isRejectedStep,
                  "bg-gray-200": !isCompleted && !isActive && !isRejectedStep,
                }
              )}
            >
              {isCompleted && <Check className="w-3 h-3" />}
              {isActive && !isRejectedStep && <Clock className="w-3 h-3" />}
              {isRejectedStep && <XIcon className="w-3 h-3" />}
            </div>
            {/* Content */}
            <div>
              <p
                className={clsx("text-sm font-medium", {
                  "text-green-700": isCompleted,
                  "text-primary": isActive && !isRejectedStep,
                  "text-red-600": isRejectedStep,
                  "text-gray-400": !isCompleted && !isActive && !isRejectedStep,
                })}
              >
                {step.label}
              </p>
              {(isCompleted || isActive) && (
                <p className="text-xs text-gray-500 mt-0.5">{ngayNop}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
