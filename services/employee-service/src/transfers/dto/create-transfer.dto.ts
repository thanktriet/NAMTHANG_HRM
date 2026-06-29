import { IsString, IsNotEmpty, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateTransferDto {
  @IsString({ message: 'Mã nhân viên không hợp lệ' })
  @IsNotEmpty({ message: 'Mã nhân viên không được để trống' })
  employeeId: string;

  @IsString({ message: 'Mã phòng ban cũ không hợp lệ' })
  @IsOptional()
  fromDepartmentId?: string;

  @IsString({ message: 'Mã phòng ban mới không hợp lệ' })
  @IsOptional()
  toDepartmentId?: string;

  @IsString({ message: 'Mã chức vụ cũ không hợp lệ' })
  @IsOptional()
  fromPositionId?: string;

  @IsString({ message: 'Mã chức vụ mới không hợp lệ' })
  @IsOptional()
  toPositionId?: string;

  @IsString({ message: 'Mã tổ chức cũ không hợp lệ' })
  @IsOptional()
  fromOrganizationId?: string;

  @IsString({ message: 'Mã tổ chức mới không hợp lệ' })
  @IsOptional()
  toOrganizationId?: string;

  @IsDateString({}, { message: 'Ngày hiệu lực không đúng định dạng' })
  @IsNotEmpty({ message: 'Ngày hiệu lực không được để trống' })
  effectiveDate: string;

  @IsString({ message: 'Lý do phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(500, { message: 'Lý do không được vượt quá 500 ký tự' })
  reason?: string;

  @IsString({ message: 'Số quyết định phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(50, { message: 'Số quyết định không được vượt quá 50 ký tự' })
  decisionNumber?: string;
}
