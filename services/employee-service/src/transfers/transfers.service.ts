import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { buildPaginationMeta, calculateSkip } from '../common/pagination.helper';

@Injectable()
export class TransfersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Tạo quyết định điều chuyển */
  async create(dto: CreateTransferDto) {
    // Kiểm tra nhân viên tồn tại
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException(`Không tìm thấy nhân viên với ID: ${dto.employeeId}`);
    }

    // Tạo bản ghi điều chuyển
    const transfer = await this.prisma.transfer.create({
      data: {
        employeeId: dto.employeeId,
        fromDepartmentId: dto.fromDepartmentId,
        toDepartmentId: dto.toDepartmentId,
        fromPositionId: dto.fromPositionId,
        toPositionId: dto.toPositionId,
        fromOrganizationId: dto.fromOrganizationId,
        toOrganizationId: dto.toOrganizationId,
        effectiveDate: new Date(dto.effectiveDate),
        reason: dto.reason,
        decisionNumber: dto.decisionNumber,
      },
      include: {
        employee: true,
        fromDepartment: true,
        toDepartment: true,
        fromPosition: true,
        toPosition: true,
      },
    });

    // Cập nhật thông tin nhân viên
    const updateData: any = {};
    if (dto.toDepartmentId) updateData.departmentId = dto.toDepartmentId;
    if (dto.toPositionId) updateData.positionId = dto.toPositionId;
    if (dto.toOrganizationId) updateData.organizationId = dto.toOrganizationId;

    if (Object.keys(updateData).length > 0) {
      await this.prisma.employee.update({
        where: { id: dto.employeeId },
        data: updateData,
      });
    }

    return transfer;
  }

  /** Danh sách điều chuyển */
  async findAll(page: number = 1, limit: number = 20) {
    const skip = calculateSkip(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.transfer.findMany({
        skip,
        take: limit,
        orderBy: { effectiveDate: 'desc' },
        include: {
          employee: {
            select: { id: true, fullName: true, employeeCode: true },
          },
          fromDepartment: { select: { id: true, name: true } },
          toDepartment: { select: { id: true, name: true } },
          fromPosition: { select: { id: true, name: true } },
          toPosition: { select: { id: true, name: true } },
        },
      }),
      this.prisma.transfer.count(),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /** Lịch sử điều chuyển của nhân viên */
  async findByEmployee(employeeId: string) {
    return this.prisma.transfer.findMany({
      where: { employeeId },
      orderBy: { effectiveDate: 'desc' },
      include: {
        fromDepartment: { select: { id: true, name: true } },
        toDepartment: { select: { id: true, name: true } },
        fromPosition: { select: { id: true, name: true } },
        toPosition: { select: { id: true, name: true } },
      },
    });
  }
}
