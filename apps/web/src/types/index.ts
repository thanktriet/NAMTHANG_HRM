export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: "active" | "inactive" | "probation";
  joinDate: string;
  avatar?: string;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  status: "new" | "screening" | "interview" | "offer" | "hired" | "rejected";
  appliedDate: string;
  resumeUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  message?: string;
}
