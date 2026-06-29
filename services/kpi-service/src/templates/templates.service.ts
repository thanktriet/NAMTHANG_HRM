import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

/**
 * Service quản lý mẫu KPI
 */
@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo mẫu KPI mới
   */
  async create(dto: CreateTemplateDto) {
    const template = await this.prisma.kpiTemplate.create({
      data: {
        positionId: dto.positionId,
        criteriaName: dto.criteriaName,
        weight: dto.weight,
        targetDescription: dto.targetDescription,
        measurementMethod: dto.measurementMethod,
      },
    });

    return template;
  }

  /**
   * Danh sách mẫu KPI - có thể lọc theo vị trí
   */
  async findAll(positionId?: string) {
    const where: any = {};

    if (positionId) {
      where.positionId = positionId;
    }

    const templates = await this.prisma.kpiTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return templates;
  }

  /**
   * Chi tiết mẫu KPI theo ID
   */
  async findOne(id: string) {
    const template = await this.prisma.kpiTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Không tìm thấy mẫu KPI với ID: ${id}`);
    }

    return template;
  }

  /**
   * Cập nhật mẫu KPI
   */
  async update(id: string, dto: UpdateTemplateDto) {
    // Kiểm tra tồn tại
    await this.findOne(id);

    const updated = await this.prisma.kpiTemplate.update({
      where: { id },
      data: {
        ...dto,
      },
    });

    return updated;
  }

  /**
   * Xóa mẫu KPI
   */
  async remove(id: string) {
    // Kiểm tra tồn tại
    await this.findOne(id);

    await this.prisma.kpiTemplate.delete({
      where: { id },
    });

    return { message: 'Đã xóa mẫu KPI thành công' };
  }
}
