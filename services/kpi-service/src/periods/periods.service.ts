import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreatePeriodDto } from './dto/create-period.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';

/**
 * Service quản lý kỳ đánh giá KPI
 */
@Injectable()
export class PeriodsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo kỳ đánh giá mới
   */
  async create(dto: CreatePeriodDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    // Kiểm tra ngày bắt đầu phải trước ngày kết thúc
    if (startDate >= endDate) {
      throw new BadRequestException(
        'Ngày bắt đầu phải trước ngày kết thúc',
      );
    }

    // Kiểm tra trùng lặp kỳ đánh giá (khoảng thời gian chồng chéo)
    const overlapping = await this.prisma.kpiPeriod.findFirst({
      where: {
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } },
        ],
        status: { not: 'closed' },
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        `Kỳ đánh giá bị trùng với "${overlapping.name}" (${overlapping.startDate.toISOString().slice(0, 10)} - ${overlapping.endDate.toISOString().slice(0, 10)})`,
      );
    }

    const period = await this.prisma.kpiPeriod.create({
      data: {
        name: dto.name,
        startDate,
        endDate,
        status: 'active',
      },
    });

    return period;
  }

  /**
   * Danh sách tất cả kỳ đánh giá (sắp xếp theo ngày bắt đầu giảm dần)
   */
  async findAll() {
    const periods = await this.prisma.kpiPeriod.findMany({
      orderBy: { startDate: 'desc' },
    });

    return periods;
  }

  /**
   * Chi tiết kỳ đánh giá theo ID
   */
  async findOne(id: string) {
    const period = await this.prisma.kpiPeriod.findUnique({
      where: { id },
    });

    if (!period) {
      throw new NotFoundException(`Không tìm thấy kỳ đánh giá với ID: ${id}`);
    }

    return period;
  }

  /**
   * Cập nhật thông tin kỳ đánh giá
   */
  async update(id: string, dto: UpdatePeriodDto) {
    const period = await this.prisma.kpiPeriod.findUnique({ where: { id } });

    if (!period) {
      throw new NotFoundException(`Không tìm thấy kỳ đánh giá với ID: ${id}`);
    }

    // Không cho phép sửa kỳ đã đóng
    if (period.status === 'closed') {
      throw new BadRequestException(
        'Không thể chỉnh sửa kỳ đánh giá đã đóng',
      );
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : period.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : period.endDate;

    // Kiểm tra ngày bắt đầu phải trước ngày kết thúc
    if (startDate >= endDate) {
      throw new BadRequestException(
        'Ngày bắt đầu phải trước ngày kết thúc',
      );
    }

    const updated = await this.prisma.kpiPeriod.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.startDate && { startDate }),
        ...(dto.endDate && { endDate }),
      },
    });

    return updated;
  }

  /**
   * Đóng kỳ đánh giá (không thể mở lại)
   */
  async close(id: string) {
    const period = await this.prisma.kpiPeriod.findUnique({ where: { id } });

    if (!period) {
      throw new NotFoundException(`Không tìm thấy kỳ đánh giá với ID: ${id}`);
    }

    if (period.status === 'closed') {
      throw new BadRequestException('Kỳ đánh giá này đã được đóng trước đó');
    }

    const closed = await this.prisma.kpiPeriod.update({
      where: { id },
      data: {
        status: 'closed',
        closedAt: new Date(),
      },
    });

    return closed;
  }
}
