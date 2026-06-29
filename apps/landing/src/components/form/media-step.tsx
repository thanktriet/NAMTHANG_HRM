"use client";

import { useFormContext, Controller } from "react-hook-form";
import { FileUpload } from "@/components/ui/file-upload";
import type { ApplicationForm } from "@/types/candidate";

export function MediaStep() {
  const { control, formState: { errors } } = useFormContext<ApplicationForm>();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Hình ảnh & Video</h2>
      <p className="text-sm text-gray-500">Vui lòng tải lên ảnh chân dung rõ mặt và video xác minh ngắn (nếu có).</p>

      <Controller
        name="anhChanDung"
        control={control}
        render={({ field }) => (
          <FileUpload
            label="Ảnh chân dung *"
            accept="image/*"
            onChange={field.onChange}
            value={field.value as File | null}
            error={errors.anhChanDung?.message as string}
            type="image"
          />
        )}
      />

      <Controller
        name="anhToanThan"
        control={control}
        render={({ field }) => (
          <FileUpload
            label="Ảnh toàn thân"
            accept="image/*"
            onChange={field.onChange}
            value={field.value as File | null}
            error={errors.anhToanThan?.message as string}
            type="image"
          />
        )}
      />

      <Controller
        name="videoXacMinh"
        control={control}
        render={({ field }) => (
          <FileUpload
            label="Video xác minh"
            accept="video/*"
            onChange={field.onChange}
            value={field.value as File | null}
            error={errors.videoXacMinh?.message as string}
            type="video"
          />
        )}
      />
    </div>
  );
}
