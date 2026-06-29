import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';

@Injectable()
export class PositionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Danh sách chức vụ */
  async findAll() {
    return this.prisma.position.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { level: 'asc' },
    });
  }

  /** Chi tiết chức vụ */
  async findOne(id: string) {
    const position = await this.prisma.position.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!position) {
      throw new NotFoundException(`Không tìm thấy chức vụ với ID: ${id}`);
    }

    return position;
  }

  /** Tạo chức vụ */
  async create(dto: CreatePositionDto) {
    const existing = await this.prisma.position.findFirst({
      where: { code: dto.code, deletedAt: null },
    });

    if (existing) {
      throw new BadRequestException(`Mã chức vụ "${dto.code}" đã tồn tại`);
    }

    return this.prisma.position.create({
      data: dto,
    });
  }

  /** Cập nhật chức vụ */
  async update(id: string, dto: Partial<CreatePositionDto>) {
    await this.findOne(id);

    return this.prisma.position.update({
      where: { id },
      data: dto,
    });
  }

  /** Xóa chức vụ (soft delete) */
  async remove(id: string) {
    await this.findOne(id);

    const employeeCount = await this.prisma.employee.count({
      where: { positionId: id, deletedAt: null },
    });

    if (employeeCount > 0) {
      throw new BadRequestException(
        `Không thể xóa chức vụ đang có ${employeeCount} nhân viên`,
      );
    }

    return this.prisma.position.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
