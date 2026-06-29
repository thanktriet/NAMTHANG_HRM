import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { FilterLeaveDto, LeaveStatus } from './dto/filter-leave.dto';
import { buildPaginationOptions, buildPaginationResult } from '../common/pagination.helper';

/**
 * Service quản lý nghỉ phép
 */
@Injectable()
export class LeavesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo đơn nghỉ phép mới
   */
  async create(dto: CreateLeaveDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    // Validate ngày
    if (endDate < startDate) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Ngày bắt đầu phải từ hôm nay trở đi');
    }

    // Tính số ngày nghỉ
    const totalDays = this.calculateWorkingDays(startDate, endDate);

    // Kiểm tra số ngày phép còn lại
    const balance = await this.getLeaveBalance(dto.employeeId);
    const typeBalance = balance.balances.find((b) => b.type === dto.leaveType);

    if (typeBalance && typeBalance.remaining < totalDays) {
      throw new BadRequestException(
        `Số ngày phép ${dto.leaveType} còn lại không đủ. Còn ${typeBalance.remaining} ngày, yêu cầu ${totalDays} ngày`,
      );
    }

    // Kiểm tra trùng ngày nghỉ
    const overlapping = await this.prisma.leaveRequest.findFirst({
      where: {
        employeeId: dto.employeeId,
        status: { not: 'REJECTED' },
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Đã có đơn nghỉ phép trùng ngày');
    }

    // Tạo đơn nghỉ phép
    const leave = await this.prisma.leaveRequest.create({
      data: {
        employeeId: dto.employeeId,
        leaveType: dto.leaveType,
        startDate,
        endDate,
        totalDays,
        reason: dto.reason,
        status: 'PENDING',
      },
    });

    return {
      message: 'Tạo đơn nghỉ phép thành công',
      data: leave,
    };
  }

  /**
   * Lấy danh sách đơn nghỉ phép với bộ lọc
   */
  async findAll(filter: FilterLeaveDto) {
    const where: any = {};

    if (filter.status) where.status = filter.status.toUpperCase();
    if (filter.leaveType) where.leaveType = filter.leaveType;
    if (filter.employeeId) where.employeeId = filter.employeeId;

    const { skip, take } = buildPaginationOptions(filter.page, filter.limit);

    const [leaves, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: { select: { id: true, fullName: true, employeeCode: true } },
        },
      }),
      this.prisma.leaveRequest.count({ where }),
    ]);

    return buildPaginationResult(leaves, total, filter.page, filter.limit);
  }

  /**
   * Duyệt đơn nghỉ phép
   */
  async approve(id: string) {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id } });

    if (!leave) {
      throw new NotFoundException('Không tìm thấy đơn nghỉ phép');
    }

    if (leave.status !== 'PENDING') {
      throw new BadRequestException('Chỉ có thể duyệt đơn đang chờ xử lý');
    }

    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    return {
      message: 'Duyệt đơn nghỉ phép thành công',
      data: updated,
    };
  }

  /**
   * Từ chối đơn nghỉ phép
   */
  async reject(id: string) {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id } });

    if (!leave) {
      throw new NotFoundException('Không tìm thấy đơn nghỉ phép');
    }

    if (leave.status !== 'PENDING') {
      throw new BadRequestException('Chỉ có thể từ chối đơn đang chờ xử lý');
    }

    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
      },
    });

    return {
      message: 'Từ chối đơn nghỉ phép thành công',
      data: updated,
    };
  }

  /**
   * Lấy số ngày phép còn lại của nhân viên
   */
  async getLeaveBalance(employeeId: string) {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    // Lấy tất cả đơn nghỉ đã duyệt trong năm
    const approvedLeaves = await this.prisma.leaveRequest.findMany({
      where: {
        employeeId,
        status: 'APPROVED',
        startDate: { gte: startOfYear },
        endDate: { lte: endOfYear },
      },
    });

    // Cấu hình số ngày phép mặc định theo loại
    const leaveAllowances = {
      annual: 12,
      sick: 30,
      personal: 3,
      maternity: 180,
    };

    // Tính số ngày đã sử dụng theo từng loại
    const usedDays: Record<string, number> = {};
    for (const leave of approvedLeaves) {
      const type = leave.leaveType;
      usedDays[type] = (usedDays[type] || 0) + leave.totalDays;
    }

    // Tính toán số ngày còn lại
    const balances = Object.entries(leaveAllowances).map(([type, total]) => ({
      type,
      total,
      used: usedDays[type] || 0,
      remaining: total - (usedDays[type] || 0),
    }));

    return {
      employeeId,
      year: currentYear,
      balances,
    };
  }

  // === Private Methods ===

  /**
   * Tính số ngày làm việc giữa 2 ngày (không tính T7, CN)
   */
  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      // Không tính Thứ 7 (6) và Chủ nhật (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }
}
