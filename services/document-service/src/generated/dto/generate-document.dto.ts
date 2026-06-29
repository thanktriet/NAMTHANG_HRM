import { IsNotEmpty, IsObject, IsString, IsUUID } from 'class-validator';

/**
 * DTO tạo tài liệu từ mẫu
 */
export class GenerateDocumentDto {
  @IsUUID('4', { message: 'ID mẫu tài liệu phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'ID mẫu tài liệu không được để trống' })
  templateId!: string;

  @IsUUID('4', { message: 'ID nhân viên phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'ID nhân viên không được để trống' })
  employeeId!: string;

  @IsObject({ message: 'Dữ liệu placeholder phải là đối tượng (object)' })
  @IsNotEmpty({ message: 'Dữ liệu placeholder không được để trống' })
  data!: Record<string, string>;
}
