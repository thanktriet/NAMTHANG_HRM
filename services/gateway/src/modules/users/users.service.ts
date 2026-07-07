import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';

const WORK_AREAS = [
  'Rạch Giá',
  'Phú Quốc',
  'An Giang',
  'Cần Thơ',
  'Sóc Trăng',
  'Cà Mau',
];

@Injectable()
export class UsersService {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://postgres:1@localhost:5432/namthang_hrm',
    });
  }

  async findAll() {
    const result = await this.pool.query(
      `SELECT u.id, u.username, u.status, u.work_area, r.name AS role_name
       FROM users u LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.deleted_at IS NULL
       ORDER BY u.username`,
    );
    return { items: result.rows, total: result.rows.length };
  }

  getWorkAreas() {
    return { items: WORK_AREAS };
  }

  async updateWorkArea(id: string, workArea: string | null) {
    // Cho phép null (bỏ giới hạn) hoặc 1 trong các khu vực hợp lệ
    if (workArea && !WORK_AREAS.includes(workArea)) {
      throw new BadRequestException('Khu vực không hợp lệ');
    }
    const result = await this.pool.query(
      'UPDATE users SET work_area = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL RETURNING id, username, work_area',
      [workArea || null, id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    return result.rows[0];
  }
}
