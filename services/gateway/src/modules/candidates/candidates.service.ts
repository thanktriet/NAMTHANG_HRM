import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { promises as fs } from 'fs';
import * as path from 'path';

type UploadedFile = {
  originalname: string;
  buffer: Buffer;
  size: number;
  mimetype: string;
};

// Map document_type -> nhãn tiếng Việt (dùng cho HRM nếu cần)
const UPLOAD_ROOT =
  process.env.UPLOAD_DIR || '/www/wwwroot/hrm.namthang/uploads';

const VALID_DOC_TYPES = [
  'cccd_front',
  'cccd_back',
  'gplx',
  'cv',
  'health_cert',
  'portrait',
  'full_body',
  'video',
];

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

  // Xác định giới hạn khu vực: admin/không work_area -> null (thấy tất cả)
  private areaLimit(user?: any): string | null {
    if (!user) return null;
    if (user.isAdmin) return null;
    return user.work_area || null;
  }

  async findAll(status?: string, search?: string, user?: any) {
    let query = 'SELECT * FROM candidates WHERE deleted_at IS NULL';
    const params: any[] = [];

    const area = this.areaLimit(user);
    if (area) {
      params.push(area);
      query += ` AND work_area = $${params.length}`;
    }
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

  async getStats(user?: any) {
    const area = this.areaLimit(user);
    const params: any[] = [];
    let areaClause = '';
    if (area) {
      params.push(area);
      areaClause = ` AND work_area = $${params.length}`;
    }
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
      FROM candidates WHERE deleted_at IS NULL${areaClause}
    `, params);
    return result.rows[0];
  }

  async findOne(id: string, user?: any) {
    const result = await this.pool.query(
      'SELECT * FROM candidates WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException('Ứng viên không tồn tại');
    }
    const area = this.areaLimit(user);
    if (area && result.rows[0].work_area !== area) {
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
      `INSERT INTO candidates (code, full_name, date_of_birth, gender, id_card_number, id_card_date, id_card_place, permanent_address, current_address, email, phone, position_applied, experience_years, last_company, work_period, expected_salary, license_class, work_area, status, applied_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'new', NOW())
       RETURNING *`,
      [
        code,
        body.full_name,
        body.date_of_birth,
        body.gender,
        body.id_card_number,
        body.id_card_date || null,
        body.id_card_place || null,
        body.permanent_address,
        body.current_address,
        body.email,
        body.phone,
        body.position_applied,
        body.experience_years || 0,
        body.last_company,
        body.work_period,
        body.expected_salary || null,
        body.license_class,
        body.work_area || null,
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

  async updateStatus(id: string, status: string, notes?: string, user?: any) {
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

    // Kiểm tra quyền theo khu vực
    const area = this.areaLimit(user);
    if (area) {
      const chk = await this.pool.query(
        'SELECT work_area FROM candidates WHERE id = $1 AND deleted_at IS NULL',
        [id],
      );
      if (chk.rows.length === 0 || chk.rows[0].work_area !== area) {
        throw new NotFoundException('Ứng viên không tồn tại');
      }
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

  /**
   * Upload giấy tờ/ảnh cho ứng viên. Lưu file vào ổ đĩa và ghi DB.
   * types[i] khớp với files[i] để xác định document_type.
   */
  async uploadDocuments(
    id: string,
    files: UploadedFile[],
    types: string[],
  ) {
    // Xác nhận ứng viên tồn tại
    const candidate = await this.pool.query(
      'SELECT id FROM candidates WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    if (candidate.rows.length === 0) {
      throw new NotFoundException('Ứng viên không tồn tại');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('Không có file nào được tải lên');
    }

    const destDir = path.join(UPLOAD_ROOT, 'candidates', id);
    await fs.mkdir(destDir, { recursive: true });

    const saved: any[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const rawType = Array.isArray(types) ? types[i] : types;
      const docType = VALID_DOC_TYPES.includes(rawType) ? rawType : 'cv';

      // Tên file an toàn: <docType>-<timestamp><ext>
      const ext = path.extname(file.originalname) || '';
      const safeName = `${docType}-${Date.now()}-${i}${ext}`;
      const absPath = path.join(destDir, safeName);
      await fs.writeFile(absPath, file.buffer);

      // Đường dẫn tương đối để serve qua nginx: /uploads/candidates/<id>/<file>
      const relPath = `/uploads/candidates/${id}/${safeName}`;

      const inserted = await this.pool.query(
        `INSERT INTO candidate_documents (candidate_id, document_type, file_path, file_name, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          id,
          docType,
          relPath,
          file.originalname,
          file.size,
          file.mimetype,
        ],
      );
      saved.push(inserted.rows[0]);
    }

    return { message: `Đã tải lên ${saved.length} tài liệu`, documents: saved };
  }

  /**
   * Lấy danh sách giấy tờ của ứng viên (cho HRM hiển thị)
   */
  async getDocuments(id: string, user?: any) {
    const area = this.areaLimit(user);
    if (area) {
      const chk = await this.pool.query(
        'SELECT work_area FROM candidates WHERE id = $1 AND deleted_at IS NULL',
        [id],
      );
      if (chk.rows.length === 0 || chk.rows[0].work_area !== area) {
        throw new NotFoundException('Ứng viên không tồn tại');
      }
    }
    const result = await this.pool.query(
      'SELECT id, document_type, file_path, file_name, file_size, mime_type, created_at FROM candidate_documents WHERE candidate_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC',
      [id],
    );
    return { items: result.rows, total: result.rows.length };
  }

  /**
   * Chuyển ứng viên (đã Nhận việc) thành hồ sơ nhân viên
   */
  async convertToEmployee(id: string, opts: { department_id?: string; position_id?: string; status?: string } = {}, user?: any) {
    const VALID_ST = ['probation', 'active', 'resigned', 'terminated'];
    const empStatus = VALID_ST.includes(opts.status || '') ? opts.status : 'probation';
    const deptId = opts.department_id || 'b0000002-0000-0000-0000-000000000001';
    const posId = opts.position_id || 'c0000006-0000-0000-0000-000000000001';
    const cand = await this.pool.query(
      'SELECT * FROM candidates WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    if (cand.rows.length === 0) {
      throw new NotFoundException('Ứng viên không tồn tại');
    }
    const c = cand.rows[0];
    const userArea = this.areaLimit(user);
    if (userArea && c.work_area !== userArea) {
      throw new NotFoundException('Ứng viên không tồn tại');
    }
    if (c.status !== 'hired') {
      throw new BadRequestException(
        'Chỉ có thể tạo hồ sơ nhân viên cho ứng viên đã Nhận việc',
      );
    }

    // Chống trùng: đã convert rồi thì trả về employee cũ
    const existed = await this.pool.query(
      'SELECT * FROM employees WHERE candidate_id = $1 AND deleted_at IS NULL LIMIT 1',
      [id],
    );
    if (existed.rows.length > 0) {
      return { ...existed.rows[0], already: true };
    }

    // Map work_area -> organization_id + prefix mã
    const KG = 'a0000001-0000-0000-0000-000000000001';
    const CT = 'a0000002-0000-0000-0000-000000000001';
    const area = (c.work_area || '').trim();
    let orgId = CT;
    let prefix = 'CT';
    if (area === 'Rạch Giá' || area === 'Phú Quốc') {
      orgId = KG;
      prefix = 'KG';
    }

    // Sinh mã NT-DRV-<XX>-<SEQ4> theo số lớn nhất đang dùng (tránh trùng)
    const maxq = await this.pool.query(
      "SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM '[0-9]+$') AS INTEGER)), 0) AS maxseq FROM employees WHERE code LIKE $1",
      [`NT-DRV-${prefix}-%`],
    );
    const seq = parseInt(maxq.rows[0].maxseq, 10) + 1;
    const code = `NT-DRV-${prefix}-${String(seq).padStart(4, '0')}`;

    const result = await this.pool.query(
      `INSERT INTO employees (code, candidate_id, full_name, date_of_birth, gender, id_card_number, id_card_date, id_card_place, permanent_address, current_address, email, phone, organization_id, department_id, position_id, hire_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_DATE, $16)
       RETURNING *`,
      [
        code,
        id,
        c.full_name,
        c.date_of_birth,
        c.gender,
        c.id_card_number,
        c.id_card_date,
        c.id_card_place,
        c.permanent_address,
        c.current_address,
        c.email,
        c.phone,
        orgId,
        deptId,
        posId,
        empStatus,
      ],
    );

    return { ...result.rows[0], already: false };
  }


  /**
   * Danh sách phòng ban (cho dropdown khi tạo hồ sơ nhân viên)
   */
  async listDepartments() {
    const result = await this.pool.query(
      'SELECT id, name FROM departments ORDER BY name',
    );
    return { items: result.rows };
  }

  /**
   * Danh sách chức vụ (cho dropdown khi tạo hồ sơ nhân viên)
   */
  async listPositions() {
    const result = await this.pool.query(
      'SELECT id, name FROM positions ORDER BY name',
    );
    return { items: result.rows };
  }

}
