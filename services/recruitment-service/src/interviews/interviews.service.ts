import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../common/prisma.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { RecruitmentEvents } from '../events/recruitment.events';
import { buildPaginationResponse, calculateSkip } from '../common/pagination.helper';

/**
 * Service quản lý lịch phỏng vấn
 */
@Injectable()
export class InterviewsService {
  constructor(
    private prisma: PrismaService,
    @Inject('NATS_SERVICE') private natsClient: ClientProxy,
  ) {}

  /**
   * Lên lịch phỏng vấn mới
   */
  async create(dto: CreateInterviewDto) {
    // Kiểm tra ứng viên tồn tại
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: dto.candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(`Không tìm thấy ứng viên với ID: ${dto.candidateId}`);
    }

    const interview = await this.prisma.interview.create({
      data: {
        candidateId: dto.candidateId,
        scheduledAt: new Date(dto.scheduledAt),
        location: dto.location,
        interviewType: dto.interviewType,
        interviewerIds: dto.interviewerIds || [],
        interviewerNames: dto.interviewerNames || [],
        notes: dto.notes,
        status: 'scheduled',
      },
      include: {
        candidate: {
          select: { fullName: true, positionApplied: true, code: true },
        },
      },
    });

    // Phát event lịch phỏng vấn đã được lên lịch
    this.natsClient.emit(RecruitmentEvents.INTERVIEW_SCHEDULED, {
      interviewId: interview.id,
      candidateId: interview.candidateId,
      candidateName: interview.candidate.fullName,
      scheduledAt: interview.scheduledAt,
      location: interview.location,
      interviewerIds: interview.interviewerIds,
    });

    return interview;
  }

  /**
   * Danh sách lịch phỏng vấn
   */
  async findAll(params: { filter?: string; page?: number; limit?: number }) {
    const { filter, page = 1, limit = 20 } = params;
    const now = new Date();
    const where: any = {};

    if (filter === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      where.scheduledAt = { gte: startOfDay, lt: endOfDay };
    } else if (filter === 'upcoming') {
      where.scheduledAt = { gte: now };
      where.status = 'scheduled';
    } else if (filter === 'past') {
      where.scheduledAt = { lt: now };
    }

    const [data, total] = await Promise.all([
      this.prisma.interview.findMany({
        where,
        skip: calculateSkip(page, limit),
        take: limit,
        orderBy: { scheduledAt: 'asc' },
        include: {
          candidate: {
            select: { fullName: true, positionApplied: true, code: true },
          },
        },
      }),
      this.prisma.interview.count({ where }),
    ]);

    return buildPaginationResponse(data, total, page, limit);
  }

  /**
   * Lịch phỏng vấn hôm nay
   */
  async findToday() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    return this.prisma.interview.findMany({
      where: {
        scheduledAt: { gte: startOfDay, lt: endOfDay },
      },
      orderBy: { scheduledAt: 'asc' },
      include: {
        candidate: {
          select: { fullName: true, positionApplied: true, code: true, phone: true },
        },
      },
    });
  }

  /**
   * Lịch phỏng vấn sắp tới (7 ngày tới)
   */
  async findUpcoming() {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return this.prisma.interview.findMany({
      where: {
        scheduledAt: { gte: now, lte: nextWeek },
        status: 'scheduled',
      },
      orderBy: { scheduledAt: 'asc' },
      include: {
        candidate: {
          select: { fullName: true, positionApplied: true, code: true },
        },
      },
    });
  }

  /**
   * Chi tiết lịch phỏng vấn
   */
  async findOne(id: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        candidate: true,
      },
    });

    if (!interview) {
      throw new NotFoundException(`Không tìm thấy lịch phỏng vấn với ID: ${id}`);
    }

    return interview;
  }

  /**
   * Ghi nhận kết quả phỏng vấn (pass/fail)
   */
  async updateResult(id: string, dto: UpdateResultDto) {
    const interview = await this.prisma.interview.findUnique({ where: { id } });

    if (!interview) {
      throw new NotFoundException(`Không tìm thấy lịch phỏng vấn với ID: ${id}`);
    }

    const updated = await this.prisma.interview.update({
      where: { id },
      data: {
        result: dto.result,
        resultNotes: dto.notes,
        overallScore: dto.overallScore,
        status: 'completed',
        completedAt: new Date(),
      },
      include: {
        candidate: {
          select: { fullName: true, positionApplied: true },
        },
      },
    });

    // Phát event phỏng vấn hoàn thành
    this.natsClient.emit(RecruitmentEvents.INTERVIEW_COMPLETED, {
      interviewId: updated.id,
      candidateId: updated.candidateId,
      result: updated.result,
      overallScore: updated.overallScore,
    });

    return updated;
  }
}
