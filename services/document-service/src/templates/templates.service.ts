import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { FilterTemplateDto } from './dto/filter-template.dto';

/**
 * Service xử lý logic nghiệp vụ cho mẫu tài liệu
 */
@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách mẫu tài liệu, hỗ trợ lọc theo danh mục
   */
  async findAll(filter: FilterTemplateDto) {
    const where: Record<string, unknown> = {};

    if (filter.category) {
      where.category = filter.category;
    }

    const templates = await this.prisma.documentTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: templates,
      total: templates.length,
    };
  }

  /**
   * Lấy chi tiết một mẫu tài liệu theo ID
   */
  async findOne(id: string) {
    const template = await this.prisma.documentTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Không tìm thấy mẫu tài liệu với ID: ${id}`);
    }

    return template;
  }

  /**
   * Tạo mẫu tài liệu mới
   */
  async create(dto: CreateTemplateDto) {
    return this.prisma.documentTemplate.create({
      data: {
        name: dto.name,
        category: dto.category,
        description: dto.description,
        contentTemplate: dto.contentTemplate,
        filePath: dto.filePath,
      },
    });
  }

  /**
   * Cập nhật mẫu tài liệu theo ID
   */
  async update(id: string, dto: UpdateTemplateDto) {
    // Kiểm tra mẫu tài liệu tồn tại
    await this.findOne(id);

    return this.prisma.documentTemplate.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Xóa mẫu tài liệu theo ID (soft delete)
   */
  async remove(id: string) {
    // Kiểm tra mẫu tài liệu tồn tại
    await this.findOne(id);

    return this.prisma.documentTemplate.delete({
      where: { id },
    });
  }
}
