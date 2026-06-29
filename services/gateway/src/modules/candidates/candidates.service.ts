import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class CandidatesService {
  private readonly logger = new Logger(CandidatesService.name);
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://postgres:1@localhost:5432/namthang_hrm',
    });
  }

  async findAll(status?: string, search?: string) {
    let query = 'SELECT * FROM candidates WHERE deleted_at IS NULL';
    const params: any[] = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (full_name ILIKE $${params.length} OR code ILIKE $${params.length})`;
    }

    query += ' ORDER BY applied_date DESC';

    const result = await this.pool.query(query, params);
    return { items: result.rows, total: result.rows.length };
  }

  async getStats() {
    const result = await this.pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'new') as new,
        COUNT(*) FILTER (WHERE status = 'screening') as screening,
        COUNT(*) FILTER (WHERE status = 'interview') as interview,
        COUNT(*) FILTER (WHERE status = 'evaluation') as evaluation,
        COUNT(*) FILTER (WHERE status = 'offer') as offer,
        COUNT(*) FILTER (WHERE status = 'hired') as hired,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected
      FROM candidates WHERE deleted_at IS NULL
    `);
    return result.rows[0];
  }

  async findOne(id: string) {
    const result = await this.pool.query(
      'SELECT * FROM candidates WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException('Ứng viên không tồn tại');
    }
    return result.rows[0];
  }

  async create(body: any) {
    const year = new Date().getFullYear();
    const countResult = await this.pool.query(
      'SELECT COUNT(*) as cnt FROM candidates WHERE code LIKE $1',
      [`UV-${year}-%`],
    );
    const nextNum = parseInt(countResult.rows[0].cnt) + 1;
    const code = `UV-${year}-${String(nextNum).padStart(6, '0')}`;

    const result = await this.pool.query(
      `INSERT INTO candidates (code, full_name, date_of_birth, gender, id_card_number, id_card_date, id_card_place, permanent_address, current_address, email, phone, position_applied, experience_years, last_company, work_period, expected_salary, license_class, status, applied_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'new', NOW())
       RETURNING *`,
      [
        code,
        body.full_name,
        body.date_of_birth,
        body.gender,
        body.id_card_number,
        body.id_card_date,
        body.id_card_place,
        body.permanent_address,
        body.current_address,
        body.email,
        body.phone,
        body.position_applied,
        body.experience_years || 0,
        body.last_company,
        body.work_period,
        body.expected_salary,
        body.license_class,
      ],
    );

    return result.rows[0];
  }

  async lookup(code: string, phone: string) {
    if (!code || !phone) {
      throw new BadRequestException(
        'Vui lòng nhập mã ứng tuyển và số điện thoại',
      );
    }

    const result = await this.pool.query(
      'SELECT id, code, full_name, position_applied, status, applied_date, phone, email FROM candidates WHERE code = $1 AND phone = $2 AND deleted_at IS NULL',
      [code.trim(), phone.trim()],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(
        'Không tìm thấy hồ sơ. Vui lòng kiểm tra lại mã ứng tuyển và số điện thoại.',
      );
    }

    return result.rows[0];
  }

  async updateStatus(id: string, status: string, notes?: string) {
    const validStatuses = [
      'new',
      'screening',
      'interview',
      'evaluation',
      'offer',
      'hired',
      'rejected',
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Trạng thái không hợp lệ');
    }

    const result = await this.pool.query(
      'UPDATE candidates SET status = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL RETURNING *',
      [status, id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Ứng viên không tồn tại');
    }

    return result.rows[0];
  }
}
