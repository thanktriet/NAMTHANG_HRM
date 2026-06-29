import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateAccidentDto } from './dto/create-accident.dto';

@Injectable()
export class AccidentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Danh sách tai nạn */
  async findAll(query: any) {
    const where: any = {};

    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.vehicleId) where.vehicleId = query.vehicleId;
    if (query.damageLevel) where.damageLevel = query.damageLevel;

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;

    const [data, total] = await Promise.all([
      this.prisma.accident.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { accidentDate: 'desc' },
      }),
      this.prisma.accident.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /** Chi tiết tai nạn */
  async findOne(id: string) {
    const accident = await this.prisma.accident.findUnique({ where: { id } });
    if (!accident) {
      throw new NotFoundException(`Không tìm thấy báo cáo tai nạn với ID: ${id}`);
    }
    return accident;
  }

  /** Tạo mới báo cáo tai nạn */
  async create(dto: CreateAccidentDto) {
    return this.prisma.accident.create({
      data: {
        ...dto,
        accidentDate: new Date(dto.accidentDate),
      },
    });
  }

  /** Cập nhật báo cáo tai nạn */
  async update(id: string, dto: Partial<CreateAccidentDto>) {
    await this.findOne(id);
    return this.prisma.accident.update({
      where: { id },
      data: dto,
    });
  }

  /** Xóa báo cáo tai nạn */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.accident.delete({ where: { id } });
  }
}
