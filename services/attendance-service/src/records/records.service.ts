import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CheckInDto, CheckInMethod } from './dto/check-in.dto';
import { FilterAttendanceDto } from './dto/filter-attendance.dto';
import { buildPaginationOptions, buildPaginationResult } from '../common/pagination.helper';

/**
 * Service xử lý logic chấm công
 */
@Injectable()
export class RecordsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Chấm công vào - xác thực phương thức và kiểm tra đi trễ
   */
  async checkIn(dto: CheckInDto) {
    // Xác thực phương thức chấm công
    this.validateCheckInMethod(dto);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Kiểm tra đã chấm công vào hôm nay chưa
    const existingRecord = await this.prisma.attendanceRecord.findFirst({
      where: {
        employeeId: dto.employeeId,
        date: today,
        checkInTime: { not: null },
      },
    });

    if (existingRecord) {
      throw new BadRequestException('Nhân viên đã chấm công vào hôm nay');
    }

    // Lấy cấu hình ca làm việc của nhân viên
    const shiftConfig = await this.getEmployeeShiftConfig(dto.employeeId);

    // Tính toán trạng thái đi trễ
    const isLate = this.calculateLateStatus(now, shiftConfig);
    const lateMinutes = isLate ? this.calculateLateMinutes(now, shiftConfig) : 0;

    // Tạo bản ghi chấm công
    const record = await this.prisma.attendanceRecord.create({
      data: {
        employeeId: dto.employeeId,
        date: today,
        checkInTime: now,
        checkInMethod: dto.method,
        isLate,
        lateMinutes,
        latitude: dto.latitude,
        longitude: dto.longitude,
        wifiSSID: dto.wifiSSID,
        status: 'PRESENT',
      },
    });

    return {
      message: isLate
        ? `Chấm công vào thành công - Đi trễ ${lateMinutes} phút`
        : 'Chấm công vào thành công',
      data: record,
    };
  }

  /**
   * Chấm công ra - tính giờ OT nếu có
   */
  async checkOut(dto: CheckInDto) {
    // Xác thực phương thức chấm công
    this.validateCheckInMethod(dto);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Tìm bản ghi chấm công vào hôm nay
    const record = await this.prisma.attendanceRecord.findFirst({
      where: {
        employeeId: dto.employeeId,
        date: today,
        checkInTime: { not: null },
      },
    });

    if (!record) {
      throw new BadRequestException('Chưa chấm công vào hôm nay');
    }

    if (record.checkOutTime) {
      throw new BadRequestException('Đã chấm công ra hôm nay rồi');
    }

    // Lấy cấu hình ca làm việc
    const shiftConfig = await this.getEmployeeShiftConfig(dto.employeeId);

    // Tính toán về sớm và OT
    const isEarlyLeave = this.calculateEarlyLeaveStatus(now, shiftConfig);
    const earlyMinutes = isEarlyLeave ? this.calculateEarlyMinutes(now, shiftConfig) : 0;
    const otHours = this.calculateOTHours(now, shiftConfig);

    // Tính tổng giờ làm việc
    const totalHours = (now.getTime() - record.checkInTime.getTime()) / (1000 * 60 * 60);

    // Cập nhật bản ghi
    const updatedRecord = await this.prisma.attendanceRecord.update({
      where: { id: record.id },
      data: {
        checkOutTime: now,
        checkOutMethod: dto.method,
        isEarlyLeave,
        earlyMinutes,
        otHours,
        totalHours: Math.round(totalHours * 100) / 100,
      },
    });

    return {
      message: otHours > 0
        ? `Chấm công ra thành công - OT ${otHours} giờ`
        : 'Chấm công ra thành công',
      data: updatedRecord,
    };
  }

  /**
   * Lấy bảng chấm công theo tháng
   */
  async getMonthlyAttendance(filter: FilterAttendanceDto) {
    const { month, year, departmentId, employeeId, page, limit } = filter;
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    // Xác định khoảng thời gian
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const where: any = {
      date: { gte: startDate, lte: endDate },
    };

    if (employeeId) where.employeeId = employeeId;
    if (departmentId) where.employee = { departmentId };

    const { skip, take } = buildPaginationOptions(page, limit);

    const [records, total] = await Promise.all([
      this.prisma.attendanceRecord.findMany({
        where,
        skip,
        take,
        orderBy: [{ date: 'desc' }, { checkInTime: 'desc' }],
        include: { employee: { select: { id: true, fullName: true, employeeCode: true } } },
      }),
      this.prisma.attendanceRecord.count({ where }),
    ]);

    return buildPaginationResult(records, total, page, limit);
  }

  /**
   * Lấy log chấm công hôm nay
   */
  async getTodayLog(filter: FilterAttendanceDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where: any = { date: today };
    if (filter.departmentId) where.employee = { departmentId: filter.departmentId };
    if (filter.employeeId) where.employeeId = filter.employeeId;

    const records = await this.prisma.attendanceRecord.findMany({
      where,
      orderBy: { checkInTime: 'desc' },
      include: { employee: { select: { id: true, fullName: true, employeeCode: true } } },
    });

    return { data: records, date: today };
  }

  /**
   * Tổng hợp chấm công nhân viên theo tháng
   */
  async getEmployeeMonthlySummary(employeeId: string, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const records = await this.prisma.attendanceRecord.findMany({
      where: {
        employeeId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    // Tính toán tổng hợp
    const summary = {
      employeeId,
      month: targetMonth,
      year: targetYear,
      totalDays: records.length,
      presentDays: records.filter((r) => r.status === 'PRESENT').length,
      lateDays: records.filter((r) => r.isLate).length,
      earlyLeaveDays: records.filter((r) => r.isEarlyLeave).length,
      absentDays: records.filter((r) => r.status === 'ABSENT').length,
      totalLateMinutes: records.reduce((sum, r) => sum + (r.lateMinutes || 0), 0),
      totalEarlyMinutes: records.reduce((sum, r) => sum + (r.earlyMinutes || 0), 0),
      totalOTHours: records.reduce((sum, r) => sum + (r.otHours || 0), 0),
      totalWorkingHours: records.reduce((sum, r) => sum + (r.totalHours || 0), 0),
      records,
    };

    return summary;
  }

  /**
   * Thống kê chấm công tổng quan
   */
  async getStats(filter: FilterAttendanceDto) {
    const now = new Date();
    const targetMonth = filter.month || now.getMonth() + 1;
    const targetYear = filter.year || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const where: any = {
      date: { gte: startDate, lte: endDate },
    };
    if (filter.departmentId) where.employee = { departmentId: filter.departmentId };

    const records = await this.prisma.attendanceRecord.findMany({ where });

    return {
      month: targetMonth,
      year: targetYear,
      totalRecords: records.length,
      lateCount: records.filter((r) => r.isLate).length,
      earlyLeaveCount: records.filter((r) => r.isEarlyLeave).length,
      absentCount: records.filter((r) => r.status === 'ABSENT').length,
      otCount: records.filter((r) => r.otHours > 0).length,
      totalOTHours: records.reduce((sum, r) => sum + (r.otHours || 0), 0),
      totalLateMinutes: records.reduce((sum, r) => sum + (r.lateMinutes || 0), 0),
      averageWorkingHours:
        records.length > 0
          ? Math.round(
              (records.reduce((sum, r) => sum + (r.totalHours || 0), 0) / records.length) * 100,
            ) / 100
          : 0,
    };
  }

  // === Private Methods ===

  /**
   * Xác thực phương thức chấm công
   */
  private validateCheckInMethod(dto: CheckInDto): void {
    switch (dto.method) {
      case CheckInMethod.GPS:
        if (!dto.latitude || !dto.longitude) {
          throw new BadRequestException('Chấm công GPS yêu cầu tọa độ (latitude, longitude)');
        }
        break;
      case CheckInMethod.WIFI:
        if (!dto.wifiSSID) {
          throw new BadRequestException('Chấm công WiFi yêu cầu tên mạng (wifiSSID)');
        }
        break;
      case CheckInMethod.QR:
        if (!dto.qrToken) {
          throw new BadRequestException('Chấm công QR yêu cầu mã QR (qrToken)');
        }
        break;
      case CheckInMethod.FACE:
        if (!dto.faceData) {
          throw new BadRequestException('Chấm công khuôn mặt yêu cầu dữ liệu khuôn mặt (faceData)');
        }
        break;
    }
  }

  /**
   * Lấy cấu hình ca làm việc của nhân viên
   */
  private async getEmployeeShiftConfig(employeeId: string) {
    const config = await this.prisma.shiftConfig.findFirst({
      where: {
        employees: { some: { id: employeeId } },
      },
    });

    // Trả về cấu hình mặc định nếu không tìm thấy
    if (!config) {
      return {
        shiftStart: '08:00',
        shiftEnd: '17:00',
        lateThresholdMinutes: 15,
        breakStart: '12:00',
        breakEnd: '13:00',
      };
    }

    return config;
  }

  /**
   * Kiểm tra đi trễ
   */
  private calculateLateStatus(checkInTime: Date, shiftConfig: any): boolean {
    const [hours, minutes] = shiftConfig.shiftStart.split(':').map(Number);
    const shiftStart = new Date(checkInTime);
    shiftStart.setHours(hours, minutes + (shiftConfig.lateThresholdMinutes || 0), 0, 0);
    return checkInTime > shiftStart;
  }

  /**
   * Tính số phút đi trễ
   */
  private calculateLateMinutes(checkInTime: Date, shiftConfig: any): number {
    const [hours, minutes] = shiftConfig.shiftStart.split(':').map(Number);
    const shiftStart = new Date(checkInTime);
    shiftStart.setHours(hours, minutes, 0, 0);
    return Math.ceil((checkInTime.getTime() - shiftStart.getTime()) / (1000 * 60));
  }

  /**
   * Kiểm tra về sớm
   */
  private calculateEarlyLeaveStatus(checkOutTime: Date, shiftConfig: any): boolean {
    const [hours, minutes] = shiftConfig.shiftEnd.split(':').map(Number);
    const shiftEnd = new Date(checkOutTime);
    shiftEnd.setHours(hours, minutes, 0, 0);
    return checkOutTime < shiftEnd;
  }

  /**
   * Tính số phút về sớm
   */
  private calculateEarlyMinutes(checkOutTime: Date, shiftConfig: any): number {
    const [hours, minutes] = shiftConfig.shiftEnd.split(':').map(Number);
    const shiftEnd = new Date(checkOutTime);
    shiftEnd.setHours(hours, minutes, 0, 0);
    return Math.ceil((shiftEnd.getTime() - checkOutTime.getTime()) / (1000 * 60));
  }

  /**
   * Tính số giờ OT (tăng ca)
   */
  private calculateOTHours(checkOutTime: Date, shiftConfig: any): number {
    const [hours, minutes] = shiftConfig.shiftEnd.split(':').map(Number);
    const shiftEnd = new Date(checkOutTime);
    shiftEnd.setHours(hours, minutes, 0, 0);

    if (checkOutTime <= shiftEnd) return 0;

    const otMinutes = (checkOutTime.getTime() - shiftEnd.getTime()) / (1000 * 60);
    // Chỉ tính OT nếu làm thêm ít nhất 30 phút
    if (otMinutes < 30) return 0;

    return Math.round((otMinutes / 60) * 100) / 100;
  }
}
