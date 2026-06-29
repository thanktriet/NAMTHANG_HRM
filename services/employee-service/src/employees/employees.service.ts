import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { FilterEmployeeDto } from './dto/filter-employee.dto';
import { buildPaginationMeta, calculateSkip } from '../common/pagination.helper';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Tạo nhân viên mới */
  async create(dto: CreateEmployeeDto) {
    const employeeCode = await this.generateEmployeeCode(
      dto.departmentId,
      dto.organizationId,
    );

    const employee = await this.prisma.employee.create({
      data: {
        ...dto,
        employeeCode,
        dateOfBirth: new Date(dto.dateOfBirth),
        idCardDate: dto.idCardDate ? new Date(dto.idCardDate) : null,
        hireDate: new Date(dto.hireDate),
      },
      include: {
        department: true,
        position: true,
        organization: true,
      },
    });

    return employee;
  }

  /** Danh sách nhân viên có phân trang */
  async findAll(filter: FilterEmployeeDto) {
    const { page = 1, limit = 20, search, departmentId, positionId, organizationId, status, sortBy = 'createdAt', sortOrder = 'desc' } = filter;
    const skip = calculateSkip(page, limit);

    const where: any = {
      deletedAt: null,
    };

    // Lọc theo phòng ban
    if (departmentId) {
      where.departmentId = departmentId;
    }

    // Lọc theo chức vụ
    if (positionId) {
      where.positionId = positionId;
    }

    // Lọc theo chi nhánh/tổ chức
    if (organizationId) {
      where.organizationId = organizationId;
    }

    // Lọc theo trạng thái
    if (status) {
      where.status = status;
    }

    // Tìm kiếm theo tên, mã NV, email, SĐT
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          department: true,
          position: true,
          organization: true,
        },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /** Chi tiết nhân viên */
  async findOne(id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
      include: {
        department: true,
        position: true,
        organization: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(`Không tìm thấy nhân viên với ID: ${id}`);
    }

    return employee;
  }

  /** Cập nhật nhân viên */
  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findOne(id); // Kiểm tra tồn tại

    const updateData: any = { ...dto };
    if (dto.dateOfBirth) updateData.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.idCardDate) updateData.idCardDate = new Date(dto.idCardDate);
    if (dto.hireDate) updateData.hireDate = new Date(dto.hireDate);

    return this.prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        department: true,
        position: true,
        organization: true,
      },
    });
  }

  /** Xóa mềm nhân viên */
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /** Lấy thành viên gia đình */
  async getFamily(employeeId: string) {
    await this.findOne(employeeId);

    return this.prisma.familyMember.findMany({
      where: { employeeId },
    });
  }

  /** Thêm thành viên gia đình */
  async addFamily(employeeId: string, data: any) {
    await this.findOne(employeeId);

    return this.prisma.familyMember.create({
      data: {
        ...data,
        employeeId,
      },
    });
  }

  /** Lấy lịch sử công tác */
  async getWorkHistory(employeeId: string) {
    await this.findOne(employeeId);

    return this.prisma.workHistory.findMany({
      where: { employeeId },
      orderBy: { effectiveDate: 'desc' },
      include: {
        fromDepartment: true,
        toDepartment: true,
        fromPosition: true,
        toPosition: true,
      },
    });
  }

  /** Thống kê nhân viên */
  async getStatistics() {
    const [total, byStatus, byDepartment] = await Promise.all([
      this.prisma.employee.count({ where: { deletedAt: null } }),
      this.prisma.employee.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: { id: true },
      }),
      this.prisma.employee.groupBy({
        by: ['departmentId'],
        where: { deletedAt: null },
        _count: { id: true },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
      })),
      byDepartment: byDepartment.map((item) => ({
        departmentId: item.departmentId,
        count: item._count.id,
      })),
    };
  }

  /** Tự động sinh mã nhân viên: NT-{DEPT}-{BRANCH}-{SEQ} */
  private async generateEmployeeCode(
    departmentId: string,
    organizationId: string,
  ): Promise<string> {
    // Lấy mã phòng ban
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
      select: { code: true },
    });

    // Lấy mã chi nhánh
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { code: true },
    });

    const deptCode = department?.code || 'GEN';
    const orgCode = organization?.code || 'HQ';

    // Tìm số thứ tự tiếp theo
    const lastEmployee = await this.prisma.employee.findFirst({
      where: {
        employeeCode: {
          startsWith: `NT-${deptCode}-${orgCode}-`,
        },
      },
      orderBy: { employeeCode: 'desc' },
      select: { employeeCode: true },
    });

    let seq = 1;
    if (lastEmployee) {
      const parts = lastEmployee.employeeCode.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }

    return `NT-${deptCode}-${orgCode}-${seq.toString().padStart(4, '0')}`;
  }
}
