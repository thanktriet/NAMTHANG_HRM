import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateViolationDto } from './dto/create-violation.dto';

@Injectable()
export class ViolationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Danh sách vi phạm */
  async findAll(query: any) {
    const where: any = {};

    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.violationType) where.violationType = query.violationType;

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;

    const [data, total] = await Promise.all([
      this.prisma.violation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { violationDate: 'desc' },
      }),
      this.prisma.violation.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /** Thống kê vi phạm */
  async getStats() {
    const [total, byType, byMonth] = await Promise.all([
      // Tổng số vi phạm
      this.prisma.violation.count(),
      // Thống kê theo loại vi phạm
      this.prisma.violation.groupBy({
        by: ['violationType'],
        _count: { id: true },
        _sum: { fineAmount: true },
      }),
      // Thống kê theo tháng (12 tháng gần nhất)
      this.prisma.$queryRaw`
        SELECT
          DATE_FORMAT(violation_date, '%Y-%m') as month,
          COUNT(*) as count,
          SUM(fine_amount) as totalFine
        FROM violations
        WHERE violation_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY month
        ORDER BY month DESC
      `,
    ]);

    return { total, byType, byMonth };
  }

  /** Lịch sử vi phạm của lái xe */
  async findByDriver(driverId: string) {
    return this.prisma.violation.findMany({
      where: { employeeId: driverId },
      orderBy: { violationDate: 'desc' },
    });
  }

  /** Chi tiết vi phạm */
  async findOne(id: string) {
    const violation = await this.prisma.violation.findUnique({ where: { id } });
    if (!violation) {
      throw new NotFoundException(`Không tìm thấy vi phạm với ID: ${id}`);
    }
    return violation;
  }

  /** Tạo mới vi phạm */
  async create(dto: CreateViolationDto) {
    return this.prisma.violation.create({
      data: {
        ...dto,
        violationDate: new Date(dto.violationDate),
      },
    });
  }

  /** Cập nhật vi phạm */
  async update(id: string, dto: Partial<CreateViolationDto>) {
    await this.findOne(id);
    return this.prisma.violation.update({
      where: { id },
      data: dto,
    });
  }

  /** Xóa vi phạm */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.violation.delete({ where: { id } });
  }
}
