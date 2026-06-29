import { IsString } from 'class-validator';

/**
 * DTO tra cứu hồ sơ ứng viên (công khai)
 */
export class LookupCandidateDto {
  @IsString({ message: 'Mã ứng viên không được để trống' })
  code: string;

  @IsString({ message: 'Số điện thoại không được để trống' })
  phone: string;
}
