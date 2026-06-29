import { PartialType } from '@nestjs/mapped-types';
import { CreatePeriodDto } from './create-period.dto';

/**
 * DTO cập nhật kỳ đánh giá KPI (tất cả field là optional)
 */
export class UpdatePeriodDto extends PartialType(CreatePeriodDto) {}
