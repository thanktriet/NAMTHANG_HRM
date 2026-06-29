import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO tạo phiếu giao tài sản cho nhân viên
 */
export class CreateAssignmentDto {
  /** Mã tài sản */
  @IsNotEmpty({ message: 'Mã tài sản không được để trống' })
  @IsString({ message: 'Mã tài sản phải là chuỗi ký tự' })
  assetId: string;

  /** Mã nhân viên */
  @IsNotEmpty({ message: 'Mã nhân viên không được để trống' })
  @IsString({ message: 'Mã nhân viên phải là chuỗi ký tự' })
  employeeId: string;

  /** Tình trạng tài sản khi giao */
  @IsOptional()
  @IsString({ message: 'Tình trạng khi giao phải là chuỗi ký tự' })
  conditionOnAssign?: string;

  /** Ghi chú */
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  notes?: string;
}
