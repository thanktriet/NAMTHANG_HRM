/**
 * Định nghĩa các event patterns cho Recruitment Service
 */
export const RecruitmentEvents = {
  // Ứng viên
  CANDIDATE_CREATED: 'candidate.created',
  CANDIDATE_HIRED: 'candidate.hired',
  CANDIDATE_STATUS_CHANGED: 'candidate.status.changed',

  // Lịch phỏng vấn
  INTERVIEW_SCHEDULED: 'interview.scheduled',
  INTERVIEW_COMPLETED: 'interview.completed',

  // Tin tuyển dụng
  JOB_POSTING_PUBLISHED: 'job-posting.published',
  JOB_POSTING_CLOSED: 'job-posting.closed',
} as const;

/**
 * Payload cho event candidate.hired
 * Dùng để trigger tạo hồ sơ nhân viên bên Employee Service
 */
export interface CandidateHiredPayload {
  candidateId: string;
  fullName: string;
  dateOfBirth: Date;
  gender: string;
  idCardNumber: string;
  email: string;
  phone: string;
  position: string;
  department?: string;
  startDate?: Date;
}

export interface CandidateCreatedPayload {
  candidateId: string;
  fullName: string;
  code: string;
  positionApplied: string;
}

export interface InterviewScheduledPayload {
  interviewId: string;
  candidateId: string;
  candidateName: string;
  scheduledAt: Date;
  location?: string;
  interviewerIds: string[];
}
