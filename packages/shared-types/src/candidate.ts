/**
 * Kiểu dữ liệu liên quan đến Ứng viên
 */

/** Trạng thái ứng viên */
export enum CandidateStatus {
  NEW = 'NEW',
  SCREENING = 'SCREENING',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

/** Nguồn ứng viên */
export enum CandidateSource {
  WEBSITE = 'WEBSITE',
  REFERRAL = 'REFERRAL',
  LINKEDIN = 'LINKEDIN',
  JOB_BOARD = 'JOB_BOARD',
  HEADHUNT = 'HEADHUNT',
  OTHER = 'OTHER',
}

/** Thông tin ứng viên */
export interface Candidate {
  id: string;
  /** Mã ứng viên (VD: UV-0001) */
  candidateCode: string;
  /** Họ và tên */
  fullName: string;
  /** Email */
  email: string;
  /** Số điện thoại */
  phone?: string;
  /** Vị trí ứng tuyển */
  appliedPosition: string;
  /** ID phòng ban ứng tuyển */
  departmentId?: string;
  /** Tên phòng ban */
  departmentName?: string;
  /** Trạng thái */
  status: CandidateStatus;
  /** Nguồn ứng viên */
  source: CandidateSource;
  /** Link CV */
  cvUrl?: string;
  /** Năm kinh nghiệm */
  experienceYears?: number;
  /** Mức lương mong muốn */
  expectedSalary?: number;
  /** Ghi chú */
  notes?: string;
  /** Ngày ứng tuyển */
  appliedDate: string;
  /** Ngày tạo */
  createdAt: string;
  /** Ngày cập nhật */
  updatedAt: string;
}

/** DTO tạo mới ứng viên */
export interface CreateCandidateDto {
  fullName: string;
  email: string;
  phone?: string;
  appliedPosition: string;
  departmentId?: string;
  source: CandidateSource;
  cvUrl?: string;
  experienceYears?: number;
  expectedSalary?: number;
  notes?: string;
}

/** DTO cập nhật ứng viên */
export interface UpdateCandidateDto extends Partial<CreateCandidateDto> {
  status?: CandidateStatus;
}

/** Bộ lọc tìm kiếm ứng viên */
export interface CandidateFilter {
  search?: string;
  status?: CandidateStatus;
  source?: CandidateSource;
  departmentId?: string;
  page?: number;
  limit?: number;
}
