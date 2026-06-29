import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class KpiService {
  private readonly logger = new Logger(KpiService.name);
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://postgres:1@localhost:5432/namthang_hrm',
    });
  }

  async getEvaluations(period?: string, search?: string) {
    try {
      let query = `
        SELECT ke.*, e.full_name, e.code as employee_code, d.name as department_name
        FROM kpi_evaluations ke
        LEFT JOIN employees e ON ke.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE ke.deleted_at IS NULL
      `;
      const params: any[] = [];

      if (period) {
        params.push(period);
        query += ` AND ke.period = $${params.length}`;
      }
      if (search) {
        params.push(`%${search}%`);
        query += ` AND (e.full_name ILIKE $${params.length} OR e.code ILIKE $${params.length})`;
      }

      query += ' ORDER BY ke.created_at DESC';

      const result = await this.pool.query(query, params);
      return { items: result.rows, total: result.rows.length };
    } catch (error) {
      this.logger.warn('KPI evaluations table may not exist yet, returning empty');
      return { items: [], total: 0 };
    }
  }

  async getStats() {
    try {
      const result = await this.pool.query(`
        SELECT
          COUNT(*) as total_evaluations,
          COALESCE(AVG(score), 0) as average_score,
          COUNT(*) FILTER (WHERE score >= 80) as excellent_count,
          COUNT(*) FILTER (WHERE score >= 60 AND score < 80) as good_count,
          COUNT(*) FILTER (WHERE score < 60) as needs_improvement_count
        FROM kpi_evaluations WHERE deleted_at IS NULL
      `);
      return result.rows[0];
    } catch (error) {
      this.logger.warn('KPI tables may not exist yet, returning defaults');
      return {
        total_evaluations: 0,
        average_score: 0,
        excellent_count: 0,
        good_count: 0,
        needs_improvement_count: 0,
      };
    }
  }
}
