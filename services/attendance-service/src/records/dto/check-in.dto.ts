import { IsNotEmpty, IsEnum, IsOptional, IsNumber, IsString, IsUUID } from 'class-validator';

/**
 * Phương thức chấm công
 */
export enum CheckInMethod {
  GPS = 'gps',
  WIFI = 'wifi',
  QR = 'qr',
  FACE = 'face',
}

/**
 * DTO cho việc chấm công vào/ra
 */
export class CheckInDto {
  @IsUUID('4', { message: 'Mã nhân viên không hợp lệ' })
  @IsNotEmpty({ message: 'Mã nhân viên không được để trống' })
  employeeId: string;

  @IsEnum(CheckInMethod, { message: 'Phương thức chấm công phải là: gps, wifi, qr hoặc face' })
  @IsNotEmpty({ message: 'Phương thức chấm công không được để trống' })
  method: CheckInMethod;

  @IsNumber({}, { message: 'Vĩ độ phải là số' })
  @IsOptional()
  latitude?: number;

  @IsNumber({}, { message: 'Kinh độ phải là số' })
  @IsOptional()
  longitude?: number;

  @IsString({ message: 'Tên WiFi phải là chuỗi ký tự' })
  @IsOptional()
  wifiSSID?: string;

  @IsString({ message: 'Mã QR phải là chuỗi ký tự' })
  @IsOptional()
  qrToken?: string;

  @IsString({ message: 'Dữ liệu khuôn mặt phải là chuỗi ký tự' })
  @IsOptional()
  faceData?: string;
}
