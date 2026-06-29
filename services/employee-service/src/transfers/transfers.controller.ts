import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  /** Tạo quyết định điều chuyển */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTransferDto: CreateTransferDto) {
    return this.transfersService.create(createTransferDto);
  }

  /** Danh sách điều chuyển */
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.transfersService.findAll(page, limit);
  }

  /** Lịch sử điều chuyển của nhân viên */
  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.transfersService.findByEmployee(employeeId);
  }
}
