import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommissionsService } from './commissions.service';
import { FilterCommissionDto } from './dto/filter-commission.dto';

/**
 * Controller quản lý hoa hồng tài xế
 */
@ApiTags('Commissions - Hoa hồng')
@ApiBearerAuth()
@Controller('commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  /**
   * Danh sách hoa hồng theo kỳ
   */
  @Get()
  @ApiOperation({ summary: 'Danh sách hoa hồng theo kỳ' })
  async findAll(@Query() filter: FilterCommissionDto) {
    return this.commissionsService.findAll(filter);
  }

  /**
   * Lịch sử hoa hồng của tài xế
   */
  @Get('driver/:driverId')
  @ApiOperation({ summary: 'Lịch sử hoa hồng tài xế' })
  async getDriverHistory(
    @Param('driverId') driverId: string,
    @Query('year') year?: number,
  ) {
    return this.commissionsService.getDriverHistory(driverId, year);
  }

  /**
   * Tính hoa hồng từ dữ liệu điều xe
   */
  @Post('calculate')
  @ApiOperation({ summary: 'Tính hoa hồng từ dữ liệu điều xe' })
  async calculate(@Body() data: { month: number; year: number }) {
    return this.commissionsService.calculateCommissions(data.month, data.year);
  }

  // ===== NATS Message Handlers =====

  @MessagePattern('commissions.calculate')
  async handleCalculate(@Payload() data: { month: number; year: number }) {
    return this.commissionsService.calculateCommissions(data.month, data.year);
  }

  @MessagePattern('commissions.getByDriver')
  async handleGetByDriver(@Payload() data: { driverId: string; month: number; year: number }) {
    return this.commissionsService.getDriverCommissionForPeriod(
      data.driverId,
      data.month,
      data.year,
    );
  }
}
