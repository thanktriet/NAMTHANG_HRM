import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Gán phương tiện cho lái xe */
  async create(dto: CreateAssignmentDto) {
    // Kiểm tra phương tiện có khả dụng không
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Không tìm thấy phương tiện: ${dto.vehicleId}`);
    }

    if (vehicle.status !== 'available') {
      throw new BadRequestException('Phương tiện không khả dụng để phân công');
    }

    // Tạo phân công và cập nhật trạng thái phương tiện
    const [assignment] = await this.prisma.$transaction([
      this.prisma.vehicleAssignment.create({
        data: {
          ...dto,
          assignedAt: new Date(),
          status: 'active',
        },
      }),
      this.prisma.vehicle.update({
        where: { id: dto.vehicleId },
        data: { status: 'assigned' },
      }),
    ]);

    return assignment;
  }

  /** Danh sách phân công */
  async findAll(query: any) {
    const where: any = {};

    if (query.driverId) where.driverId = query.driverId;
    if (query.vehicleId) where.vehicleId = query.vehicleId;
    if (query.status) where.status = query.status;

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;

    const [data, total] = await Promise.all([
      this.prisma.vehicleAssignment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { assignedAt: 'desc' },
      }),
      this.prisma.vehicleAssignment.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /** Chi tiết phân công */
  async findOne(id: string) {
    const assignment = await this.prisma.vehicleAssignment.findUnique({ where: { id } });
    if (!assignment) {
      throw new NotFoundException(`Không tìm thấy phân công với ID: ${id}`);
    }
    return assignment;
  }

  /** Giải phóng phân công (trả phương tiện) */
  async release(id: string) {
    const assignment = await this.findOne(id);

    if (assignment.status !== 'active') {
      throw new BadRequestException('Phân công này đã được giải phóng');
    }

    // Cập nhật phân công và trạng thái phương tiện
    const [updated] = await this.prisma.$transaction([
      this.prisma.vehicleAssignment.update({
        where: { id },
        data: {
          status: 'released',
          releasedAt: new Date(),
        },
      }),
      this.prisma.vehicle.update({
        where: { id: assignment.vehicleId },
        data: { status: 'available' },
      }),
    ]);

    return updated;
  }
}
