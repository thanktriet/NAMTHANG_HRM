import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://postgres:1@localhost:5432/namthang_hrm',
    });
  }

  async getStats() {
    const [employeesResult, candidatesResult, driversResult, contractsResult] =
      await Promise.all([
        this.pool.query(
          `SELECT COUNT(*) as total FROM employees WHERE deleted_at IS NULL AND status = 'active'`,
        ),
        this.pool.query(
          `SELECT COUNT(*) as total FROM candidates WHERE deleted_at IS NULL`,
        ),
        this.pool.query(
          `SELECT COUNT(*) as total FROM employees WHERE deleted_at IS NULL AND status = 'active' AND position_id IN (SELECT id FROM positions WHERE name ILIKE '%driver%' OR name ILIKE '%lái xe%')`,
        ),
        this.pool.query(
          `SELECT COUNT(*) as total FROM contracts WHERE deleted_at IS NULL AND end_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'`,
        ),
      ]);

    return {
      totalEmployees: parseInt(employeesResult.rows[0].total, 10),
      totalCandidates: parseInt(candidatesResult.rows[0].total, 10),
      activeDrivers: parseInt(driversResult.rows[0].total, 10),
      contractsExpiring: parseInt(contractsResult.rows[0].total, 10),
    };
  }
}
