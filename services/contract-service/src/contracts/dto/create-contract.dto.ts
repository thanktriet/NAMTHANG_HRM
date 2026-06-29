import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
  IsOptional,
  IsObject,
  Min,
} from 'class-validator';

// Loại hợp đồng
export enum ContractType {
  PROBATION = 'probation',         // Thử việc
  FIXED_TERM = 'fixed_term',      // Có thời hạn
  INDEFINITE = 'indefinite',       // Không thời hạn
}

export class CreateContractDto {
  @IsNotEmpty({ message: 'Mã nhân viên không được để trống' })
  @IsString()
  employeeId: string;

  @IsNotEmpty({ message: 'Loại hợp đồng không được để trống' })
  @IsEnum(ContractType, { message: 'Loại hợp đồng không hợp lệ' })
  contractType: ContractType;

  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  @IsDateString({}, { message: 'Ngày bắt đầu không đúng định dạng' })
  startDate: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày kết thúc không đúng định dạng' })
  endDate?: string;

  @IsNotEmpty({ message: 'Lương cơ bản không được để trống' })
  @IsNumber({}, { message: 'Lương cơ bản phải là số' })
  @Min(0, { message: 'Lương cơ bản phải lớn hơn hoặc bằng 0' })
  baseSalary: number;

  @IsOptional()
  @IsObject({ message: 'Phụ cấp phải là object' })
  allowances?: Record<string, number>;

  @IsOptional()
  @IsNumber({}, { message: 'Số giờ làm việc phải là số' })
  workingHours?: number;

  @IsOptional()
  @IsString()
  templateId?: string;
}
