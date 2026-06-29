import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Danh sách tổ chức/chi nhánh */
  async findAll() {
    return this.prisma.organization.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /** Chi tiết tổ chức */
  async findOne(id: string) {
    const organization = await this.prisma.organization.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException(`Không tìm thấy tổ chức với ID: ${id}`);
    }

    return organization;
  }

  /** Tạo tổ chức */
  async create(dto: CreateOrganizationDto) {
    const existing = await this.prisma.organization.findFirst({
      where: { code: dto.code, deletedAt: null },
    });

    if (existing) {
      throw new BadRequestException(`Mã tổ chức "${dto.code}" đã tồn tại`);
    }

    return this.prisma.organization.create({
      data: dto,
    });
  }

  /** Cập nhật tổ chức */
  async update(id: string, dto: Partial<CreateOrganizationDto>) {
    await this.findOne(id);

    return this.prisma.organization.update({
      where: { id },
      data: dto,
    });
  }

  /** Xóa tổ chức (soft delete) */
  async remove(id: string) {
    await this.findOne(id);

    const employeeCount = await this.prisma.employee.count({
      where: { organizationId: id, deletedAt: null },
    });

    if (employeeCount > 0) {
      throw new BadRequestException(
        `Không thể xóa tổ chức đang có ${employeeCount} nhân viên`,
      );
    }

    return this.prisma.organization.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
