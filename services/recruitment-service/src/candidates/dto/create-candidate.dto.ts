import { IsString, IsEmail, IsOptional, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';

/**
 * DTO tạo ứng viên mới
 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export class CreateCandidateDto {
  @IsString({ message: 'Họ và tên không được để trống' })
  fullName: string;

  @IsDateString({}, { message: 'Ngày sinh không hợp lệ' })
  dateOfBirth: string;

  @IsEnum(Gender, { message: 'Giới tính phải là "male" hoặc "female"' })
  gender: Gender;

  @IsString({ message: 'Số CMND/CCCD không được để trống' })
  idCardNumber: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày cấp CMND không hợp lệ' })
  idCardDate?: string;

  @IsOptional()
  @IsString({ message: 'Nơi cấp CMND không hợp lệ' })
  idCardPlace?: string;

  @IsOptional()
  @IsString()
  permanentAddress?: string;

  @IsOptional()
  @IsString()
  currentAddress?: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString({ message: 'Số điện thoại không được để trống' })
  phone: string;

  @IsString({ message: 'Vị trí ứng tuyển không được để trống' })
  positionApplied: string;

  @IsOptional()
  @IsString({ message: 'Hạng bằng lái không hợp lệ' })
  licenseClass?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Số năm kinh nghiệm phải là số' })
  @Min(0, { message: 'Số năm kinh nghiệm phải >= 0' })
  experienceYears?: number;

  @IsOptional()
  @IsString()
  lastCompany?: string;

  @IsOptional()
  @IsString()
  workPeriod?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Mức lương mong muốn phải là số' })
  @Min(0, { message: 'Mức lương mong muốn phải >= 0' })
  expectedSalary?: number;
}
