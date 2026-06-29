import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../common/prisma.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { RecruitmentEvents } from '../events/recruitment.events';
import { buildPaginationResponse, calculateSkip } from '../common/pagination.helper';

/**
 * Service quản lý tin tuyển dụng
 */
@Injectable()
export class JobPostingsService {
  constructor(
    private prisma: PrismaService,
    @Inject('NATS_SERVICE') private natsClient: ClientProxy,
  ) {}

  /**
   * Tạo tin tuyển dụng mới
   */
  async create(dto: CreateJobPostingDto) {
    const jobPosting = await this.prisma.jobPosting.create({
      data: {
        ...dto,
        status: 'draft',
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
    });

    return jobPosting;
  }

  /**
   * Danh sách tin tuyển dụng với phân trang
   */
  async findAll(params: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = params;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.jobPosting.findMany({
        where,
        skip: calculateSkip(page, limit),
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.jobPosting.count({ where }),
    ]);

    return buildPaginationResponse(data, total, page, limit);
  }

  /**
   * Danh sách tin tuyển dụng đang hoạt động (public)
   */
  async findActive() {
    return this.prisma.jobPosting.findMany({
      where: {
        status: 'active',
        OR: [
          { deadline: null },
          { deadline: { gte: new Date() } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Chi tiết tin tuyển dụng
   */
  async findOne(id: string) {
    const jobPosting = await this.prisma.jobPosting.findUnique({
      where: { id },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });

    if (!jobPosting) {
      throw new NotFoundException(`Không tìm thấy tin tuyển dụng với ID: ${id}`);
    }

    return jobPosting;
  }

  /**
   * Cập nhật tin tuyển dụng
   */
  async update(id: string, dto: CreateJobPostingDto) {
    const existing = await this.prisma.jobPosting.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy tin tuyển dụng với ID: ${id}`);
    }

    return this.prisma.jobPosting.update({
      where: { id },
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
    });
  }

  /**
   * Cập nhật trạng thái (draft → active → closed)
   */
  async updateStatus(id: string, status: string) {
    const validStatuses = ['draft', 'active', 'closed'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Trạng thái không hợp lệ. Các giá trị hợp lệ: ${validStatuses.join(', ')}`,
      );
    }

    const existing = await this.prisma.jobPosting.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy tin tuyển dụng với ID: ${id}`);
    }

    const updated = await this.prisma.jobPosting.update({
      where: { id },
      data: { status },
    });

    // Phát event khi publish hoặc đóng tin
    if (status === 'active') {
      this.natsClient.emit(RecruitmentEvents.JOB_POSTING_PUBLISHED, {
        jobPostingId: updated.id,
        title: updated.title,
        position: updated.position,
      });
    } else if (status === 'closed') {
      this.natsClient.emit(RecruitmentEvents.JOB_POSTING_CLOSED, {
        jobPostingId: updated.id,
        title: updated.title,
      });
    }

    return updated;
  }

  /**
   * Xóa tin tuyển dụng (chỉ cho phép xóa bản nháp)
   */
  async remove(id: string) {
    const existing = await this.prisma.jobPosting.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy tin tuyển dụng với ID: ${id}`);
    }

    if (existing.status !== 'draft') {
      throw new BadRequestException('Chỉ có thể xóa tin tuyển dụng ở trạng thái nháp');
    }

    await this.prisma.jobPosting.delete({ where: { id } });
    return { message: 'Đã xóa tin tuyển dụng thành công' };
  }
}
