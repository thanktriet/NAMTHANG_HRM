"use client";

import { useFormContext, Controller } from "react-hook-form";
import type { ApplicationForm } from "@/types/candidate";
import { DateSelect } from "@/components/ui/date-select";

export function PersonalInfoStep() {
  const { register, control, formState: { errors } } = useFormContext<ApplicationForm>();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
        <input
          {...register("hoTen")}
          placeholder="Nguyễn Văn A"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
        {errors.hoTen && <p className="mt-1 text-xs text-red-500">{errors.hoTen.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh *</label>
        <Controller
          control={control}
          name="ngaySinh"
          render={({ field }) => (
            <DateSelect
              value={field.value}
              onChange={field.onChange}
              fromYear={1960}
              toYear={new Date().getFullYear() - 16}
            />
          )}
        />
        {errors.ngaySinh && <p className="mt-1 text-xs text-red-500">{errors.ngaySinh.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính *</label>
        <select
          {...register("gioiTinh")}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
        >
          <option value="">Chọn</option>
          <option value="nam">Nam</option>
          <option value="nu">Nữ</option>
        </select>
        {errors.gioiTinh && <p className="mt-1 text-xs text-red-500">{errors.gioiTinh.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Số CCCD *</label>
        <input
          {...register("cccd")}
          placeholder="012345678901"
          maxLength={12}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
        {errors.cccd && <p className="mt-1 text-xs text-red-500">{errors.cccd.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cấp *</label>
        <Controller
          control={control}
          name="ngayCap"
          render={({ field }) => (
            <DateSelect
              value={field.value}
              onChange={field.onChange}
              fromYear={2016}
              toYear={new Date().getFullYear()}
              yearDesc={true}
            />
          )}
        />
        {errors.ngayCap && <p className="mt-1 text-xs text-red-500">{errors.ngayCap.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nơi cấp *</label>
        <input
          {...register("noiCap")}
          placeholder="CA TP.HCM"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
        {errors.noiCap && <p className="mt-1 text-xs text-red-500">{errors.noiCap.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ thường trú *</label>
        <input
          {...register("diaChiThuongTru")}
          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
        {errors.diaChiThuongTru && <p className="mt-1 text-xs text-red-500">{errors.diaChiThuongTru.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ hiện tại *</label>
        <input
          {...register("diaChiHienTai")}
          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
        {errors.diaChiHienTai && <p className="mt-1 text-xs text-red-500">{errors.diaChiHienTai.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input
          {...register("email")}
          type="email"
          placeholder="email@example.com"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
        <input
          {...register("sdt")}
          type="tel"
          placeholder="0912345678"
          maxLength={10}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
        {errors.sdt && <p className="mt-1 text-xs text-red-500">{errors.sdt.message}</p>}
      </div>
    </div>
  );
}
