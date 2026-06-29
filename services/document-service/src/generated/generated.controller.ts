import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { GeneratedService } from './generated.service';
import { GenerateDocumentDto } from './dto/generate-document.dto';
import { FilterDocumentDto } from './dto/filter-document.dto';

/**
 * Controller quản lý tài liệu đã tạo từ mẫu
 */
@Controller('documents')
export class GeneratedController {
  constructor(private readonly generatedService: GeneratedService) {}

  /**
   * Tạo tài liệu mới từ mẫu + dữ liệu placeholder
   */
  @Post('generate')
  generate(@Body() generateDto: GenerateDocumentDto) {
    return this.generatedService.generate(generateDto);
  }

  /**
   * Lấy danh sách tài liệu đã tạo (có phân trang và lọc)
   */
  @Get()
  findAll(@Query() filter: FilterDocumentDto) {
    return this.generatedService.findAll(filter);
  }

  /**
   * Lấy chi tiết tài liệu đã tạo theo ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.generatedService.findOne(id);
  }

  /**
   * Tải xuống file tài liệu đã tạo
   */
  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const { stream, fileName } = await this.generatedService.download(id);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    stream.pipe(res);
  }

  /**
   * Cập nhật trạng thái ký tài liệu
   */
  @Patch(':id/sign')
  sign(@Param('id') id: string) {
    return this.generatedService.sign(id);
  }
}
