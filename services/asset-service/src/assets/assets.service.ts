import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { FilterAssetDto } from './dto/filter-asset.dto';

/**
 * Service quản lý tài sản - CRUD, thống kê
 */
@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Danh sách tài sản có phân trang và lọc */
  async findAll(filter: FilterAssetDto) {
    const { page = 1, limit = 10, search, category, status, organizationId } = filter;
    const skip = (page - 1) * limit;

    // Xây dựng điều kiện lọc
    const where: any = {};

    // Lọc theo danh mục
    if (category) {
      where.category = category;
    }

    // Lọc theo trạng thái
    if (status) {
      where.status = status;
    }

    // Lọc theo tổ chức
    if (organizationId) {
      where.organizationId = organizationId;
    }

    // Tìm kiếm theo tên hoặc mã tài sản
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Truy vấn danh sách và tổng số bản ghi
    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Chi tiết tài sản theo ID */
  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException(`Không tìm thấy tài sản với ID: ${id}`);
    }

    return asset;
  }

  /** Tạo tài sản mới */
  async create(dto: CreateAssetDto) {
    const data: any = {
      ...dto,
    };

    // Chuyển đổi ngày mua nếu có
    if (dto.purchaseDate) {
      data.purchaseDate = new Date(dto.purchaseDate);
    }

    return this.prisma.asset.create({ data });
  }

  /** Cập nhật tài sản */
  async update(id: string, dto: UpdateAssetDto) {
    // Kiểm tra tài sản tồn tại
    await this.findOne(id);

    const updateData: any = { ...dto };

    // Chuyển đổi ngày mua nếu có
    if (dto.purchaseDate) {
      updateData.purchaseDate = new Date(dto.purchaseDate);
    }

    return this.prisma.asset.update({
      where: { id },
      data: updateData,
    });
  }

  /** Xóa tài sản */
  async remove(id: string) {
    // Kiểm tra tài sản tồn tại
    await this.findOne(id);

    return this.prisma.asset.delete({
      where: { id },
    });
  }

  /** Thống kê tổng quan tài sản */
  async getStats() {
    const [total, byStatus, totalValue] = await Promise.all([
      // Tổng số tài sản
      this.prisma.asset.count(),
      // Số lượng theo trạng thái
      this.prisma.asset.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      // Tổng giá trị tài sản
      this.prisma.asset.aggregate({
        _sum: { purchasePrice: true },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
      })),
      totalValue: totalValue._sum.purchasePrice || 0,
    };
  }

  /** Thống kê số lượng tài sản theo danh mục */
  async getCategoryStats() {
    const byCategory = await this.prisma.asset.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    return byCategory.map((item) => ({
      category: item.category,
      count: item._count.id,
    }));
  }
}
