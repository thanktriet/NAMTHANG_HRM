"use client";

import { useFormContext } from "react-hook-form";
import type { ApplicationForm } from "@/types/candidate";

export function CommitmentStep() {
  const { register, formState: { errors } } = useFormContext<ApplicationForm>();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Cam kết</h2>
      <p className="text-sm text-gray-500">Vui lòng đọc kỹ và đồng ý các cam kết sau để hoàn tất hồ sơ ứng tuyển.</p>

      <div className="space-y-4">
        <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            {...register("camKet1")}
            className="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <span className="text-sm text-gray-700">
            Tôi cam kết toàn bộ thông tin cung cấp trong hồ sơ này là chính xác và trung thực.
            Tôi hiểu rằng việc cung cấp thông tin sai lệch có thể dẫn đến việc hủy bỏ đơn ứng tuyển
            hoặc chấm dứt hợp đồng lao động.
          </span>
        </label>
        {errors.camKet1 && <p className="text-xs text-red-500 ml-7">{errors.camKet1.message}</p>}

        <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            {...register("camKet2")}
            className="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <span className="text-sm text-gray-700">
            Tôi đồng ý cho phép Tập đoàn Nam Thắng thu thập, lưu trữ và xử lý thông tin cá nhân
            của tôi cho mục đích tuyển dụng theo quy định của Luật Bảo vệ dữ liệu cá nhân.
          </span>
        </label>
        {errors.camKet2 && <p className="text-xs text-red-500 ml-7">{errors.camKet2.message}</p>}

        <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            {...register("camKet3")}
            className="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <span className="text-sm text-gray-700">
            Tôi cam kết tuân thủ mọi quy định và nội quy của công ty nếu được tuyển dụng,
            bao gồm quy định về an toàn giao thông, bảo quản phương tiện và chấp hành lệnh điều xe.
          </span>
        </label>
        {errors.camKet3 && <p className="text-xs text-red-500 ml-7">{errors.camKet3.message}</p>}
      </div>
    </div>
  );
}
