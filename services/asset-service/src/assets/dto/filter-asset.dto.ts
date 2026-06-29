import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AssetCategory } from './create-asset.dto';

/** Trạng thái tài sản */
export enum AssetStatus {
  AVAILABLE = 'AVAILABLE',   // Sẵn sàng sử dụng
  IN_USE = 'IN_USE',         // Đang sử dụng
  MAINTENANCE = 'MAINTENANCE', // Đang bảo trì
  DISPOSED = 'DISPOSED',     // Đã thanh lý
}

/** DTO lọc/tìm kiếm tài sản */
export class FilterAssetDto {
  // Lọc theo danh mục tài sản
  @IsOptional()
  @IsEnum(AssetCategory, { message: 'Danh mục không hợp lệ' })
  category?: AssetCategory;

  // Lọc theo trạng thái tài sản
  @IsOptional()
  @IsEnum(AssetStatus, { message: 'Trạng thái không hợp lệ' })
  status?: AssetStatus;

  // Lọc theo tổ chức
  @IsOptional()
  @IsString({ message: 'Mã tổ chức không hợp lệ' })
  organizationId?: string;

  // Tìm kiếm theo tên hoặc mã tài sản
  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  search?: string;

  // Số trang (mặc định: 1)
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang phải là số nguyên' })
  @Min(1, { message: 'Số trang tối thiểu là 1' })
  page?: number = 1;

  // Số bản ghi mỗi trang (mặc định: 10)
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số bản ghi phải là số nguyên' })
  @Min(1, { message: 'Số bản ghi tối thiểu là 1' })
  @Max(100, { message: 'Số bản ghi tối đa là 100' })
  limit?: number = 10;
}
