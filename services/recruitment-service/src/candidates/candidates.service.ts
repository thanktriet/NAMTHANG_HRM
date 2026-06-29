import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as QRCode from 'qrcode';
import { PrismaService } from '../common/prisma.service';
import { MinioService } from '../common/minio.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { FilterCandidateDto } from './dto/filter-candidate.dto';
import { LookupCandidateDto } from './dto/lookup-candidate.dto';
import { RecruitmentEvents } from '../events/recruitment.events';
import { buildPaginationResponse, calculateSkip } from '../common/pagination.helper';

/**
 * Trạng thái hợp lệ cho ứng viên
 */
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  new: ['screening', 'rejected'],
  screening: ['interview', 'rejected'],
  interview: ['evaluation', 'rejected'],
  evaluation: ['offer', 'rejected'],
  offer: ['hired', 'rejected'],
  hired: [],
  rejected: ['new'], // Cho phép xem xét lại
};

@Injectable()
export class CandidatesService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
    @Inject('NATS_SERVICE') private natsClient: ClientProxy,
  ) {}

  /**
   * Tạo ứng viên mới với mã tự động (UV-{YEAR}-{SEQ})
   */
  async create(dto: CreateCandidateDto) {
    // Sinh mã ứng viên tự động
    const code = await this.generateCandidateCode();

    // Tạo QR code cho đơn ứng tuyển
    const qrCodeData = await QRCode.toDataURL(
      JSON.stringify({ code, phone: dto.phone }),
    );

    const candidate = await this.prisma.candidate.create({
      data: {
        ...dto,
        code,
        qrCode: qrCodeData,
        status: 'new',
        dateOfBirth: new Date(dto.dateOfBirth),
        idCardDate: dto.idCardDate ? new Date(dto.idCardDate) : undefined,
      },
    });

    // Phát event candidate.created
    this.natsClient.emit(RecruitmentEvents.CANDIDATE_CREATED, {
      candidateId: candidate.id,
      fullName: candidate.fullName,
      code: candidate.code,
      positionApplied: candidate.positionApplied,
    });

    return candidate;
  }

  /**
   * Danh sách ứng viên với bộ lọc và phân trang
   */
  async findAll(filterDto: FilterCandidateDto) {
    const { page = 1, limit = 20, status, position, dateFrom, dateTo, search } = filterDto;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (position) {
      where.positionApplied = { contains: position, mode: 'insensitive' };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        skip: calculateSkip(page, limit),
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.candidate.count({ where }),
    ]);

    return buildPaginationResponse(data, total, page, limit);
  }

  /**
   * Chi tiết ứng viên theo ID
   */
  async findOne(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        documents: true,
        interviews: true,
        evaluations: true,
      },
    });

    if (!candidate) {
      throw new NotFoundException(`Không tìm thấy ứng viên với ID: ${id}`);
    }

    return candidate;
  }

  /**
   * Cập nhật trạng thái với validation chuyển đổi
   */
  async updateStatus(id: string, dto: UpdateStatusDto) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id } });

    if (!candidate) {
      throw new NotFoundException(`Không tìm thấy ứng viên với ID: ${id}`);
    }

    // Kiểm tra chuyển đổi trạng thái hợp lệ
    const allowedTransitions = VALID_STATUS_TRANSITIONS[candidate.status] || [];
    if (!allowedTransitions.includes(dto.status)) {
      throw new BadRequestException(
        `Không thể chuyển từ trạng thái "${candidate.status}" sang "${dto.status}". ` +
        `Trạng thái hợp lệ: ${allowedTransitions.join(', ')}`,
      );
    }

    const updated = await this.prisma.candidate.update({
      where: { id },
      data: {
        status: dto.status,
        statusNotes: dto.notes,
        statusUpdatedAt: new Date(),
      },
    });

    // Nếu được tuyển dụng, phát event để tạo hồ sơ nhân viên
    if (dto.status === 'hired') {
      this.natsClient.emit(RecruitmentEvents.CANDIDATE_HIRED, {
        candidateId: updated.id,
        fullName: updated.fullName,
        dateOfBirth: updated.dateOfBirth,
        gender: updated.gender,
        idCardNumber: updated.idCardNumber,
        email: updated.email,
        phone: updated.phone,
        position: updated.positionApplied,
      });
    }

    // Phát event thay đổi trạng thái
    this.natsClient.emit(RecruitmentEvents.CANDIDATE_STATUS_CHANGED, {
      candidateId: updated.id,
      previousStatus: candidate.status,
      newStatus: dto.status,
    });

    return updated;
  }

  /**
   * Tra cứu công khai theo mã ứng viên + SĐT
   */
  async lookup(dto: LookupCandidateDto) {
    const candidate = await this.prisma.candidate.findFirst({
      where: {
        code: dto.code,
        phone: dto.phone,
      },
      select: {
        code: true,
        fullName: true,
        positionApplied: true,
        status: true,
        createdAt: true,
        statusUpdatedAt: true,
      },
    });

    if (!candidate) {
      throw new NotFoundException('Không tìm thấy hồ sơ. Vui lòng kiểm tra lại mã ứng viên và số điện thoại.');
    }

    return candidate;
  }

  /**
   * Thống kê pipeline tuyển dụng (số lượng theo từng trạng thái)
   */
  async getPipelineStats() {
    const stats = await this.prisma.candidate.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const pipeline = {
      new: 0,
      screening: 0,
      interview: 0,
      evaluation: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };

    stats.forEach((stat) => {
      pipeline[stat.status] = stat._count.id;
    });

    const total = Object.values(pipeline).reduce((sum, count) => sum + count, 0);

    return { pipeline, total };
  }

  /**
   * Upload tài liệu cho ứng viên
   */
  async uploadDocuments(id: string, files: Express.Multer.File[]) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id } });

    if (!candidate) {
      throw new NotFoundException(`Không tìm thấy ứng viên với ID: ${id}`);
    }

    const uploadedFiles = [];

    for (const file of files) {
      const filePath = await this.minioService.upload(file, `candidates/${id}`);

      const document = await this.prisma.candidateDocument.create({
        data: {
          candidateId: id,
          fileName: file.originalname,
          filePath,
          fileSize: file.size,
          mimeType: file.mimetype,
        },
      });

      uploadedFiles.push(document);
    }

    return { message: `Đã upload ${uploadedFiles.length} tài liệu thành công`, documents: uploadedFiles };
  }

  /**
   * Sinh mã ứng viên tự động theo format UV-{YEAR}-{SEQ}
   */
  private async generateCandidateCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `UV-${year}-`;

    // Tìm mã cuối cùng trong năm
    const lastCandidate = await this.prisma.candidate.findFirst({
      where: { code: { startsWith: prefix } },
      orderBy: { code: 'desc' },
    });

    let seq = 1;
    if (lastCandidate) {
      const lastSeq = parseInt(lastCandidate.code.replace(prefix, ''), 10);
      seq = lastSeq + 1;
    }

    return `${prefix}${seq.toString().padStart(5, '0')}`;
  }
}
