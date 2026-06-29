import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';

/**
 * Service quản lý đánh giá ứng viên
 */
@Injectable()
export class EvaluationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo đánh giá mới
   */
  async create(dto: CreateEvaluationDto) {
    // Kiểm tra ứng viên tồn tại
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: dto.candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(`Không tìm thấy ứng viên với ID: ${dto.candidateId}`);
    }

    // Tính điểm trung bình từ các tiêu chí
    const scores = [
      dto.technicalScore,
      dto.communicationScore,
      dto.attitudeScore,
      dto.experienceScore,
      dto.cultureFitScore,
    ].filter((score) => score !== undefined && score !== null);

    const averageScore = scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0;

    const evaluation = await this.prisma.evaluation.create({
      data: {
        candidateId: dto.candidateId,
        evaluatorId: dto.evaluatorId,
        evaluatorName: dto.evaluatorName,
        interviewId: dto.interviewId,
        technicalScore: dto.technicalScore,
        communicationScore: dto.communicationScore,
        attitudeScore: dto.attitudeScore,
        experienceScore: dto.experienceScore,
        cultureFitScore: dto.cultureFitScore,
        overallScore: Math.round(averageScore * 10) / 10,
        strengths: dto.strengths,
        weaknesses: dto.weaknesses,
        recommendation: dto.recommendation,
        notes: dto.notes,
      },
      include: {
        candidate: {
          select: { fullName: true, positionApplied: true, code: true },
        },
      },
    });

    return evaluation;
  }

  /**
   * Lấy tất cả đánh giá của một ứng viên
   */
  async findByCandidateId(candidateId: string) {
    // Kiểm tra ứng viên tồn tại
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(`Không tìm thấy ứng viên với ID: ${candidateId}`);
    }

    const evaluations = await this.prisma.evaluation.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
    });

    // Tính điểm trung bình tổng hợp
    const avgScores = evaluations.length > 0
      ? {
          averageOverall: Math.round(
            (evaluations.reduce((sum, e) => sum + (e.overallScore || 0), 0) / evaluations.length) * 10,
          ) / 10,
          totalEvaluations: evaluations.length,
        }
      : { averageOverall: 0, totalEvaluations: 0 };

    return {
      candidate: {
        id: candidate.id,
        fullName: candidate.fullName,
        positionApplied: candidate.positionApplied,
      },
      summary: avgScores,
      evaluations,
    };
  }

  /**
   * Chi tiết đánh giá
   */
  async findOne(id: string) {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id },
      include: {
        candidate: {
          select: { fullName: true, positionApplied: true, code: true },
        },
      },
    });

    if (!evaluation) {
      throw new NotFoundException(`Không tìm thấy đánh giá với ID: ${id}`);
    }

    return evaluation;
  }
}
