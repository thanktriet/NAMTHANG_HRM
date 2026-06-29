import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as Docxtemplater from 'docxtemplater';
import * as PizZip from 'pizzip';
import { PrismaService } from '../common/prisma.service';
import { MinioService } from '../common/minio.service';
import { TemplatesService } from '../templates/templates.service';
import { GenerateDocumentDto } from './dto/generate-document.dto';
import { FilterDocumentDto, DocumentStatus } from './dto/filter-document.dto';
import { paginateResult } from '../common/pagination.helper';

/**
 * Service xử lý logic tạo và quản lý tài liệu đã sinh
 */
@Injectable()
export class GeneratedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
    private readonly templatesService: TemplatesService,
  ) {}

  /**
   * Tạo tài liệu từ mẫu + dữ liệu placeholder
   * Sử dụng docxtemplater để thay thế placeholder trong file .docx
   */
  async generate(dto: GenerateDocumentDto) {
    // Lấy thông tin mẫu tài liệu
    const template = await this.templatesService.findOne(dto.templateId);

    if (!template.filePath) {
      throw new BadRequestException(
        'Mẫu tài liệu chưa có file đính kèm để tạo tài liệu',
      );
    }

    // Tải file mẫu từ MinIO
    const templateBuffer = await this.minioService.getFileBuffer(template.filePath);

    // Sử dụng docxtemplater để thay thế placeholder
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Điền dữ liệu vào các placeholder
    doc.render(dto.data);

    // Tạo buffer file đã điền dữ liệu
    const generatedBuffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    // Tạo tên file duy nhất
    const timestamp = Date.now();
    const fileName = `generated/${dto.employeeId}/${timestamp}_${template.name}.docx`;

    // Upload file đã tạo lên MinIO
    await this.minioService.uploadFile(fileName, generatedBuffer);

    // Lưu thông tin tài liệu vào database
    const document = await this.prisma.generatedDocument.create({
      data: {
        templateId: dto.templateId,
        employeeId: dto.employeeId,
        filePath: fileName,
        status: DocumentStatus.DRAFT,
        data: dto.data,
      },
    });

    return {
      message: 'Tạo tài liệu thành công',
      data: document,
    };
  }

  /**
   * Lấy danh sách tài liệu đã tạo (có phân trang và lọc)
   */
  async findAll(filter: FilterDocumentDto) {
    const where: Record<string, unknown> = {};

    if (filter.templateId) {
      where.templateId = filter.templateId;
    }
    if (filter.employeeId) {
      where.employeeId = filter.employeeId;
    }
    if (filter.status) {
      where.status = filter.status;
    }

    const page = filter.page || 1;
    const limit = filter.limit || 10;

    const [data, total] = await Promise.all([
      this.prisma.generatedDocument.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          template: true,
        },
      }),
      this.prisma.generatedDocument.count({ where }),
    ]);

    return paginateResult(data, total, page, limit);
  }

  /**
   * Lấy chi tiết tài liệu đã tạo theo ID
   */
  async findOne(id: string) {
    const document = await this.prisma.generatedDocument.findUnique({
      where: { id },
      include: {
        template: true,
      },
    });

    if (!document) {
      throw new NotFoundException(`Không tìm thấy tài liệu với ID: ${id}`);
    }

    return document;
  }

  /**
   * Tải xuống file tài liệu
   */
  async download(id: string) {
    const document = await this.findOne(id);

    if (!document.filePath) {
      throw new BadRequestException('Tài liệu không có file để tải xuống');
    }

    const stream = await this.minioService.getFileStream(document.filePath);
    const fileName = document.filePath.split('/').pop() || 'document.docx';

    return { stream, fileName };
  }

  /**
   * Cập nhật trạng thái tài liệu thành "đã ký"
   */
  async sign(id: string) {
    const document = await this.findOne(id);

    if (document.status === DocumentStatus.SIGNED) {
      throw new BadRequestException('Tài liệu đã được ký trước đó');
    }

    const updated = await this.prisma.generatedDocument.update({
      where: { id },
      data: {
        status: DocumentStatus.SIGNED,
        signedAt: new Date(),
      },
    });

    return {
      message: 'Ký tài liệu thành công',
      data: updated,
    };
  }
}
