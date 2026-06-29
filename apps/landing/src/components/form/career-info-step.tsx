"use client";

import { useFormContext } from "react-hook-form";
import type { ApplicationForm } from "@/types/candidate";

export function CareerInfoStep() {
  const { register, formState: { errors } } = useFormContext<ApplicationForm>();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Thông tin nghề nghiệp</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí ứng tuyển *</label>
        <select
          {...register("viTriUngTuyen")}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
        >
          <option value="">Chọn vị trí</option>
          <option value="tai_xe_container">Tài xế Container</option>
          <option value="tai_xe_dau_keo">Tài xế Đầu kéo</option>
          <option value="tai_xe_tai_nang">Tài xế Tải nặng</option>
          <option value="tai_xe_tai_nhe">Tài xế Tải nhẹ</option>
        </select>
        {errors.viTriUngTuyen && <p className="mt-1 text-xs text-red-500">{errors.viTriUngTuyen.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hạng GPLX *</label>
        <select
          {...register("hangGPLX")}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
        >
          <option value="">Chọn hạng</option>
          <option value="B2">B2</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
          <option value="FC">FC</option>
        </select>
        {errors.hangGPLX && <p className="mt-1 text-xs text-red-500">{errors.hangGPLX.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm lái xe *</label>
        <select
          {...register("kinhNghiem")}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
        >
          <option value="">Chọn kinh nghiệm</option>
          <option value="duoi_1_nam">Dưới 1 năm</option>
          <option value="1_3_nam">1 - 3 năm</option>
          <option value="3_5_nam">3 - 5 năm</option>
          <option value="tren_5_nam">Trên 5 năm</option>
        </select>
        {errors.kinhNghiem && <p className="mt-1 text-xs text-red-500">{errors.kinhNghiem.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Công ty gần nhất</label>
        <input
          {...register("congTyGanNhat")}
          placeholder="Tên công ty"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian công tác</label>
        <input
          {...register("thoiGianCongTac")}
          placeholder="VD: 2 năm 3 tháng"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mức lương mong muốn</label>
        <input
          {...register("mucLuongMongMuon")}
          placeholder="VD: 15,000,000 VNĐ"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
      </div>
    </div>
  );
}
