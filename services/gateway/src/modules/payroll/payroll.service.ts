import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);
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
      SELECT e.id, e.full_name, e.code, d.name as department_name, c.base_salary
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN contracts c ON c.employee_id = e.id AND c.status = 'active'
      WHERE e.deleted_at IS NULL AND e.status = 'active'
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (e.full_name ILIKE $${params.length} OR e.code ILIKE $${params.length})`;
    }

    query += ' ORDER BY e.full_name';

    const result = await this.pool.query(query, params);
    return { items: result.rows, total: result.rows.length };
  }

  async getStats() {
    const result = await this.pool.query(`
      SELECT
        COUNT(DISTINCT e.id) as total_employees,
        COALESCE(SUM(c.base_salary), 0) as total_salary_fund
      FROM employees e
      LEFT JOIN contracts c ON c.employee_id = e.id AND c.status = 'active'
      WHERE e.deleted_at IS NULL AND e.status = 'active'
    `);
    return result.rows[0];
  }
}
