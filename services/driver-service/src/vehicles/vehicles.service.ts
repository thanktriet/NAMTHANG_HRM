import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lấy danh sách phương tiện */
  async findAll(query: any) {
    const where: any = {};

    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.organizationId) where.organizationId = query.organizationId;

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /** Lấy danh sách phương tiện khả dụng (chưa được gán) */
  async findAvailable() {
    return this.prisma.vehicle.findMany({
      where: { status: 'available' },
      orderBy: { plateNumber: 'asc' },
    });
  }

  /** Lấy chi tiết phương tiện */
  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException(`Không tìm thấy phương tiện với ID: ${id}`);
    }
    return vehicle;
  }

  /** Tạo mới phương tiện */
  async create(dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: {
        ...dto,
        status: 'available',
      },
    });
  }

  /** Cập nhật thông tin phương tiện */
  async update(id: string, dto: Partial<CreateVehicleDto>) {
    await this.findOne(id);
    return this.prisma.vehicle.update({
      where: { id },
      data: dto,
    });
  }

  /** Cập nhật trạng thái phương tiện */
  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    return this.prisma.vehicle.update({
      where: { id },
      data: { status },
    });
  }

  /** Xóa phương tiện (soft delete) */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.vehicle.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
