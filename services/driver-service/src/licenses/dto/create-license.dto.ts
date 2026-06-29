import { IsString, IsNotEmpty, IsEnum, IsDateString } from 'class-validator';

/** Hạng bằng lái xe */
export enum LicenseClass {
  B1 = 'B1',
  B2 = 'B2',
  C = 'C',
  D = 'D',
  E = 'E',
  FC = 'FC',
}

/** DTO tạo mới giấy phép lái xe */
export class CreateLicenseDto {
  /** Mã nhân viên */
  @IsString()
  @IsNotEmpty({ message: 'Mã nhân viên không được để trống' })
  employeeId: string;

  /** Số giấy phép lái xe */
  @IsString()
  @IsNotEmpty({ message: 'Số GPLX không được để trống' })
  licenseNumber: string;

  /** Hạng bằng lái */
  @IsEnum(LicenseClass, { message: 'Hạng bằng lái không hợp lệ (B1/B2/C/D/E/FC)' })
  licenseClass: LicenseClass;

  /** Ngày cấp */
  @IsDateString({}, { message: 'Ngày cấp không hợp lệ' })
  issueDate: string;

  /** Ngày hết hạn */
  @IsDateString({}, { message: 'Ngày hết hạn không hợp lệ' })
  expiryDate: string;

  /** Nơi cấp */
  @IsString()
  @IsNotEmpty({ message: 'Nơi cấp không được để trống' })
  issuingAuthority: string;
}
