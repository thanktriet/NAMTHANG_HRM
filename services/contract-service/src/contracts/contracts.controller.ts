import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ContractsService } from './contracts.service';
import { GeneratorsService } from '../generators/generators.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { FilterContractDto } from './dto/filter-contract.dto';
import { RenewContractDto } from './dto/renew-contract.dto';

@Controller('contracts')
export class ContractsController {
  constructor(
    private readonly contractsService: ContractsService,
    private readonly generatorsService: GeneratorsService,
  ) {}

  // Lấy danh sách hợp đồng với bộ lọc
  @Get()
  async findAll(@Query() filter: FilterContractDto) {
    return this.contractsService.findAll(filter);
  }

  // Lấy danh sách hợp đồng sắp hết hạn (30 ngày)
  @Get('expiring')
  async findExpiring() {
    return this.contractsService.findExpiring();
  }

  // Thống kê hợp đồng
  @Get('stats')
  async getStats() {
    return this.contractsService.getStats();
  }

  // Lấy chi tiết hợp đồng
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  // Tạo hợp đồng mới
  @Post()
  async create(@Body() dto: CreateContractDto) {
    return this.contractsService.create(dto);
  }

  // Cập nhật hợp đồng
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateContractDto>) {
    return this.contractsService.update(id, dto);
  }

  // Thanh lý / chấm dứt hợp đồng
  @Patch(':id/terminate')
  async terminate(@Param('id') id: string, @Body('reason') reason: string) {
    return this.contractsService.terminate(id, reason);
  }

  // Gia hạn hợp đồng
  @Patch(':id/renew')
  async renew(@Param('id') id: string, @Body() dto: RenewContractDto) {
    return this.contractsService.renew(id, dto);
  }

  // Tải hợp đồng dạng Word
  @Get(':id/download/word')
  async downloadWord(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.generatorsService.generateWord(id);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename=hop-dong-${id}.docx`,
    });
    res.status(HttpStatus.OK).send(buffer);
  }

  // Tải hợp đồng dạng PDF
  @Get(':id/download/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.generatorsService.generatePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=hop-dong-${id}.pdf`,
    });
    res.status(HttpStatus.OK).send(buffer);
  }
}
