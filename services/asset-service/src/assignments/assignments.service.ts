import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { ReturnAssetDto } from './dto/return-asset.dto';

/**
 * Service quản lý việc giao/trả tài sản
 */
@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Giao tài sản cho nhân viên
   * Kiểm tra tài sản có sẵn (status === 'available') trước khi giao
   * Cập nhật trạng thái tài sản sang 'in_use' sau khi giao
   */
  async assign(dto: CreateAssignmentDto) {
    // Kiểm tra tài sản có tồn tại không
    const asset = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
    });

    if (!asset) {
      throw new NotFoundException('Không tìm thấy tài sản');
    }

    // Kiểm tra tài sản có sẵn để giao không
    if (asset.status !== 'available') {
      throw new BadRequestException(
        'Tài sản không khả dụng để giao. Trạng thái hiện tại: ' + asset.status,
      );
    }

    // Tạo phiếu giao tài sản và cập nhật trạng thái tài sản trong một transaction
    const [assignment] = await this.prisma.$transaction([
      this.prisma.assetAssignment.create({
        data: {
          assetId: dto.assetId,
          employeeId: dto.employeeId,
          assignDate: new Date(),
          conditionOnAssign: dto.conditionOnAssign,
          notes: dto.notes,
        },
        include: {
          asset: true,
        },
      }),
      this.prisma.asset.update({
        where: { id: dto.assetId },
        data: { status: 'in_use' },
      }),
    ]);

    return assignment;
  }

  /**
   * Lấy danh sách tất cả phiếu giao tài sản
   * Bao gồm thông tin tài sản
   */
  async findAll() {
    return this.prisma.assetAssignment.findMany({
      include: {
        asset: true,
      },
      orderBy: {
        assignDate: 'desc',
      },
    });
  }

  /**
   * Xử lý trả tài sản
   * Cập nhật ngày trả, tình trạng khi trả, ghi chú
   * Cập nhật trạng thái tài sản về 'available'
   */
  async returnAsset(id: string, dto: ReturnAssetDto) {
    // Kiểm tra phiếu giao có tồn tại không
    const assignment = await this.prisma.assetAssignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException('Không tìm thấy phiếu giao tài sản');
    }

    // Kiểm tra tài sản đã được trả chưa
    if (assignment.returnDate) {
      throw new BadRequestException('Tài sản này đã được trả trước đó');
    }

    // Cập nhật phiếu giao và trạng thái tài sản trong một transaction
    const [updatedAssignment] = await this.prisma.$transaction([
      this.prisma.assetAssignment.update({
        where: { id },
        data: {
          returnDate: new Date(),
          conditionOnReturn: dto.conditionOnReturn,
          notes: dto.notes,
        },
        include: {
          asset: true,
        },
      }),
      this.prisma.asset.update({
        where: { id: assignment.assetId },
        data: { status: 'available' },
      }),
    ]);

    return updatedAssignment;
  }

  /**
   * Lấy danh sách phiếu giao tài sản theo mã nhân viên
   */
  async findByEmployee(employeeId: string) {
    return this.prisma.assetAssignment.findMany({
      where: { employeeId },
      include: {
        asset: true,
      },
      orderBy: {
        assignDate: 'desc',
      },
    });
  }
}
