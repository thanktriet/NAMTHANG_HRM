import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class CreateEmployeeDto {
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @MaxLength(100, { message: 'Họ và tên không được vượt quá 100 ký tự' })
  fullName: string;

  @IsDateString({}, { message: 'Ngày sinh không đúng định dạng' })
  @IsNotEmpty({ message: 'Ngày sinh không được để trống' })
  dateOfBirth: string;

  @IsEnum(Gender, { message: 'Giới tính phải là MALE, FEMALE hoặc OTHER' })
  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  gender: Gender;

  @IsString({ message: 'Số CMND/CCCD phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Số CMND/CCCD không được để trống' })
  @MinLength(9, { message: 'Số CMND/CCCD phải có ít nhất 9 ký tự' })
  @MaxLength(12, { message: 'Số CMND/CCCD không được vượt quá 12 ký tự' })
  idCardNumber: string;

  @IsDateString({}, { message: 'Ngày cấp CMND/CCCD không đúng định dạng' })
  @IsOptional()
  idCardDate?: string;

  @IsString({ message: 'Nơi cấp CMND/CCCD phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(200, { message: 'Nơi cấp không được vượt quá 200 ký tự' })
  idCardPlace?: string;

  @IsString({ message: 'Địa chỉ thường trú phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(500, { message: 'Địa chỉ thường trú không được vượt quá 500 ký tự' })
  permanentAddress?: string;

  @IsString({ message: 'Địa chỉ hiện tại phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(500, { message: 'Địa chỉ hiện tại không được vượt quá 500 ký tự' })
  currentAddress?: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @MinLength(10, { message: 'Số điện thoại phải có ít nhất 10 ký tự' })
  @MaxLength(11, { message: 'Số điện thoại không được vượt quá 11 ký tự' })
  phone: string;

  @IsString({ message: 'Mã phòng ban không hợp lệ' })
  @IsNotEmpty({ message: 'Phòng ban không được để trống' })
  departmentId: string;

  @IsString({ message: 'Mã chức vụ không hợp lệ' })
  @IsNotEmpty({ message: 'Chức vụ không được để trống' })
  positionId: string;

  @IsString({ message: 'Mã tổ chức không hợp lệ' })
  @IsNotEmpty({ message: 'Tổ chức không được để trống' })
  organizationId: string;

  @IsDateString({}, { message: 'Ngày vào làm không đúng định dạng' })
  @IsNotEmpty({ message: 'Ngày vào làm không được để trống' })
  hireDate: string;

  @IsNumber({}, { message: 'Lương cơ bản phải là số' })
  @Min(0, { message: 'Lương cơ bản không được âm' })
  @IsOptional()
  baseSalary?: number;

  @IsString({ message: 'Số tài khoản phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(30, { message: 'Số tài khoản không được vượt quá 30 ký tự' })
  bankAccount?: string;

  @IsString({ message: 'Tên ngân hàng phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(100, { message: 'Tên ngân hàng không được vượt quá 100 ký tự' })
  bankName?: string;

  @IsString({ message: 'Mã số thuế phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(20, { message: 'Mã số thuế không được vượt quá 20 ký tự' })
  taxCode?: string;

  @IsString({ message: 'Số bảo hiểm xã hội phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(20, { message: 'Số BHXH không được vượt quá 20 ký tự' })
  socialInsuranceNumber?: string;
}
