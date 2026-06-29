import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { LicenseClass } from './create-license.dto';

/** DTO lọc danh sách GPLX */
export class FilterLicenseDto {
  /** Hạng bằng lái */
  @IsOptional()
  @IsEnum(LicenseClass, { message: 'Hạng bằng lái không hợp lệ' })
  licenseClass?: LicenseClass;

  /** Trạng thái: active, expired, suspended */
  @IsOptional()
  @IsString()
  status?: string;

  /** Mã nhân viên */
  @IsOptional()
  @IsString()
  employeeId?: string;

  /** Trang hiện tại */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  /** Số bản ghi mỗi trang */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number = 20;

  /** Số bản ghi bỏ qua (tính từ page) */
  get skip(): number {
    return ((this.page || 1) - 1) * (this.take || 20);
  }
}
