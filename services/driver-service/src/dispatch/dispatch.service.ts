import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { FilterDispatchDto } from './dto/filter-dispatch.dto';

/** Trạng thái lệnh điều xe */
enum DispatchStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService) {}

  /** Tạo lệnh điều xe */
  async create(dto: CreateDispatchDto) {
    return this.prisma.dispatchOrder.create({
      data: {
        ...dto,
        status: DispatchStatus.PENDING,
        departureTime: dto.departureTime ? new Date(dto.departureTime) : null,
      },
    });
  }

  /** Danh sách lệnh điều xe với bộ lọc */
  async findAll(filter: FilterDispatchDto) {
    const where: any = {};

    if (filter.status) where.status = filter.status;
    if (filter.driverId) where.driverId = filter.driverId;
    if (filter.fromDate && filter.toDate) {
      where.createdAt = {
        gte: new Date(filter.fromDate),
        lte: new Date(filter.toDate),
      };
    }

    const page = filter.page || 1;
    const limit = filter.take || 20;

    const [data, total] = await Promise.all([
      this.prisma.dispatchOrder.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dispatchOrder.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /** Bảng Kanban - nhóm lệnh điều xe theo trạng thái */
  async getBoard() {
    const [pending, inTransit, completed] = await Promise.all([
      this.prisma.dispatchOrder.findMany({
        where: { status: DispatchStatus.PENDING },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dispatchOrder.findMany({
        where: { status: DispatchStatus.IN_TRANSIT },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dispatchOrder.findMany({
        where: { status: DispatchStatus.COMPLETED },
        orderBy: { completedAt: 'desc' },
        take: 50,
      }),
    ]);

    return {
      pending: { items: pending, count: pending.length },
      in_transit: { items: inTransit, count: inTransit.length },
      completed: { items: completed, count: completed.length },
    };
  }

  /** Chi tiết lệnh điều xe */
  async findOne(id: string) {
    const order = await this.prisma.dispatchOrder.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Không tìm thấy lệnh điều xe với ID: ${id}`);
    }
    return order;
  }

  /** Bắt đầu chuyến đi - chuyển trạng thái pending -> in_transit */
  async start(id: string) {
    const order = await this.findOne(id);

    if (order.status !== DispatchStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể bắt đầu chuyến đi ở trạng thái chờ');
    }

    return this.prisma.dispatchOrder.update({
      where: { id },
      data: {
        status: DispatchStatus.IN_TRANSIT,
        startedAt: new Date(),
      },
    });
  }

  /** Hoàn thành chuyến đi - chuyển trạng thái in_transit -> completed */
  async complete(id: string) {
    const order = await this.findOne(id);

    if (order.status !== DispatchStatus.IN_TRANSIT) {
      throw new BadRequestException('Chỉ có thể hoàn thành chuyến đi đang vận chuyển');
    }

    return this.prisma.dispatchOrder.update({
      where: { id },
      data: {
        status: DispatchStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }

  /** Hủy lệnh điều xe */
  async cancel(id: string, reason?: string) {
    const order = await this.findOne(id);

    if (order.status === DispatchStatus.COMPLETED) {
      throw new BadRequestException('Không thể hủy chuyến đi đã hoàn thành');
    }

    return this.prisma.dispatchOrder.update({
      where: { id },
      data: {
        status: DispatchStatus.CANCELLED,
        cancelReason: reason,
        cancelledAt: new Date(),
      },
    });
  }
}
