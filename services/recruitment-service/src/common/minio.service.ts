import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

/**
 * MinIO Service - Quản lý lưu trữ file (S3 compatible)
 */
@Injectable()
export class MinioService {
  private client: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.client = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.configService.get('MINIO_PORT', '9000')),
      useSSL: this.configService.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get('MINIO_SECRET_KEY', 'minioadmin'),
    });
    this.bucketName = this.configService.get('MINIO_BUCKET', 'recruitment');
  }

  /**
   * Upload file lên MinIO
   */
  async upload(file: Express.Multer.File, folder: string): Promise<string> {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;

    // Tạo bucket nếu chưa tồn tại
    const bucketExists = await this.client.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.client.makeBucket(this.bucketName);
    }

    await this.client.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    return fileName;
  }

  /**
   * Lấy signed URL để truy cập file
   */
  async getSignedUrl(fileName: string, expiry: number = 3600): Promise<string> {
    return this.client.presignedGetObject(this.bucketName, fileName, expiry);
  }

  /**
   * Xóa file khỏi MinIO
   */
  async delete(fileName: string): Promise<void> {
    await this.client.removeObject(this.bucketName, fileName);
  }
}
