import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';

/** DTO tạo lệnh điều xe */
export class CreateDispatchDto {
  /** Mã lái xe */
  @IsString()
  @IsNotEmpty({ message: 'Mã lái xe không được để trống' })
  driverId: string;

  /** Mã phương tiện */
  @IsString()
  @IsNotEmpty({ message: 'Mã phương tiện không được để trống' })
  vehicleId: string;

  /** Điểm xuất phát */
  @IsString()
  @IsNotEmpty({ message: 'Điểm xuất phát không được để trống' })
  origin: string;

  /** Điểm đến */
  @IsString()
  @IsNotEmpty({ message: 'Điểm đến không được để trống' })
  destination: string;

  /** Loại hàng hóa */
  @IsOptional()
  @IsString()
  cargoType?: string;

  /** Trọng lượng hàng (tấn) */
  @IsOptional()
  @IsNumber({}, { message: 'Trọng lượng hàng phải là số' })
  @Min(0, { message: 'Trọng lượng hàng phải lớn hơn 0' })
  cargoWeight?: number;

  /** Thời gian xuất phát dự kiến */
  @IsOptional()
  @IsDateString({}, { message: 'Thời gian xuất phát không hợp lệ' })
  departureTime?: string;

  /** Ghi chú */
  @IsOptional()
  @IsString()
  notes?: string;
}
