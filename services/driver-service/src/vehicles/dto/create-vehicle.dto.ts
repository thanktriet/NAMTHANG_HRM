import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';

/** Loại phương tiện */
export enum VehicleType {
  TRUCK = 'truck',
  CONTAINER = 'container',
  TANKER = 'tanker',
  TRAILER = 'trailer',
}

/** DTO tạo mới phương tiện */
export class CreateVehicleDto {
  /** Biển số xe */
  @IsString()
  @IsNotEmpty({ message: 'Biển số xe không được để trống' })
  plateNumber: string;

  /** Loại phương tiện */
  @IsEnum(VehicleType, { message: 'Loại phương tiện không hợp lệ (truck/container/tanker/trailer)' })
  type: VehicleType;

  /** Hãng xe */
  @IsString()
  @IsNotEmpty({ message: 'Hãng xe không được để trống' })
  brand: string;

  /** Model xe */
  @IsString()
  @IsNotEmpty({ message: 'Model xe không được để trống' })
  model: string;

  /** Tải trọng (tấn) */
  @IsNumber({}, { message: 'Tải trọng phải là số' })
  @Min(0, { message: 'Tải trọng phải lớn hơn 0' })
  tonnage: number;

  /** Năm sản xuất */
  @IsNumber({}, { message: 'Năm sản xuất phải là số' })
  @Min(1990, { message: 'Năm sản xuất không hợp lệ' })
  @Max(2030, { message: 'Năm sản xuất không hợp lệ' })
  manufactureYear: number;

  /** Mã đơn vị/tổ chức */
  @IsOptional()
  @IsString()
  organizationId?: string;
}
