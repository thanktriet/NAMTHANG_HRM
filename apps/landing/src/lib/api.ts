import axios from "axios";
import type { ApplicationForm, LookupResult } from "@/types/candidate";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export async function submitApplication(data: ApplicationForm): Promise<{ maUngTuyen: string }> {
  const formData = new FormData();

  // Append text fields
  const textFields: (keyof ApplicationForm)[] = [
    "hoTen", "ngaySinh", "gioiTinh", "cccd", "ngayCap", "noiCap",
    "diaChiThuongTru", "diaChiHienTai", "email", "sdt",
    "viTriUngTuyen", "hangGPLX", "kinhNghiem", "congTyGanNhat",
    "thoiGianCongTac", "mucLuongMongMuon",
  ];

  textFields.forEach((field) => {
    const value = data[field];
    if (value && typeof value === "string") {
      formData.append(field, value);
    }
  });

  // Append files
  const fileFields: (keyof ApplicationForm)[] = [
    "cccdTruoc", "cccdSau", "gplx", "soYeuLyLich", "giayKhamSK",
    "anhChanDung", "anhToanThan", "videoXacMinh",
  ];

  fileFields.forEach((field) => {
    const file = data[field];
    if (file instanceof File) {
      formData.append(field, file);
    }
  });

  const response = await apiClient.post("/candidates", formData);
  return response.data;
}

export async function lookupApplication(
  maUngTuyen: string,
  sdt: string
): Promise<LookupResult> {
  const response = await apiClient.get("/candidates/lookup", {
    params: { maUngTuyen, sdt },
  });
  return response.data;
}
