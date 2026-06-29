import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ContractType } from './create-contract.dto';

// Trạng thái hợp đồng
export enum ContractStatus {
  ACTIVE = 'active',           // Đang hiệu lực
  TERMINATED = 'terminated',   // Đã thanh lý
  RENEWED = 'renewed',         // Đã gia hạn
  EXPIRED = 'expired',         // Đã hết hạn
}

export class FilterContractDto {
  @IsOptional()
  @IsEnum(ContractType, { message: 'Loại hợp đồng không hợp lệ' })
  type?: ContractType;

  @IsOptional()
  @IsEnum(ContractStatus, { message: 'Trạng thái không hợp lệ' })
  status?: ContractStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
