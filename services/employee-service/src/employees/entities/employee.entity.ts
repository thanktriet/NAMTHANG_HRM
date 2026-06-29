/** Entity class cho response nhân viên */
export class EmployeeEntity {
  id: string;
  employeeCode: string;
  fullName: string;
  dateOfBirth: Date;
  gender: string;
  idCardNumber: string;
  idCardDate: Date | null;
  idCardPlace: string | null;
  permanentAddress: string | null;
  currentAddress: string | null;
  email: string;
  phone: string;
  departmentId: string;
  positionId: string;
  organizationId: string;
  hireDate: Date;
  status: string;
  baseSalary: number | null;
  bankAccount: string | null;
  bankName: string | null;
  taxCode: string | null;
  socialInsuranceNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  // Relations
  department?: any;
  position?: any;
  organization?: any;

  constructor(partial: Partial<EmployeeEntity>) {
    Object.assign(this, partial);
  }
}
