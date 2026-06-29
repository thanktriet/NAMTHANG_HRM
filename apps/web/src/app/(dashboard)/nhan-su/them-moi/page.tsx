"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

const employeeSchema = z.object({
  hoTen: z.string().min(1, "Họ tên không được để trống"),
  ngaySinh: z.string().min(1, "Ngày sinh không được để trống"),
  gioiTinh: z.string().min(1, "Vui lòng chọn giới tính"),
  cccd: z.string().min(9, "CCCD phải có ít nhất 9 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  sdt: z.string().min(10, "Số điện thoại không hợp lệ"),
  diaChi: z.string().min(1, "Địa chỉ không được để trống"),
  departmentId: z.string().min(1, "Vui lòng chọn phòng ban"),
  positionId: z.string().min(1, "Vui lòng chọn chức vụ"),
  organizationId: z.string().min(1, "Vui lòng chọn chi nhánh"),
  hireDate: z.string().min(1, "Ngày vào làm không được để trống"),
  baseSalary: z.string().min(1, "Lương cơ bản không được để trống"),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
  taxCode: z.string().optional(),
  socialInsuranceNumber: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function AddEmployeePage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  const onSubmit = async (data: EmployeeFormData) => {
    // TODO: Call API to create employee
    console.log("Form data:", data);
    router.push("/nhan-su");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/nhan-su")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Thêm nhân viên mới</h1>
          <p className="text-muted-foreground">Nhập thông tin nhân viên vào hệ thống</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Thông tin cá nhân */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Thông tin cá nhân</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Họ và tên <span className="text-destructive">*</span></label>
              <Input placeholder="Nguyễn Văn A" {...register("hoTen")} />
              {errors.hoTen && <p className="text-xs text-destructive">{errors.hoTen.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ngày sinh <span className="text-destructive">*</span></label>
              <Input type="date" {...register("ngaySinh")} />
              {errors.ngaySinh && <p className="text-xs text-destructive">{errors.ngaySinh.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Giới tính <span className="text-destructive">*</span></label>
              <select
                {...register("gioiTinh")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Chọn giới tính</option>
                <option value="nam">Nam</option>
                <option value="nu">Nữ</option>
              </select>
              {errors.gioiTinh && <p className="text-xs text-destructive">{errors.gioiTinh.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CCCD <span className="text-destructive">*</span></label>
              <Input placeholder="079090012345" {...register("cccd")} />
              {errors.cccd && <p className="text-xs text-destructive">{errors.cccd.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email <span className="text-destructive">*</span></label>
              <Input type="email" placeholder="example@namthang.vn" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Số điện thoại <span className="text-destructive">*</span></label>
              <Input placeholder="0901 234 567" {...register("sdt")} />
              {errors.sdt && <p className="text-xs text-destructive">{errors.sdt.message}</p>}
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Địa chỉ <span className="text-destructive">*</span></label>
              <Input placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" {...register("diaChi")} />
              {errors.diaChi && <p className="text-xs text-destructive">{errors.diaChi.message}</p>}
            </div>
          </div>
        </div>

        {/* Thông tin công việc */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Thông tin công việc</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phòng ban <span className="text-destructive">*</span></label>
              <select
                {...register("departmentId")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Chọn phòng ban</option>
                <option value="van-tai">Vận tải</option>
                <option value="hanh-chinh">Hành chính</option>
                <option value="ke-toan">Kế toán</option>
                <option value="nhan-su">Nhân sự</option>
                <option value="kinh-doanh">Kinh doanh</option>
                <option value="cong-nghe">Công nghệ</option>
              </select>
              {errors.departmentId && <p className="text-xs text-destructive">{errors.departmentId.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Chức vụ <span className="text-destructive">*</span></label>
              <select
                {...register("positionId")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Chọn chức vụ</option>
                <option value="tai-xe">Tài xế</option>
                <option value="truong-phong">Trưởng phòng</option>
                <option value="pho-phong">Phó phòng</option>
                <option value="chuyen-vien">Chuyên viên</option>
                <option value="nhan-vien">Nhân viên</option>
              </select>
              {errors.positionId && <p className="text-xs text-destructive">{errors.positionId.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Chi nhánh <span className="text-destructive">*</span></label>
              <select
                {...register("organizationId")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Chọn chi nhánh</option>
                <option value="hcm">Hồ Chí Minh</option>
                <option value="kien-giang">Kiên Giang</option>
                <option value="can-tho">Cần Thơ</option>
                <option value="an-giang">An Giang</option>
                <option value="vinh-long">Vĩnh Long</option>
              </select>
              {errors.organizationId && <p className="text-xs text-destructive">{errors.organizationId.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ngày vào làm <span className="text-destructive">*</span></label>
              <Input type="date" {...register("hireDate")} />
              {errors.hireDate && <p className="text-xs text-destructive">{errors.hireDate.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lương cơ bản <span className="text-destructive">*</span></label>
              <Input type="number" placeholder="10000000" {...register("baseSalary")} />
              {errors.baseSalary && <p className="text-xs text-destructive">{errors.baseSalary.message}</p>}
            </div>
          </div>
        </div>

        {/* Tài khoản ngân hàng */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Tài khoản ngân hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Số tài khoản</label>
              <Input placeholder="0123456789" {...register("bankAccount")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ngân hàng</label>
              <Input placeholder="Vietcombank" {...register("bankName")} />
            </div>
          </div>
        </div>

        {/* Bảo hiểm */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Bảo hiểm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mã số thuế</label>
              <Input placeholder="8012345678" {...register("taxCode")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Số sổ BHXH</label>
              <Input placeholder="0123456789" {...register("socialInsuranceNumber")} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/nhan-su")}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Lưu nhân viên"}
          </Button>
        </div>
      </form>
    </div>
  );
}
