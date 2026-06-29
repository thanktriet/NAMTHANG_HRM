import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetDto } from './create-asset.dto';

/** DTO cập nhật tài sản - tất cả các trường đều optional */
export class UpdateAssetDto extends PartialType(CreateAssetDto) {}
