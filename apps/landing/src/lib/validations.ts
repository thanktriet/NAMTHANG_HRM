import { z } from "zod";

export const personalInfoSchema = z.object({
  hoTen: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  ngaySinh: z.string().min(1, "Vui lòng nhập ngày sinh"),
  gioiTinh: z.enum(["nam", "nu"], { required_error: "Vui lòng chọn giới tính" }),
  cccd: z.string().length(12, "CCCD phải có 12 số"),
  ngayCap: z.string().min(1, "Vui lòng nhập ngày cấp"),
  noiCap: z.string().min(1, "Vui lòng nhập nơi cấp"),
  diaChiThuongTru: z.string().min(5, "Vui lòng nhập địa chỉ thường trú"),
  diaChiHienTai: z.string().min(5, "Vui lòng nhập địa chỉ hiện tại"),
  email: z.string().email("Email không hợp lệ"),
  sdt: z.string().regex(/^0\d{9}$/, "Số điện thoại không hợp lệ"),
});

export const careerInfoSchema = z.object({
  viTriUngTuyen: z.string().min(1, "Vui lòng chọn vị trí ứng tuyển"),
  hangGPLX: z.string().min(1, "Vui lòng chọn hạng GPLX"),
  kinhNghiem: z.string().min(1, "Vui lòng chọn kinh nghiệm"),
  congTyGanNhat: z.string().optional(),
  thoiGianCongTac: z.string().optional(),
  mucLuongMongMuon: z.string().optional(),
});

export const documentsSchema = z.object({
  cccdTruoc: z.any().refine((file) => file instanceof File, "Vui lòng tải ảnh CCCD mặt trước"),
  cccdSau: z.any().refine((file) => file instanceof File, "Vui lòng tải ảnh CCCD mặt sau"),
  gplx: z.any().refine((file) => file instanceof File, "Vui lòng tải ảnh GPLX"),
  soYeuLyLich: z.any().optional(),
  giayKhamSK: z.any().optional(),
});

export const mediaSchema = z.object({
  anhChanDung: z.any().refine((file) => file instanceof File, "Vui lòng tải ảnh chân dung"),
  anhToanThan: z.any().optional(),
  videoXacMinh: z.any().optional(),
});

export const commitmentSchema = z.object({
  camKet1: z.literal(true, { errorMap: () => ({ message: "Bạn cần đồng ý cam kết này" }) }),
  camKet2: z.literal(true, { errorMap: () => ({ message: "Bạn cần đồng ý cam kết này" }) }),
  camKet3: z.literal(true, { errorMap: () => ({ message: "Bạn cần đồng ý cam kết này" }) }),
});

export type PersonalInfoForm = z.infer<typeof personalInfoSchema>;
export type CareerInfoForm = z.infer<typeof careerInfoSchema>;
export type DocumentsForm = z.infer<typeof documentsSchema>;
export type MediaForm = z.infer<typeof mediaSchema>;
export type CommitmentForm = z.infer<typeof commitmentSchema>;
