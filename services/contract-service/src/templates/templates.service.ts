import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả mẫu hợp đồng
  async findAll() {
    return this.prisma.contractTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Lấy chi tiết mẫu hợp đồng theo ID
  async findOne(id: string) {
    const template = await this.prisma.contractTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Không tìm thấy mẫu hợp đồng với ID: ${id}`);
    }

    return template;
  }

  // Tạo mẫu hợp đồng mới
  async create(dto: CreateTemplateDto) {
    return this.prisma.contractTemplate.create({
      data: {
        name: dto.name,
        type: dto.type,
        contentTemplate: dto.contentTemplate,
        description: dto.description,
      },
    });
  }

  // Cập nhật mẫu hợp đồng
  async update(id: string, dto: Partial<CreateTemplateDto>) {
    await this.findOne(id); // Kiểm tra tồn tại

    return this.prisma.contractTemplate.update({
      where: { id },
      data: dto,
    });
  }

  // Xóa mẫu hợp đồng
  async remove(id: string) {
    await this.findOne(id); // Kiểm tra tồn tại

    return this.prisma.contractTemplate.delete({
      where: { id },
    });
  }
}
