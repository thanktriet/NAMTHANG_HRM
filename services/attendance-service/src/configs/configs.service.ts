import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateConfigDto } from './dto/create-config.dto';

/**
 * Service quản lý cấu hình ca làm việc
 */
@Injectable()
export class ConfigsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy tất cả cấu hình ca làm việc
   */
  async findAll() {
    const configs = await this.prisma.shiftConfig.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { employees: true } },
      },
    });

    return { data: configs };
  }

  /**
   * Tạo cấu hình ca làm việc mới
   */
  async create(dto: CreateConfigDto) {
    const config = await this.prisma.shiftConfig.create({
      data: {
        name: dto.name,
        shiftStart: dto.shiftStart,
        shiftEnd: dto.shiftEnd,
        lateThresholdMinutes: dto.lateThresholdMinutes,
        breakStart: dto.breakStart,
        breakEnd: dto.breakEnd,
        workingDays: dto.workingDays,
      },
    });

    return {
      message: 'Tạo cấu hình ca làm việc thành công',
      data: config,
    };
  }

  /**
   * Cập nhật cấu hình ca làm việc
   */
  async update(id: string, dto: Partial<CreateConfigDto>) {
    // Kiểm tra tồn tại
    const existing = await this.prisma.shiftConfig.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy cấu hình ca làm việc');
    }

    const config = await this.prisma.shiftConfig.update({
      where: { id },
      data: dto,
    });

    return {
      message: 'Cập nhật cấu hình ca làm việc thành công',
      data: config,
    };
  }

  /**
   * Xóa cấu hình ca làm việc
   */
  async remove(id: string) {
    // Kiểm tra tồn tại
    const existing = await this.prisma.shiftConfig.findUnique({
      where: { id },
      include: { _count: { select: { employees: true } } },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy cấu hình ca làm việc');
    }

    if (existing._count.employees > 0) {
      throw new NotFoundException(
        `Không thể xóa - đang có ${existing._count.employees} nhân viên sử dụng cấu hình này`,
      );
    }

    await this.prisma.shiftConfig.delete({ where: { id } });

    return { message: 'Xóa cấu hình ca làm việc thành công' };
  }
}
