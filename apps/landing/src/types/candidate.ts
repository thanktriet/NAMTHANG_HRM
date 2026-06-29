export interface Candidate {
  id: string;
  maUngTuyen: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: "nam" | "nu";
  cccd: string;
  ngayCap: string;
  noiCap: string;
  diaChiThuongTru: string;
  diaChiHienTai: string;
  email: string;
  sdt: string;
  viTriUngTuyen: string;
  hangGPLX: string;
  kinhNghiem: string;
  congTyGanNhat?: string;
  thoiGianCongTac?: string;
  mucLuongMongMuon?: string;
  trangThai: ApplicationStatus;
  ngayNop: string;
}

export type ApplicationStatus =
  | "da_nhan_ho_so"
  | "dang_danh_gia"
  | "moi_phong_van"
  | "cho_nhan_viec"
  | "da_nhan_viec"
  | "khong_phu_hop";

export interface ApplicationForm {
  // Step 1: Personal info
  hoTen: string;
  ngaySinh: string;
  gioiTinh: "nam" | "nu";
  cccd: string;
  ngayCap: string;
  noiCap: string;
  diaChiThuongTru: string;
  diaChiHienTai: string;
  email: string;
  sdt: string;
  // Step 2: Career info
  viTriUngTuyen: string;
  hangGPLX: string;
  kinhNghiem: string;
  congTyGanNhat?: string;
  thoiGianCongTac?: string;
  mucLuongMongMuon?: string;
  // Step 3: Documents
  cccdTruoc?: File | null;
  cccdSau?: File | null;
  gplx?: File | null;
  soYeuLyLich?: File | null;
  giayKhamSK?: File | null;
  // Step 4: Media
  anhChanDung?: File | null;
  anhToanThan?: File | null;
  videoXacMinh?: File | null;
  // Step 5: Commitments
  camKet1: boolean;
  camKet2: boolean;
  camKet3: boolean;
}

export interface LookupResult {
  maUngTuyen: string;
  hoTen: string;
  viTriUngTuyen: string;
  ngayNop: string;
  trangThai: ApplicationStatus;
  lichSu: StatusHistory[];
}

export interface StatusHistory {
  trangThai: ApplicationStatus;
  ngay: string;
  ghiChu?: string;
}
