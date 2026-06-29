import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://postgres:1@localhost:5432/namthang_hrm',
    });
  }

  async findAll(month?: string, year?: string, search?: string) {
    let query = `
      SELECT a.*, e.full_name, e.code as employee_code
      FROM attendance_records a
      LEFT JOIN employees e ON a.employee_id = e.id
      WHERE a.deleted_at IS NULL
    `;
    const params: any[] = [];

    if (month) {
      params.push(parseInt(month));
      query += ` AND EXTRACT(MONTH FROM a.date) = $${params.length}`;
    }
    if (year) {
      params.push(parseInt(year));
      query += ` AND EXTRACT(YEAR FROM a.date) = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (e.full_name ILIKE $${params.length} OR e.code ILIKE $${params.length})`;
    }

    query += ' ORDER BY a.date DESC, a.check_in DESC';

    const result = await this.pool.query(query, params);
    return { items: result.rows, total: result.rows.length };
  }

  async getToday() {
    const result = await this.pool.query(`
      SELECT a.*, e.full_name, e.code as employee_code
      FROM attendance_records a
      LEFT JOIN employees e ON a.employee_id = e.id
      WHERE a.deleted_at IS NULL AND a.date = CURRENT_DATE
      ORDER BY a.check_in DESC
    `);
    return { items: result.rows, total: result.rows.length };
  }

  async getStats() {
    const result = await this.pool.query(`
      SELECT
        COUNT(*) as total_records,
        COUNT(*) FILTER (WHERE status = 'late') as late_count,
        COUNT(*) FILTER (WHERE status = 'early_leave') as early_leave_count,
        COALESCE(SUM(overtime_hours), 0) as total_ot_hours
      FROM attendance_records
      WHERE deleted_at IS NULL
        AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);
    return result.rows[0];
  }
}
