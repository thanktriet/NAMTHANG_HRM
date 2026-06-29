import { IsNotEmpty, IsString, IsInt, IsArray, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO tạo cấu hình ca làm việc
 */
export class CreateConfigDto {
  @IsString({ message: 'Tên ca làm việc phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên ca làm việc không được để trống' })
  name: string;

  @IsString({ message: 'Giờ bắt đầu phải là chuỗi ký tự' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Giờ bắt đầu phải có định dạng HH:mm' })
  @IsNotEmpty({ message: 'Giờ bắt đầu không được để trống' })
  shiftStart: string;

  @IsString({ message: 'Giờ kết thúc phải là chuỗi ký tự' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Giờ kết thúc phải có định dạng HH:mm' })
  @IsNotEmpty({ message: 'Giờ kết thúc không được để trống' })
  shiftEnd: string;

  @Type(() => Number)
  @IsInt({ message: 'Số phút cho phép trễ phải là số nguyên' })
  @Min(0, { message: 'Số phút cho phép trễ phải lớn hơn hoặc bằng 0' })
  @Max(60, { message: 'Số phút cho phép trễ tối đa 60 phút' })
  @IsNotEmpty({ message: 'Số phút cho phép trễ không được để trống' })
  lateThresholdMinutes: number;

  @IsString({ message: 'Giờ bắt đầu nghỉ trưa phải là chuỗi ký tự' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Giờ bắt đầu nghỉ trưa phải có định dạng HH:mm' })
  @IsNotEmpty({ message: 'Giờ bắt đầu nghỉ trưa không được để trống' })
  breakStart: string;

  @IsString({ message: 'Giờ kết thúc nghỉ trưa phải là chuỗi ký tự' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Giờ kết thúc nghỉ trưa phải có định dạng HH:mm' })
  @IsNotEmpty({ message: 'Giờ kết thúc nghỉ trưa không được để trống' })
  breakEnd: string;

  @IsArray({ message: 'Ngày làm việc phải là mảng số' })
  @IsInt({ each: true, message: 'Mỗi ngày làm việc phải là số nguyên (0=CN, 1=T2,...6=T7)' })
  @IsNotEmpty({ message: 'Ngày làm việc không được để trống' })
  workingDays: number[];
}
