import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTemplateDto {
  @IsNotEmpty({ message: 'Tên mẫu không được để trống' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Loại mẫu không được để trống' })
  @IsString()
  type: string;

  @IsNotEmpty({ message: 'Nội dung mẫu không được để trống' })
  @IsString()
  contentTemplate: string;

  @IsOptional()
  @IsString()
  description?: string;
}
