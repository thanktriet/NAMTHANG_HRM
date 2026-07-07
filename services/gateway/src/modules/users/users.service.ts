import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
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

  async getRoles() {
    const result = await this.pool.query(
      'SELECT id, name, code FROM roles WHERE deleted_at IS NULL ORDER BY name',
    );
    return { items: result.rows };
  }

  /**
   * Tạo tài khoản HRM mới (chỉ quản trị viên). Hash mật khẩu bằng bcrypt,
   * gán vai trò + khu vực. Không tự cấp token (khác với auth/register).
   */
  async create(body: {
    username?: string;
    password?: string;
    role_id?: string | null;
    work_area?: string | null;
  }) {
    const username = (body.username || '').trim();
    const password = body.password || '';

    if (!username || username.length < 3) {
      throw new BadRequestException('Tên đăng nhập phải có ít nhất 3 ký tự');
    }
    if (password.length < 6) {
      throw new BadRequestException('Mật khẩu phải có ít nhất 6 ký tự');
    }
    const workArea = body.work_area || null;
    if (workArea && !WORK_AREAS.includes(workArea)) {
      throw new BadRequestException('Khu vực không hợp lệ');
    }

    // Chống trùng username
    const existing = await this.pool.query(
      'SELECT id FROM users WHERE username = $1 AND deleted_at IS NULL',
      [username],
    );
    if (existing.rows.length > 0) {
      throw new ConflictException('Tên đăng nhập đã được sử dụng');
    }

    // Validate role_id (nếu có)
    let roleId: string | null = body.role_id || null;
    if (roleId) {
      const role = await this.pool.query(
        'SELECT id FROM roles WHERE id = $1 AND deleted_at IS NULL',
        [roleId],
      );
      if (role.rows.length === 0) {
        throw new BadRequestException('Vai trò không hợp lệ');
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await this.pool.query(
      `INSERT INTO users (username, password_hash, role_id, work_area, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING id, username, work_area, role_id`,
      [username, passwordHash, roleId, workArea],
    );
    return result.rows[0];
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
