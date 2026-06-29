import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://postgres:1@localhost:5432/namthang_hrm',
    });
  }

  async findAll(status?: string, category?: string, search?: string) {
    let query = `
      SELECT a.*, aa.employee_id, e.full_name as assigned_to
      FROM assets a
      LEFT JOIN asset_assignments aa ON aa.asset_id = a.id AND aa.status = 'assigned'
      LEFT JOIN employees e ON aa.employee_id = e.id
      WHERE a.deleted_at IS NULL
    `;
    const params: any[] = [];

    if (status) {
      params.push(status);
      query += ` AND a.status = $${params.length}`;
    }
    if (category) {
      params.push(category);
      query += ` AND a.category = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (a.name ILIKE $${params.length} OR a.code ILIKE $${params.length})`;
    }

    query += ' ORDER BY a.created_at DESC';

    const result = await this.pool.query(query, params);
    return { items: result.rows, total: result.rows.length };
  }

  async getStats() {
    const result = await this.pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'available') as available,
        COUNT(*) FILTER (WHERE status = 'in_use') as in_use,
        COUNT(*) FILTER (WHERE status = 'maintenance') as maintenance,
        COUNT(*) FILTER (WHERE status = 'disposed') as disposed
      FROM assets WHERE deleted_at IS NULL
    `);
    return result.rows[0];
  }
}
