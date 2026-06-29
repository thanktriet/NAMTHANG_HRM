"use client";

import { useFormContext, Controller } from "react-hook-form";
import { FileUpload } from "@/components/ui/file-upload";
import type { ApplicationForm } from "@/types/candidate";

export function DocumentsStep() {
  const { control, formState: { errors } } = useFormContext<ApplicationForm>();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Upload giấy tờ</h2>
      <p className="text-sm text-gray-500">Vui lòng tải lên các giấy tờ cần thiết. Chấp nhận file ảnh (JPG, PNG) hoặc PDF.</p>

      <Controller
        name="cccdTruoc"
        control={control}
        render={({ field }) => (
          <FileUpload
            label="CCCD mặt trước *"
            accept="image/*,.pdf"
            onChange={field.onChange}
            value={field.value as File | null}
            error={errors.cccdTruoc?.message as string}
            type="image"
          />
        )}
      />

      <Controller
        name="cccdSau"
        control={control}
        render={({ field }) => (
          <FileUpload
            label="CCCD mặt sau *"
            accept="image/*,.pdf"
            onChange={field.onChange}
            value={field.value as File | null}
            error={errors.cccdSau?.message as string}
            type="image"
          />
        )}
      />

      <Controller
        name="gplx"
        control={control}
        render={({ field }) => (
          <FileUpload
            label="Giấy phép lái xe *"
            accept="image/*,.pdf"
            onChange={field.onChange}
            value={field.value as File | null}
            error={errors.gplx?.message as string}
            type="image"
          />
        )}
      />

      <Controller
        name="soYeuLyLich"
        control={control}
        render={({ field }) => (
          <FileUpload
            label="Sơ yếu lý lịch"
            accept="image/*,.pdf,.doc,.docx"
            onChange={field.onChange}
            value={field.value as File | null}
            error={errors.soYeuLyLich?.message as string}
            type="document"
          />
        )}
      />

      <Controller
        name="giayKhamSK"
        control={control}
        render={({ field }) => (
          <FileUpload
            label="Giấy khám sức khỏe"
            accept="image/*,.pdf"
            onChange={field.onChange}
            value={field.value as File | null}
            error={errors.giayKhamSK?.message as string}
            type="document"
          />
        )}
      />
    </div>
  );
}
