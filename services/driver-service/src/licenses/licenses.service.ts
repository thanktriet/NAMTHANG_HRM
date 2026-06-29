import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { FilterLicenseDto } from './dto/filter-license.dto';

@Injectable()
export class LicensesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lấy danh sách GPLX với bộ lọc */
  async findAll(filter: FilterLicenseDto) {
    const where: any = {};

    if (filter.licenseClass) {
      where.licenseClass = filter.licenseClass;
    }
    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.employeeId) {
      where.employeeId = filter.employeeId;
    }

    const [data, total] = await Promise.all([
      this.prisma.driverLicense.findMany({
        where,
        skip: filter.skip || 0,
        take: filter.take || 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driverLicense.count({ where }),
    ]);

    return { data, total, page: filter.page || 1, limit: filter.take || 20 };
  }

  /** Lấy danh sách GPLX sắp hết hạn trong 30 ngày */
  async findExpiring() {
    const now = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(now.getDate() + 30);

    return this.prisma.driverLicense.findMany({
      where: {
        expiryDate: {
          gte: now,
          lte: thirtyDaysLater,
        },
        status: 'active',
      },
      orderBy: { expiryDate: 'asc' },
    });
  }

  /** Lấy chi tiết GPLX theo ID */
  async findOne(id: string) {
    const license = await this.prisma.driverLicense.findUnique({ where: { id } });
    if (!license) {
      throw new NotFoundException(`Không tìm thấy GPLX với ID: ${id}`);
    }
    return license;
  }

  /** Tạo mới GPLX */
  async create(dto: CreateLicenseDto) {
    return this.prisma.driverLicense.create({
      data: {
        ...dto,
        status: 'active',
      },
    });
  }

  /** Cập nhật thông tin GPLX */
  async update(id: string, dto: Partial<CreateLicenseDto>) {
    await this.findOne(id);
    return this.prisma.driverLicense.update({
      where: { id },
      data: dto,
    });
  }

  /** Ghi nhận gia hạn GPLX */
  async renew(id: string, newExpiryDate: string) {
    await this.findOne(id);
    return this.prisma.driverLicense.update({
      where: { id },
      data: {
        expiryDate: new Date(newExpiryDate),
        status: 'active',
        renewedAt: new Date(),
      },
    });
  }
}
