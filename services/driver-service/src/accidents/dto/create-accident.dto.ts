import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsNumber, Min } from 'class-validator';

/** Mức độ hư hỏng */
export enum DamageLevel {
  MINOR = 'minor',
  MODERATE = 'moderate',
  SEVERE = 'severe',
}

/** DTO tạo mới báo cáo tai nạn */
export class CreateAccidentDto {
  /** Mã nhân viên (lái xe) */
  @IsString()
  @IsNotEmpty({ message: 'Mã nhân viên không được để trống' })
  employeeId: string;

  /** Mã phương tiện */
  @IsString()
  @IsNotEmpty({ message: 'Mã phương tiện không được để trống' })
  vehicleId: string;

  /** Ngày xảy ra tai nạn */
  @IsDateString({}, { message: 'Ngày tai nạn không hợp lệ' })
  accidentDate: string;

  /** Địa điểm */
  @IsString()
  @IsNotEmpty({ message: 'Địa điểm không được để trống' })
  location: string;

  /** Mô tả chi tiết */
  @IsOptional()
  @IsString()
  description?: string;

  /** Mức độ hư hỏng */
  @IsEnum(DamageLevel, { message: 'Mức độ hư hỏng không hợp lệ (minor/moderate/severe)' })
  damageLevel: DamageLevel;

  /** Mô tả thương tích */
  @IsOptional()
  @IsString()
  injuryDescription?: string;

  /** Chi phí thiệt hại */
  @IsOptional()
  @IsNumber({}, { message: 'Chi phí phải là số' })
  @Min(0, { message: 'Chi phí không được âm' })
  cost?: number;
}
