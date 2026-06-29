import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { FilterContractDto } from './dto/filter-contract.dto';
import { RenewContractDto } from './dto/renew-contract.dto';
import { paginate } from '../common/pagination.helper';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo mã hợp đồng tự động: HD-{NĂM}-{SỐ THỨ TỰ}
  private async generateContractCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `HD-${year}-`;

    // Tìm hợp đồng cuối cùng trong năm để lấy số thứ tự tiếp theo
    const lastContract = await this.prisma.contract.findFirst({
      where: { contractCode: { startsWith: prefix } },
      orderBy: { contractCode: 'desc' },
    });

    let seq = 1;
    if (lastContract) {
      const lastSeq = parseInt(lastContract.contractCode.split('-')[2], 10);
      seq = lastSeq + 1;
    }

    return `${prefix}${seq.toString().padStart(4, '0')}`;
  }

  // Lấy danh sách hợp đồng với bộ lọc
  async findAll(filter: FilterContractDto) {
    const { type, status, search, page = 1, limit = 10 } = filter;

    const where: any = {};

    // Lọc theo loại hợp đồng
    if (type) {
      where.contractType = type;
    }

    // Lọc theo trạng thái
    if (status) {
      where.status = status;
    }

    // Tìm kiếm theo tên nhân viên hoặc mã hợp đồng
    if (search) {
      where.OR = [
        { contractCode: { contains: search, mode: 'insensitive' } },
        { employeeName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.contract.count({ where });
    const data = await this.prisma.contract.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return paginate(data, total, page, limit);
  }

  // Lấy chi tiết hợp đồng
  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      throw new NotFoundException(`Không tìm thấy hợp đồng với ID: ${id}`);
    }

    return contract;
  }

  // Tạo hợp đồng mới
  async create(dto: CreateContractDto) {
    const contractCode = await this.generateContractCode();

    const contract = await this.prisma.contract.create({
      data: {
        contractCode,
        employeeId: dto.employeeId,
        contractType: dto.contractType,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        baseSalary: dto.baseSalary,
        allowances: dto.allowances || {},
        workingHours: dto.workingHours,
        templateId: dto.templateId,
        status: 'active',
      },
    });

    return contract;
  }

  // Cập nhật hợp đồng
  async update(id: string, dto: Partial<CreateContractDto>) {
    await this.findOne(id); // Kiểm tra tồn tại

    const updateData: any = { ...dto };
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);

    return this.prisma.contract.update({
      where: { id },
      data: updateData,
    });
  }

  // Thanh lý / chấm dứt hợp đồng
  async terminate(id: string, reason: string) {
    await this.findOne(id); // Kiểm tra tồn tại

    return this.prisma.contract.update({
      where: { id },
      data: {
        status: 'terminated',
        terminationDate: new Date(),
        terminationReason: reason,
      },
    });
  }

  // Gia hạn hợp đồng - tạo hợp đồng mới, lưu trữ hợp đồng cũ
  async renew(id: string, dto: RenewContractDto) {
    const oldContract = await this.findOne(id);

    // Đánh dấu hợp đồng cũ là đã gia hạn
    await this.prisma.contract.update({
      where: { id },
      data: {
        status: 'renewed',
        notes: dto.notes || 'Đã gia hạn sang hợp đồng mới',
      },
    });

    // Tạo hợp đồng mới dựa trên hợp đồng cũ
    const newContractCode = await this.generateContractCode();
    const newContract = await this.prisma.contract.create({
      data: {
        contractCode: newContractCode,
        employeeId: oldContract.employeeId,
        contractType: oldContract.contractType,
        startDate: oldContract.endDate || new Date(),
        endDate: new Date(dto.newEndDate),
        baseSalary: dto.newSalary || oldContract.baseSalary,
        allowances: oldContract.allowances as any,
        workingHours: oldContract.workingHours,
        templateId: oldContract.templateId,
        status: 'active',
        previousContractId: id,
        notes: dto.notes,
      },
    });

    return newContract;
  }

  // Tìm hợp đồng sắp hết hạn trong 30 ngày
  async findExpiring() {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    return this.prisma.contract.findMany({
      where: {
        status: 'active',
        endDate: {
          gte: today,
          lte: thirtyDaysLater,
        },
      },
      orderBy: { endDate: 'asc' },
    });
  }

  // Thống kê hợp đồng
  async getStats() {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    const [total, active, expiring, expired] = await Promise.all([
      // Tổng số hợp đồng
      this.prisma.contract.count(),
      // Hợp đồng đang hoạt động
      this.prisma.contract.count({ where: { status: 'active' } }),
      // Hợp đồng sắp hết hạn (30 ngày)
      this.prisma.contract.count({
        where: {
          status: 'active',
          endDate: { gte: today, lte: thirtyDaysLater },
        },
      }),
      // Hợp đồng đã hết hạn
      this.prisma.contract.count({
        where: {
          status: 'active',
          endDate: { lt: today },
        },
      }),
    ]);

    return { total, active, expiring, expired };
  }
}
