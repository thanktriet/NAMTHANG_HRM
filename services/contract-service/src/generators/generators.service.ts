import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as Docxtemplater from 'docxtemplater';
import * as PizZip from 'pizzip';
import * as fs from 'fs';
import * as path from 'path';

// Import pdfmake
const PdfPrinter = require('pdfmake');

@Injectable()
export class GeneratorsService {
  constructor(private readonly prisma: PrismaService) {}

  // Thay thế các placeholder trong template
  private replacePlaceholders(
    template: string,
    data: Record<string, any>,
  ): string {
    let result = template;

    // Thay thế tất cả placeholder dạng {{Key}}
    Object.keys(data).forEach((key) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, data[key]?.toString() || '');
    });

    return result;
  }

  // Chuẩn bị dữ liệu placeholder từ hợp đồng
  private async prepareContractData(contractId: string): Promise<Record<string, any>> {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException(`Không tìm thấy hợp đồng với ID: ${contractId}`);
    }

    // Map dữ liệu hợp đồng sang các placeholder tiếng Việt
    return {
      HoTen: contract.employeeName || '',
      CCCD: contract.identityNumber || '',
      DiaChi: contract.address || '',
      Luong: contract.baseSalary?.toLocaleString('vi-VN') || '0',
      NgayBatDau: contract.startDate
        ? new Date(contract.startDate).toLocaleDateString('vi-VN')
        : '',
      NgayKetThuc: contract.endDate
        ? new Date(contract.endDate).toLocaleDateString('vi-VN')
        : 'Không thời hạn',
      ChucVu: contract.position || '',
      PhongBan: contract.department || '',
      MaHopDong: contract.contractCode || '',
      LoaiHopDong: contract.contractType || '',
      SoGioLam: contract.workingHours?.toString() || '8',
    };
  }

  // Tạo file Word từ template docx
  async generateWord(contractId: string): Promise<Buffer> {
    const contractData = await this.prepareContractData(contractId);

    // Lấy template từ database hoặc file mặc định
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    let templatePath = path.join(__dirname, '..', '..', 'templates', 'default-contract.docx');

    // Nếu hợp đồng có templateId, lấy template tương ứng
    if (contract?.templateId) {
      const template = await this.prisma.contractTemplate.findUnique({
        where: { id: contract.templateId },
      });
      if (template?.filePath) {
        templatePath = template.filePath;
      }
    }

    // Kiểm tra file template tồn tại
    if (!fs.existsSync(templatePath)) {
      // Tạo buffer Word đơn giản nếu không có template
      return this.generateSimpleWord(contractData);
    }

    // Đọc file template và thay thế placeholder
    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Thay thế các placeholder trong template
    doc.render(contractData);

    // Xuất file
    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    return buf;
  }

  // Tạo file Word đơn giản khi không có template
  private generateSimpleWord(data: Record<string, any>): Buffer {
    // Tạo nội dung XML đơn giản cho file docx
    const content = `
      HỢP ĐỒNG LAO ĐỘNG
      Mã hợp đồng: ${data.MaHopDong}
      Họ và tên: ${data.HoTen}
      CCCD: ${data.CCCD}
      Địa chỉ: ${data.DiaChi}
      Chức vụ: ${data.ChucVu}
      Phòng ban: ${data.PhongBan}
      Lương cơ bản: ${data.Luong} VNĐ
      Ngày bắt đầu: ${data.NgayBatDau}
      Ngày kết thúc: ${data.NgayKetThuc}
      Số giờ làm việc: ${data.SoGioLam} giờ/ngày
    `;

    return Buffer.from(content, 'utf-8');
  }

  // Tạo file PDF từ dữ liệu hợp đồng
  async generatePdf(contractId: string): Promise<Buffer> {
    const contractData = await this.prepareContractData(contractId);

    // Định nghĩa font cho pdfmake (hỗ trợ tiếng Việt)
    const fonts = {
      Roboto: {
        normal: path.join(__dirname, '..', '..', 'fonts', 'Roboto-Regular.ttf'),
        bold: path.join(__dirname, '..', '..', 'fonts', 'Roboto-Bold.ttf'),
        italics: path.join(__dirname, '..', '..', 'fonts', 'Roboto-Italic.ttf'),
        bolditalics: path.join(__dirname, '..', '..', 'fonts', 'Roboto-BoldItalic.ttf'),
      },
    };

    const printer = new PdfPrinter(fonts);

    // Định nghĩa nội dung PDF
    const docDefinition = {
      content: [
        {
          text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
          style: 'header',
          alignment: 'center',
        },
        {
          text: 'Độc lập - Tự do - Hạnh phúc',
          style: 'subheader',
          alignment: 'center',
        },
        { text: '\n' },
        {
          text: 'HỢP ĐỒNG LAO ĐỘNG',
          style: 'title',
          alignment: 'center',
        },
        {
          text: `Số: ${contractData.MaHopDong}`,
          alignment: 'center',
          margin: [0, 5, 0, 20],
        },
        { text: '\n' },
        {
          text: 'THÔNG TIN NGƯỜI LAO ĐỘNG',
          style: 'sectionHeader',
        },
        {
          text: `Họ và tên: ${contractData.HoTen}`,
          margin: [0, 5, 0, 3],
        },
        {
          text: `Số CCCD: ${contractData.CCCD}`,
          margin: [0, 3, 0, 3],
        },
        {
          text: `Địa chỉ: ${contractData.DiaChi}`,
          margin: [0, 3, 0, 3],
        },
        {
          text: `Chức vụ: ${contractData.ChucVu}`,
          margin: [0, 3, 0, 3],
        },
        {
          text: `Phòng ban: ${contractData.PhongBan}`,
          margin: [0, 3, 0, 3],
        },
        { text: '\n' },
        {
          text: 'ĐIỀU KHOẢN HỢP ĐỒNG',
          style: 'sectionHeader',
        },
        {
          text: `Loại hợp đồng: ${contractData.LoaiHopDong}`,
          margin: [0, 5, 0, 3],
        },
        {
          text: `Thời hạn: Từ ${contractData.NgayBatDau} đến ${contractData.NgayKetThuc}`,
          margin: [0, 3, 0, 3],
        },
        {
          text: `Lương cơ bản: ${contractData.Luong} VNĐ/tháng`,
          margin: [0, 3, 0, 3],
        },
        {
          text: `Thời gian làm việc: ${contractData.SoGioLam} giờ/ngày`,
          margin: [0, 3, 0, 3],
        },
      ],
      styles: {
        header: { fontSize: 13, bold: true },
        subheader: { fontSize: 12, italics: true },
        title: { fontSize: 16, bold: true },
        sectionHeader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
      },
      defaultStyle: { fontSize: 11 },
    };

    // Tạo PDF document
    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    // Chuyển đổi stream sang buffer
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', (err: Error) => reject(err));
      pdfDoc.end();
    });
  }
}
