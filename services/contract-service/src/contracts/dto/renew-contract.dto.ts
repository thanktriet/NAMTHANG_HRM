import {
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class RenewContractDto {
  @IsNotEmpty({ message: 'Ngày kết thúc mới không được để trống' })
  @IsDateString({}, { message: 'Ngày kết thúc mới không đúng định dạng' })
  newEndDate: string;

  @IsOptional()
  @IsNumber({}, { message: 'Lương mới phải là số' })
  @Min(0, { message: 'Lương mới phải lớn hơn hoặc bằng 0' })
  newSalary?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
