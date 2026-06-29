import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Readable } from 'stream';

/**
 * Service quản lý kết nối và thao tác với MinIO Object Storage
 * Dùng để lưu trữ file tài liệu (mẫu và tài liệu đã tạo)
 */
@Injectable()
export class MinioService implements OnModuleInit {
  private client!: Minio.Client;
  private bucket!: string;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Khởi tạo kết nối MinIO khi module được load
   */
  async onModuleInit() {
    // Đọc cấu hình từ biến môi trường
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = this.configService.get<number>('MINIO_PORT', 9000);
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin');
    this.bucket = this.configService.get<string>('MINIO_BUCKET', 'documents');

    // Tạo client MinIO
    this.client = new Minio.Client({
      endPoint: endpoint,
      port: port,
      useSSL: false,
      accessKey: accessKey,
      secretKey: secretKey,
    });

    // Đảm bảo bucket tồn tại
    await this.ensureBucket();
  }

  /**
   * Kiểm tra và tạo bucket nếu chưa tồn tại
   */
  private async ensureBucket(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket);
      console.log(`Đã tạo bucket: ${this.bucket}`);
    }
  }

  /**
   * Upload file lên MinIO
   * @param objectName - Tên/đường dẫn file trên MinIO
   * @param buffer - Nội dung file dạng Buffer
   */
  async uploadFile(objectName: string, buffer: Buffer): Promise<void> {
    await this.client.putObject(this.bucket, objectName, buffer);
  }

  /**
   * Lấy file từ MinIO dưới dạng stream (dùng cho download)
   * @param objectName - Tên/đường dẫn file trên MinIO
   */
  async getFileStream(objectName: string): Promise<Readable> {
    return this.client.getObject(this.bucket, objectName);
  }

  /**
   * Lấy file từ MinIO dưới dạng Buffer (dùng cho xử lý nội dung)
   * @param objectName - Tên/đường dẫn file trên MinIO
   */
  async getFileBuffer(objectName: string): Promise<Buffer> {
    const stream = await this.client.getObject(this.bucket, objectName);
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  /**
   * Xóa file trên MinIO
   * @param objectName - Tên/đường dẫn file trên MinIO
   */
  async deleteFile(objectName: string): Promise<void> {
    await this.client.removeObject(this.bucket, objectName);
  }
}
