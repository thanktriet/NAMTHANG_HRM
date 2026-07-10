import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import { promises as fs } from 'fs';
import * as path from 'path';

type UploadedFile = {
  originalname: string;
  buffer: Buffer;
  size: number;
  mimetype: string;
};

const UPLOAD_ROOT =
  process.env.UPLOAD_DIR || '/www/wwwroot/hrm.namthang/uploads';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);
  private readonly pool: Pool;

  // Danh sách tài liệu bắt buộc
  private readonly REQUIRED_DOCS = ['cccd', 'so_yeu_ly_lich', 'giay_kham_suc_khoe', 'bang_lai'];

  constructor() {
    this.pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://postgres:1@localhost:5432/namthang_hrm',
    });
  }

  async findAll(departmentId?: string, status?: string, search?: string) {
    let query = `
      SELECT e.*, d.name as department_name, p.name as position_name, o.name as organization_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN organizations o ON e.organization_id = o.id
      WHERE e.deleted_at IS NULL
    `;
    const params: any[] = [];

    if (departmentId) {
      params.push(departmentId);
      query += ` AND e.department_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND e.status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (e.full_name ILIKE $${params.length} OR e.code ILIKE $${params.length})`;
    }

    query += ' ORDER BY e.created_at DESC';

    const result = await this.pool.query(query, params);
    return { items: result.rows, total: result.rows.length };
  }

  async getStats() {
    const totalResult = await this.pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'resigned') as resigned,
        COUNT(*) FILTER (WHERE status = 'probation') as probation,
        COUNT(*) FILTER (WHERE status = 'terminated') as terminated
      FROM employees WHERE deleted_at IS NULL
    `);

    const byDepartmentResult = await this.pool.query(`
      SELECT d.name as department_name, COUNT(e.id) as count
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.deleted_at IS NULL
      GROUP BY d.name
      ORDER BY count DESC
    `);

    return {
      ...totalResult.rows[0],
      byDepartment: byDepartmentResult.rows,
    };
  }

  async getDocuments(employeeId: string) {
    const result = await this.pool.query(
      'SELECT * FROM employee_documents WHERE employee_id = $1 ORDER BY uploaded_at DESC',
      [employeeId],
    );
    return { items: result.rows, total: result.rows.length };
  }

  async uploadDocument(
    employeeId: string,
    documentType: string,
    file: UploadedFile,
  ) {
    // Check employee exists
    const emp = await this.pool.query(
      'SELECT id FROM employees WHERE id = $1 AND deleted_at IS NULL',
      [employeeId],
    );
    if (emp.rows.length === 0) {
      throw new NotFoundException('Nhân viên không tồn tại');
    }
    if (!file) {
      throw new BadRequestException('Không có file nào được tải lên');
    }

    // Ghi file thật vào ổ đĩa: uploads/employees/<id>/<type>-<timestamp><ext>
    const destDir = path.join(UPLOAD_ROOT, 'employees', employeeId);
    await fs.mkdir(destDir, { recursive: true });
    const ext = path.extname(file.originalname) || '';
    const safeName = `${documentType}-${Date.now()}${ext}`;
    await fs.writeFile(path.join(destDir, safeName), file.buffer);

    // Đường dẫn tương đối serve qua nginx
    const relPath = `/uploads/employees/${employeeId}/${safeName}`;

    const result = await this.pool.query(
      `INSERT INTO employee_documents (employee_id, document_type, file_name, file_path, uploaded_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [employeeId, documentType, file.originalname, relPath],
    );
    return result.rows[0];
  }

  async getMissingDocuments() {
    const result = await this.pool.query(`
      SELECT e.id, e.code, e.full_name, e.department_name,
        ARRAY(
          SELECT unnest(ARRAY['cccd', 'so_yeu_ly_lich', 'giay_kham_suc_khoe', 'bang_lai'])
          EXCEPT
          SELECT DISTINCT document_type FROM employee_documents WHERE employee_id = e.id
        ) as missing_docs
      FROM (
        SELECT emp.id, emp.code, emp.full_name, d.name as department_name
        FROM employees emp
        LEFT JOIN departments d ON emp.department_id = d.id
        WHERE emp.deleted_at IS NULL AND emp.status = 'active'
      ) e
      WHERE EXISTS (
        SELECT 1 FROM unnest(ARRAY['cccd', 'so_yeu_ly_lich', 'giay_kham_suc_khoe', 'bang_lai']) doc_type
        WHERE doc_type NOT IN (SELECT DISTINCT document_type FROM employee_documents WHERE employee_id = e.id)
      )
      ORDER BY e.full_name
    `);
    return { items: result.rows, total: result.rows.length };
  }

  async findOne(id: string) {
    const result = await this.pool.query(`
      SELECT e.*, d.name as department_name, p.name as position_name, o.name as organization_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN organizations o ON e.organization_id = o.id
      WHERE e.id = $1 AND e.deleted_at IS NULL
    `, [id]);
    if (result.rows.length === 0) throw new NotFoundException('Nhân viên không tồn tại');
    return result.rows[0];
  }

  async update(id: string, body: any) {
    const allowedFields = ['full_name', 'date_of_birth', 'gender', 'id_card_number', 'id_card_date', 'id_card_place', 'permanent_address', 'current_address', 'email', 'phone', 'department_id', 'position_id', 'organization_id', 'status', 'bank_account', 'bank_name', 'tax_code', 'social_insurance_number', 'ethnicity', 'religion', 'marital_status', 'education_level'];

    const updates: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        values.push(body[field]);
        updates.push(`${field} = $${values.length}`);
      }
    }

    if (updates.length === 0) throw new BadRequestException('Không có dữ liệu để cập nhật');

    values.push(id);
    const result = await this.pool.query(
      `UPDATE employees SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${values.length} AND deleted_at IS NULL RETURNING *`,
      values
    );

    if (result.rows.length === 0) throw new NotFoundException('Nhân viên không tồn tại');
    return result.rows[0];
  }

  async getRewards(employeeId: string) {
    const result = await this.pool.query(
      `SELECT * FROM rewards_disciplines WHERE employee_id = $1 AND deleted_at IS NULL ORDER BY effective_date DESC`,
      [employeeId]
    );
    return { items: result.rows, total: result.rows.length };
  }

  async addReward(employeeId: string, body: any) {
    const emp = await this.pool.query('SELECT id FROM employees WHERE id = $1 AND deleted_at IS NULL', [employeeId]);
    if (emp.rows.length === 0) throw new NotFoundException('Nhân viên không tồn tại');

    const result = await this.pool.query(
      `INSERT INTO rewards_disciplines (employee_id, type, title, description, decision_number, effective_date, amount, file_name, file_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [employeeId, body.type, body.title, body.description, body.decision_number, body.effective_date, body.amount || 0, body.file_name || null, body.file_path || null]
    );
    return result.rows[0];
  }

  async getContracts(employeeId: string) {
    const result = await this.pool.query(
      `SELECT * FROM contracts WHERE employee_id = $1 AND deleted_at IS NULL ORDER BY start_date DESC`,
      [employeeId]
    );
    return { items: result.rows, total: result.rows.length };
  }
}
