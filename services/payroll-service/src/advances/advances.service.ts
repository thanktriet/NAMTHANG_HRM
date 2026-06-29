import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateAdvanceDto } from './dto/create-advance.dto';
import { FilterAdvanceDto, AdvanceStatus } from './dto/filter-advance.dto';
import { paginate, getSkip } from '../common/pagination.helper';

/**
 * Service xử lý logic tạm ứng lương
 * - Tạo yêu cầu tạm ứng
 * - Duyệt / từ chối
 * - Theo dõi lịch sử tạm ứng
 */
@Injectable()
export class AdvancesService {
  /** Tỷ lệ tạm ứng tối đa so với lương cơ bản: 50% */
  private readonly MAX_ADVANCE_RATIO = 0.5;

  /** Số lần tạm ứng tối đa trong 1 tháng */
  private readonly MAX_ADVANCES_PER_MONTH = 2;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo yêu cầu tạm ứng mới
   * Kiểm tra:
   * - Nhân viên tồn tại và đang hoạt động
   * - Số tiền không vượt quá 50% lương cơ bản
   * - Không quá 2 lần tạm ứng/tháng
   */
  async create(dto: CreateAdvanceDto) {
    const { employeeId, amount, reason } = dto;

    // Kiểm tra nhân viên
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { contract: true },
    });

    if (!employee) {
      throw new NotFoundException(`Không tìm thấy nhân viên: ${employeeId}`);
    }

    if (employee.status !== 'ACTIVE') {
      throw new BadRequestException('Nhân viên không ở trạng thái hoạt động');
    }

    // Kiểm tra giới hạn số tiền
    const baseSalary = employee.contract?.baseSalary || 0;
    const maxAmount = baseSalary * this.MAX_ADVANCE_RATIO;

    if (amount > maxAmount) {
      throw new BadRequestException(
        `Số tiền tạm ứng (${amount.toLocaleString('vi-VN')}đ) vượt quá 50% lương cơ bản (${maxAmount.toLocaleString('vi-VN')}đ)`,
      );
    }

    // Kiểm tra số lần tạm ứng trong tháng
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const advancesThisMonth = await this.prisma.advance.count({
      where: {
        employeeId,
        month: currentMonth,
        year: currentYear,
        status: { not: 'REJECTED' },
      },
    });

    if (advancesThisMonth >= this.MAX_ADVANCES_PER_MONTH) {
      throw new BadRequestException(
        `Đã đạt giới hạn ${this.MAX_ADVANCES_PER_MONTH} lần tạm ứng trong tháng ${currentMonth}/${currentYear}`,
      );
    }

    // Tạo yêu cầu tạm ứng
    const advance = await this.prisma.advance.create({
      data: {
        employeeId,
        amount,
        reason,
        month: currentMonth,
        year: currentYear,
        status: AdvanceStatus.PENDING,
        requestedAt: new Date(),
      },
    });

    return {
      message: 'Đã tạo yêu cầu tạm ứng thành công',
      advance,
    };
  }

  /**
   * Danh sách tạm ứng (có phân trang và lọc)
   */
  async findAll(filter: FilterAdvanceDto) {
    const { employeeId, status, month, year, page = 1, limit = 20 } = filter;

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (month) where.month = month;
    if (year) where.year = year;

    const [advances, total] = await Promise.all([
      this.prisma.advance.findMany({
        where,
        skip: getSkip(page, limit),
        take: limit,
        orderBy: { requestedAt: 'desc' },
        include: {
          employee: {
            select: { id: true, fullName: true, employeeCode: true },
          },
        },
      }),
      this.prisma.advance.count({ where }),
    ]);

    return paginate(advances, total, page, limit);
  }

  /**
   * Duyệt yêu cầu tạm ứng
   */
  async approve(id: string) {
    const advance = await this.prisma.advance.findUnique({
      where: { id },
    });

    if (!advance) {
      throw new NotFoundException(`Không tìm thấy yêu cầu tạm ứng: ${id}`);
    }

    if (advance.status !== AdvanceStatus.PENDING) {
      throw new BadRequestException(
        `Chỉ có thể duyệt yêu cầu ở trạng thái PENDING. Trạng thái hiện tại: ${advance.status}`,
      );
    }

    const updated = await this.prisma.advance.update({
      where: { id },
      data: {
        status: AdvanceStatus.APPROVED,
        approvedAt: new Date(),
      },
    });

    return {
      message: 'Đã duyệt yêu cầu tạm ứng',
      advance: updated,
    };
  }

  /**
   * Từ chối yêu cầu tạm ứng
   */
  async reject(id: string, reason?: string) {
    const advance = await this.prisma.advance.findUnique({
      where: { id },
    });

    if (!advance) {
      throw new NotFoundException(`Không tìm thấy yêu cầu tạm ứng: ${id}`);
    }

    if (advance.status !== AdvanceStatus.PENDING) {
      throw new BadRequestException(
        `Chỉ có thể từ chối yêu cầu ở trạng thái PENDING. Trạng thái hiện tại: ${advance.status}`,
      );
    }

    const updated = await this.prisma.advance.update({
      where: { id },
      data: {
        status: AdvanceStatus.REJECTED,
        rejectedAt: new Date(),
        rejectionReason: reason || null,
      },
    });

    return {
      message: 'Đã từ chối yêu cầu tạm ứng',
      advance: updated,
    };
  }

  /**
   * Lấy tổng tạm ứng đã duyệt của nhân viên trong kỳ
   * (Dùng cho tính lương)
   */
  async getApprovedByEmployee(
    employeeId: string,
    month: number,
    year: number,
  ): Promise<number> {
    const advances = await this.prisma.advance.findMany({
      where: {
        employeeId,
        month,
        year,
        status: AdvanceStatus.APPROVED,
      },
    });

    return advances.reduce((sum, a) => sum + a.amount, 0);
  }
}
