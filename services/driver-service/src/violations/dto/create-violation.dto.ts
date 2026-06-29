import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';

/** DTO tạo mới vi phạm giao thông */
export class CreateViolationDto {
  /** Mã nhân viên (lái xe) */
  @IsString()
  @IsNotEmpty({ message: 'Mã nhân viên không được để trống' })
  employeeId: string;

  /** Ngày vi phạm */
  @IsDateString({}, { message: 'Ngày vi phạm không hợp lệ' })
  violationDate: string;

  /** Loại vi phạm */
  @IsString()
  @IsNotEmpty({ message: 'Loại vi phạm không được để trống' })
  violationType: string;

  /** Mô tả chi tiết */
  @IsOptional()
  @IsString()
  description?: string;

  /** Số tiền phạt */
  @IsNumber({}, { message: 'Số tiền phạt phải là số' })
  @Min(0, { message: 'Số tiền phạt không được âm' })
  fineAmount: number;

  /** Địa điểm vi phạm */
  @IsOptional()
  @IsString()
  location?: string;
}
