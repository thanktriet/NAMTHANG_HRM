import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  PaginationHelper,
  PaginatedResult,
} from '../common/pagination.helper';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { FilterEvaluationDto } from './dto/filter-evaluation.dto';

/**
 * Service quản lý đánh giá KPI nhân viên
 */
@Injectable()
export class EvaluationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Xếp loại dựa trên tổng điểm
   * >= 90: Xuất sắc
   * >= 75: Tốt
   * >= 60: Đạt
   * < 60: Không đạt
   */
  private calculateGrade(totalScore: number): string {
    if (totalScore >= 90) return 'Xuất sắc';
    if (totalScore >= 75) return 'Tốt';
    if (totalScore >= 60) return 'Đạt';
    return 'Không đạt';
  }

  /**
   * Tính tổng điểm từ các chi tiết đánh giá (trung bình có trọng số)
   */
  private calculateTotalScore(
    details: { score: number; templateId: string }[],
  ): number {
    if (details.length === 0) return 0;
    const total = details.reduce((sum, detail) => sum + detail.score, 0);
    return Math.round((total / details.length) * 100) / 100;
  }

  /**
   * Tạo bản đánh giá KPI mới
   */
  async create(dto: CreateEvaluationDto) {
    // Kiểm tra kỳ đánh giá tồn tại
    const period = await this.prisma.kpiPeriod.findUnique({
      where: { id: dto.periodId },
    });

    if (!period) {
      throw new NotFoundException(
        `Không tìm thấy kỳ đánh giá với ID: ${dto.periodId}`,
      );
    }

    // Không cho phép đánh giá trong kỳ đã đóng
    if (period.status === 'closed') {
      throw new BadRequestException(
        'Không thể tạo đánh giá trong kỳ đánh giá đã đóng',
      );
    }

    // Kiểm tra nhân viên đã được đánh giá trong kỳ này chưa
    const existing = await this.prisma.kpiEvaluation.findFirst({
      where: {
        periodId: dto.periodId,
        employeeId: dto.employeeId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Nhân viên này đã được đánh giá trong kỳ đánh giá này',
      );
    }

    // Tính tổng điểm và xếp loại
    const totalScore = this.calculateTotalScore(dto.details);
    const grade = this.calculateGrade(totalScore);

    // Tạo bản đánh giá cùng chi tiết
    const evaluation = await this.prisma.kpiEvaluation.create({
      data: {
        periodId: dto.periodId,
        employeeId: dto.employeeId,
        totalScore,
        grade,
        comments: dto.comments,
        details: {
          create: dto.details.map((detail) => ({
            templateId: detail.templateId,
            targetValue: detail.targetValue,
            actualValue: detail.actualValue,
            score: detail.score,
            notes: detail.notes,
          })),
        },
      },
      include: {
        details: true,
      },
    });

    return evaluation;
  }

  /**
   * Danh sách đánh giá KPI có bộ lọc và phân trang
   */
  async findAll(filter: FilterEvaluationDto): Promise<PaginatedResult<any>> {
    const { skip, take, page, limit } =
      PaginationHelper.getPaginationParams(filter);

    // Xây dựng điều kiện lọc
    const where: any = {};

    if (filter.periodId) {
      where.periodId = filter.periodId;
    }

    if (filter.departmentId) {
      where.employee = {
        departmentId: filter.departmentId,
      };
    }

    if (filter.grade) {
      where.grade = filter.grade;
    }

    const [evaluations, totalItems] = await Promise.all([
      this.prisma.kpiEvaluation.findMany({
        where,
        skip,
        take,
        include: {
          details: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.kpiEvaluation.count({ where }),
    ]);

    return PaginationHelper.createPaginatedResult(
      evaluations,
      totalItems,
      page,
      limit,
    );
  }

  /**
   * Chi tiết đánh giá theo ID
   */
  async findOne(id: string) {
    const evaluation = await this.prisma.kpiEvaluation.findUnique({
      where: { id },
      include: {
        details: true,
      },
    });

    if (!evaluation) {
      throw new NotFoundException(
        `Không tìm thấy bản đánh giá với ID: ${id}`,
      );
    }

    return evaluation;
  }

  /**
   * Danh sách đánh giá theo nhân viên
   */
  async findByEmployee(employeeId: string) {
    const evaluations = await this.prisma.kpiEvaluation.findMany({
      where: { employeeId },
      include: {
        details: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return evaluations;
  }

  /**
   * Thống kê điểm trung bình theo phòng ban
   */
  async getStats() {
    const stats = await this.prisma.kpiEvaluation.groupBy({
      by: ['employeeId'],
      _avg: {
        totalScore: true,
      },
      _count: {
        id: true,
      },
    });

    // Lấy thông tin phòng ban của từng nhân viên và nhóm lại
    const employeeIds = stats.map((s) => s.employeeId);

    const employees = await this.prisma.employee.findMany({
      where: { id: { in: employeeIds } },
      select: { id: true, departmentId: true },
    });

    // Tạo map nhân viên -> phòng ban
    const employeeDeptMap = new Map<string, string>();
    employees.forEach((emp) => {
      employeeDeptMap.set(emp.id, emp.departmentId);
    });

    // Nhóm thống kê theo phòng ban
    const departmentStats = new Map<
      string,
      { totalScore: number; count: number }
    >();

    stats.forEach((stat) => {
      const deptId = employeeDeptMap.get(stat.employeeId) || 'unknown';
      const current = departmentStats.get(deptId) || {
        totalScore: 0,
        count: 0,
      };
      current.totalScore += (stat._avg.totalScore || 0) * stat._count.id;
      current.count += stat._count.id;
      departmentStats.set(deptId, current);
    });

    // Tính điểm trung bình từng phòng ban
    const result: Array<{
      departmentId: string;
      averageScore: number;
      totalEvaluations: number;
    }> = [];

    departmentStats.forEach((value, departmentId) => {
      result.push({
        departmentId,
        averageScore:
          Math.round((value.totalScore / value.count) * 100) / 100,
        totalEvaluations: value.count,
      });
    });

    // Sắp xếp theo điểm trung bình giảm dần
    result.sort((a, b) => b.averageScore - a.averageScore);

    return result;
  }
}
