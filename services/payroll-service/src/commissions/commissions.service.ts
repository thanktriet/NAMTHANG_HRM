import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { FilterCommissionDto } from './dto/filter-commission.dto';
import { paginate, getSkip } from '../common/pagination.helper';

/**
 * Cấu hình mức hoa hồng tài xế
 */
interface CommissionConfig {
  /** Tiền hoa hồng mỗi chuyến (VND) */
  ratePerTrip: number;

  /** Mốc KM thưởng thêm */
  kmMilestones: {
    km: number;
    bonus: number;
  }[];
}

/**
 * Service tính toán hoa hồng cho tài xế
 * - Tính dựa trên số chuyến × đơn giá
 * - Thưởng thêm theo mốc km tích lũy
 */
@Injectable()
export class CommissionsService {
  /** Cấu hình hoa hồng mặc định */
  private readonly DEFAULT_CONFIG: CommissionConfig = {
    ratePerTrip: 150_000, // 150,000 VND/chuyến
    kmMilestones: [
      { km: 2000, bonus: 500_000 },   // 2,000km → thưởng 500K
      { km: 4000, bonus: 1_000_000 }, // 4,000km → thưởng 1M
      { km: 6000, bonus: 1_500_000 }, // 6,000km → thưởng 1.5M
      { km: 8000, bonus: 2_000_000 }, // 8,000km → thưởng 2M
      { km: 10000, bonus: 3_000_000 }, // 10,000km → thưởng 3M
    ],
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tính hoa hồng cho tất cả tài xế trong kỳ
   * Dữ liệu lấy từ bảng dispatch (điều xe)
   */
  async calculateCommissions(month: number, year: number) {
    // Lấy dữ liệu điều xe trong kỳ
    const dispatches = await this.prisma.dispatch.findMany({
      where: {
        month,
        year,
        status: 'COMPLETED',
      },
      include: {
        driver: {
          select: { id: true, fullName: true, employeeCode: true },
        },
      },
    });

    // Nhóm theo tài xế
    const driverTrips: Record<string, {
      driverId: string;
      driverName: string;
      trips: number;
      totalKm: number;
    }> = {};

    for (const dispatch of dispatches) {
      const driverId = dispatch.driverId;
      if (!driverTrips[driverId]) {
        driverTrips[driverId] = {
          driverId,
          driverName: dispatch.driver?.fullName || '',
          trips: 0,
          totalKm: 0,
        };
      }
      driverTrips[driverId].trips++;
      driverTrips[driverId].totalKm += dispatch.distanceKm || 0;
    }

    // Tính hoa hồng từng tài xế
    const results = [];

    for (const data of Object.values(driverTrips)) {
      const tripCommission = data.trips * this.DEFAULT_CONFIG.ratePerTrip;
      const kmBonus = this.calculateKmBonus(data.totalKm);
      const totalCommission = tripCommission + kmBonus;

      // Lưu hoặc cập nhật commission
      const commission = await this.prisma.commission.upsert({
        where: {
          employeeId_month_year: {
            employeeId: data.driverId,
            month,
            year,
          },
        },
        create: {
          employeeId: data.driverId,
          month,
          year,
          totalTrips: data.trips,
          totalKm: data.totalKm,
          tripCommission,
          kmBonus,
          totalAmount: totalCommission,
          status: 'CALCULATED',
          calculatedAt: new Date(),
        },
        update: {
          totalTrips: data.trips,
          totalKm: data.totalKm,
          tripCommission,
          kmBonus,
          totalAmount: totalCommission,
          status: 'CALCULATED',
          calculatedAt: new Date(),
        },
      });

      results.push({
        ...commission,
        driverName: data.driverName,
      });
    }

    return {
      message: `Đã tính hoa hồng cho ${results.length} tài xế trong kỳ ${month}/${year}`,
      period: { month, year },
      totalDrivers: results.length,
      totalCommission: results.reduce((sum, r) => sum + r.totalAmount, 0),
      details: results,
    };
  }

  /**
   * Tính thưởng theo mốc km tích lũy
   * Mỗi mốc đạt được sẽ cộng thêm tiền thưởng
   */
  private calculateKmBonus(totalKm: number): number {
    let bonus = 0;

    for (const milestone of this.DEFAULT_CONFIG.kmMilestones) {
      if (totalKm >= milestone.km) {
        bonus = milestone.bonus; // Lấy mốc cao nhất đạt được
      } else {
        break;
      }
    }

    return bonus;
  }

  /**
   * Danh sách hoa hồng theo kỳ (có phân trang)
   */
  async findAll(filter: FilterCommissionDto) {
    const { month, year, driverId, status, page = 1, limit = 20 } = filter;

    const where: any = {};
    if (month) where.month = month;
    if (year) where.year = year;
    if (driverId) where.employeeId = driverId;
    if (status) where.status = status;

    const [commissions, total] = await Promise.all([
      this.prisma.commission.findMany({
        where,
        skip: getSkip(page, limit),
        take: limit,
        orderBy: { totalAmount: 'desc' },
        include: {
          employee: {
            select: { id: true, fullName: true, employeeCode: true },
          },
        },
      }),
      this.prisma.commission.count({ where }),
    ]);

    return paginate(commissions, total, page, limit);
  }

  /**
   * Lịch sử hoa hồng của 1 tài xế
   */
  async getDriverHistory(driverId: string, year?: number) {
    const where: any = { employeeId: driverId };
    if (year) where.year = year;

    const commissions = await this.prisma.commission.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    if (commissions.length === 0) {
      throw new NotFoundException(`Không tìm thấy dữ liệu hoa hồng cho tài xế: ${driverId}`);
    }

    // Tổng hợp thống kê
    const totalCommission = commissions.reduce((sum, c) => sum + c.totalAmount, 0);
    const totalTrips = commissions.reduce((sum, c) => sum + c.totalTrips, 0);
    const totalKm = commissions.reduce((sum, c) => sum + c.totalKm, 0);

    return {
      driverId,
      summary: {
        totalCommission,
        totalTrips,
        totalKm,
        averagePerMonth: commissions.length > 0
          ? Math.round(totalCommission / commissions.length)
          : 0,
        periods: commissions.length,
      },
      history: commissions,
    };
  }

  /**
   * Lấy hoa hồng tài xế cho 1 kỳ cụ thể
   * (Dùng cho tính lương)
   */
  async getDriverCommissionForPeriod(
    driverId: string,
    month: number,
    year: number,
  ): Promise<number> {
    const commission = await this.prisma.commission.findFirst({
      where: {
        employeeId: driverId,
        month,
        year,
        status: { in: ['CALCULATED', 'APPROVED'] },
      },
    });

    return commission?.totalAmount || 0;
  }
}
