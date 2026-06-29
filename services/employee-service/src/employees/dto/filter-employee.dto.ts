import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class FilterEmployeeDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang phải là số nguyên' })
  @Min(1, { message: 'Số trang tối thiểu là 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số bản ghi phải là số nguyên' })
  @Min(1, { message: 'Số bản ghi tối thiểu là 1' })
  @Max(100, { message: 'Số bản ghi tối đa là 100' })
  limit?: number = 20;

  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'Mã phòng ban không hợp lệ' })
  departmentId?: string;

  @IsOptional()
  @IsString({ message: 'Mã chức vụ không hợp lệ' })
  positionId?: string;

  @IsOptional()
  @IsString({ message: 'Mã tổ chức không hợp lệ' })
  organizationId?: string;

  @IsOptional()
  @IsString({ message: 'Trạng thái không hợp lệ' })
  status?: string;

  @IsOptional()
  @IsString({ message: 'Trường sắp xếp không hợp lệ' })
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(SortOrder, { message: 'Thứ tự sắp xếp phải là asc hoặc desc' })
  sortOrder?: SortOrder = SortOrder.DESC;
}
