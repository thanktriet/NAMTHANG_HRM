import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://postgres:1@localhost:5432/namthang_hrm',
    });
  }

  async findAll(type?: string, status?: string, search?: string) {
    let query = `
      SELECT c.*, e.full_name as employee_name, e.code as employee_code
      FROM contracts c
      LEFT JOIN employees e ON c.employee_id = e.id
      WHERE c.deleted_at IS NULL
    `;
    const params: any[] = [];

    if (type) {
      params.push(type);
      query += ` AND c.type = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND c.status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (e.full_name ILIKE $${params.length} OR e.code ILIKE $${params.length} OR c.contract_number ILIKE $${params.length})`;
    }

    query += ' ORDER BY c.created_at DESC';

    const result = await this.pool.query(query, params);
    return { items: result.rows, total: result.rows.length };
  }

  async getStats() {
    const result = await this.pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'expired') as expired,
        COUNT(*) FILTER (WHERE status = 'terminated') as terminated,
        COUNT(*) FILTER (WHERE end_date <= CURRENT_DATE + INTERVAL '30 days' AND end_date >= CURRENT_DATE AND status = 'active') as expiring
      FROM contracts WHERE deleted_at IS NULL
    `);
    return result.rows[0];
  }

  async findOne(id: string) {
    const result = await this.pool.query(
      `SELECT c.*, e.full_name as employee_name, e.code as employee_code
       FROM contracts c
       LEFT JOIN employees e ON c.employee_id = e.id
       WHERE c.id = $1 AND c.deleted_at IS NULL`,
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException('Hợp đồng không tồn tại');
    }
    return result.rows[0];
  }

  async create(body: any) {
    const year = new Date().getFullYear();
    const countResult = await this.pool.query("SELECT COUNT(*) as cnt FROM contracts WHERE code LIKE $1", [`HD-${year}-%`]);
    const nextNum = parseInt(countResult.rows[0].cnt) + 1;
    const code = `HD-${year}-${String(nextNum).padStart(3, '0')}`;

    const result = await this.pool.query(
      `INSERT INTO contracts (code, employee_id, contract_type, start_date, end_date, base_salary, allowances, status, file_name, file_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, $9)
       RETURNING *`,
      [code, body.employee_id, body.contract_type, body.start_date, body.end_date, body.base_salary, JSON.stringify(body.allowances || {}), body.file_name || null, body.file_path || null]
    );
    return result.rows[0];
  }

  async terminate(id: string, reason?: string) {
    const result = await this.pool.query(
      `UPDATE contracts SET status = 'terminated', updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
      [id],
    );
    if (result.rows.length === 0) throw new NotFoundException('Hợp đồng không tồn tại');
    return result.rows[0];
  }

  async renew(id: string, body: { new_end_date: string; new_salary?: number }) {
    // Get current contract
    const current = await this.pool.query('SELECT * FROM contracts WHERE id = $1', [id]);
    if (current.rows.length === 0) throw new NotFoundException('Hợp đồng không tồn tại');

    const c = current.rows[0];

    // Terminate old contract
    await this.pool.query("UPDATE contracts SET status = 'terminated', updated_at = NOW() WHERE id = $1", [id]);

    // Create new contract
    const year = new Date().getFullYear();
    const countResult = await this.pool.query("SELECT COUNT(*) as cnt FROM contracts WHERE code LIKE $1", [`HD-${year}-%`]);
    const nextNum = parseInt(countResult.rows[0].cnt) + 1;
    const code = `HD-${year}-${String(nextNum).padStart(3, '0')}`;

    const newStart = c.end_date || new Date().toISOString().split('T')[0];
    const result = await this.pool.query(
      `INSERT INTO contracts (code, employee_id, contract_type, start_date, end_date, base_salary, allowances, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') RETURNING *`,
      [code, c.employee_id, c.contract_type, newStart, body.new_end_date, body.new_salary || c.base_salary, c.allowances],
    );
    return result.rows[0];
  }
}
