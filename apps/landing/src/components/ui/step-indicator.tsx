"use client";

import { clsx } from "clsx";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                    {
                      "bg-primary text-white": isActive,
                      "bg-green-500 text-white": isCompleted,
                      "bg-gray-200 text-gray-500": !isActive && !isCompleted,
                    }
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {labels && labels[i] && (
                  <span
                    className={clsx("text-xs mt-1 text-center max-w-[60px]", {
                      "text-primary font-medium": isActive,
                      "text-green-600": isCompleted,
                      "text-gray-400": !isActive && !isCompleted,
                    })}
                  >
                    {labels[i]}
                  </span>
                )}
              </div>
              {step < totalSteps && (
                <div
                  className={clsx("flex-1 h-0.5 mx-2", {
                    "bg-green-500": isCompleted,
                    "bg-gray-200": !isCompleted,
                  })}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
