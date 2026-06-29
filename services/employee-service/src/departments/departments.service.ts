import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Danh sách phòng ban */
  async findAll() {
    return this.prisma.department.findMany({
      where: { deletedAt: null },
      include: {
        parent: true,
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /** Danh sách phòng ban dạng cây */
  async findAllTree() {
    const departments = await this.prisma.department.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Xây dựng cấu trúc cây
    return this.buildTree(departments);
  }

  /** Chi tiết phòng ban */
  async findOne(id: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, deletedAt: null },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
        },
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Không tìm thấy phòng ban với ID: ${id}`);
    }

    return department;
  }

  /** Tạo phòng ban */
  async create(dto: CreateDepartmentDto) {
    // Kiểm tra mã phòng ban trùng
    const existing = await this.prisma.department.findFirst({
      where: { code: dto.code, deletedAt: null },
    });

    if (existing) {
      throw new BadRequestException(`Mã phòng ban "${dto.code}" đã tồn tại`);
    }

    // Kiểm tra phòng ban cha
    if (dto.parentId) {
      const parent = await this.prisma.department.findFirst({
        where: { id: dto.parentId, deletedAt: null },
      });
      if (!parent) {
        throw new NotFoundException('Phòng ban cha không tồn tại');
      }
    }

    return this.prisma.department.create({
      data: dto,
      include: {
        parent: true,
      },
    });
  }

  /** Cập nhật phòng ban */
  async update(id: string, dto: Partial<CreateDepartmentDto>) {
    await this.findOne(id);

    return this.prisma.department.update({
      where: { id },
      data: dto,
      include: {
        parent: true,
        _count: {
          select: { employees: true },
        },
      },
    });
  }

  /** Xóa phòng ban (soft delete) */
  async remove(id: string) {
    const department = await this.findOne(id);

    // Kiểm tra còn nhân viên không
    const employeeCount = await this.prisma.employee.count({
      where: { departmentId: id, deletedAt: null },
    });

    if (employeeCount > 0) {
      throw new BadRequestException(
        `Không thể xóa phòng ban đang có ${employeeCount} nhân viên`,
      );
    }

    return this.prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /** Xây dựng cấu trúc cây phòng ban */
  private buildTree(departments: any[], parentId: string | null = null): any[] {
    return departments
      .filter((dept) => dept.parentId === parentId)
      .map((dept) => ({
        ...dept,
        children: this.buildTree(departments, dept.id),
      }));
  }
}
