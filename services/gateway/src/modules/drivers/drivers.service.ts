import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://postgres:1@localhost:5432/namthang_hrm',
    });
  }

  async findAll(search?: string) {
    let query = `
      SELECT e.*, dl.license_class, dl.license_number, dl.expiry_date, dl.status as license_status,
        v.plate_number, v.type as vehicle_type
      FROM employees e
      LEFT JOIN driver_licenses dl ON dl.employee_id = e.id AND dl.deleted_at IS NULL
      LEFT JOIN vehicle_assignments va ON va.driver_id = e.id AND va.status = 'assigned'
      LEFT JOIN vehicles v ON v.id = va.vehicle_id
      WHERE e.deleted_at IS NULL AND e.department_id = (SELECT id FROM departments WHERE name ILIKE '%vận tải%' LIMIT 1)
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

  async getLicenses() {
    const result = await this.pool.query(`
      SELECT dl.*, e.full_name, e.code as employee_code
      FROM driver_licenses dl
      LEFT JOIN employees e ON dl.employee_id = e.id
      WHERE dl.deleted_at IS NULL
      ORDER BY dl.expiry_date ASC
    `);
    return { items: result.rows, total: result.rows.length };
  }

  async getExpiringLicenses() {
    const result = await this.pool.query(`
      SELECT dl.*, e.full_name, e.code as employee_code
      FROM driver_licenses dl
      LEFT JOIN employees e ON dl.employee_id = e.id
      WHERE dl.deleted_at IS NULL
        AND dl.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
        AND dl.expiry_date >= CURRENT_DATE
      ORDER BY dl.expiry_date ASC
    `);
    return { items: result.rows, total: result.rows.length };
  }

  async getDispatchOrders() {
    const result = await this.pool.query(`
      SELECT d.*, e.full_name as driver_name, v.plate_number
      FROM dispatch_orders d
      LEFT JOIN employees e ON d.driver_id = e.id
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      WHERE d.deleted_at IS NULL
      ORDER BY d.created_at DESC
    `);
    return { items: result.rows, total: result.rows.length };
  }

  async getStats() {
    const result = await this.pool.query(`
      SELECT
        (SELECT COUNT(*) FROM employees e WHERE e.deleted_at IS NULL AND e.department_id = (SELECT id FROM departments WHERE name ILIKE '%vận tải%' LIMIT 1)) as total_drivers,
        (SELECT COUNT(*) FROM employees e WHERE e.deleted_at IS NULL AND e.status = 'active' AND e.department_id = (SELECT id FROM departments WHERE name ILIKE '%vận tải%' LIMIT 1)) as active_drivers,
        (SELECT COUNT(*) FROM driver_licenses dl WHERE dl.deleted_at IS NULL AND dl.expiry_date <= CURRENT_DATE + INTERVAL '30 days' AND dl.expiry_date >= CURRENT_DATE) as licenses_expiring
    `);
    return result.rows[0];
  }
}
