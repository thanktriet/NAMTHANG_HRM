import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Pool } from 'pg';

// Tỷ lệ trích bảo hiểm bắt buộc (phần người lao động đóng)
const INSURANCE_RATE = 0.105; // BHXH 8% + BHYT 1.5% + BHTN 1%
const SOCIAL_RATE = 0.08;
const HEALTH_RATE = 0.015;
const UNEMPLOYMENT_RATE = 0.01;

// Giảm trừ gia cảnh bản thân (VNĐ/tháng) - chuẩn hiện hành
const PERSONAL_DEDUCTION = 11_000_000;

// Ngày công chuẩn/tháng để tính đơn giá giờ
const STANDARD_WORKDAYS = 26;

// Hệ số tăng ca (ngày thường)
const OT_MULTIPLIER = 1.5;

// Thuế suất khấu trừ thẳng cho hợp đồng dịch vụ (thu nhập từ 2tr/lần)
const SERVICE_TAX_RATE = 0.1;

export interface PayrollInput {
  contract_type: string;
  base_salary: number;
  allowances_total: number;
  ot_hours: number;
  working_hours: number; // giờ/ngày theo hợp đồng
  bonus?: number;
  commission?: number;
  advance?: number;
  other_deductions?: number;
}

export interface PayrollResult {
  base_salary: number;
  allowances_total: number;
  ot_amount: number;
  bonus: number;
  commission: number;
  gross: number; // tổng thu nhập trước khấu trừ
  social_insurance: number;
  health_insurance: number;
  unemployment_insurance: number;
  insurance_total: number;
  personal_income_tax: number;
  advance_deducted: number;
  other_deductions: number;
  net_salary: number;
}

/**
 * Thuế TNCN lũy tiến từng phần (biểu thuế 7 bậc, VNĐ/tháng).
 * Áp dụng trên thu nhập tính thuế = thu nhập chịu thuế - giảm trừ.
 */
export function progressiveTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  const brackets = [
    { upTo: 5_000_000, rate: 0.05 },
    { upTo: 10_000_000, rate: 0.1 },
    { upTo: 18_000_000, rate: 0.15 },
    { upTo: 32_000_000, rate: 0.2 },
    { upTo: 52_000_000, rate: 0.25 },
    { upTo: 80_000_000, rate: 0.3 },
    { upTo: Infinity, rate: 0.35 },
  ];
  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    if (taxableIncome > prev) {
      const portion = Math.min(taxableIncome, b.upTo) - prev;
      tax += portion * b.rate;
      prev = b.upTo;
    } else {
      break;
    }
  }
  return Math.round(tax);
}

/**
 * Hàm thuần tính lương một nhân viên. Quy tắc bảo hiểm/thuế tùy loại hợp đồng:
 * - probation (thử việc): KHÔNG đóng BH, thuế lũy tiến (giảm trừ bản thân)
 * - fixed_term / indefinite (chính thức): đóng BH 10.5%, thuế lũy tiến
 * - service (dịch vụ): KHÔNG đóng BH, khấu trừ thuế thẳng 10%
 */
export function computePayroll(input: PayrollInput): PayrollResult {
  const base = Number(input.base_salary) || 0;
  const allowances = Number(input.allowances_total) || 0;
  const otHours = Number(input.ot_hours) || 0;
  const workingHours = Number(input.working_hours) || 8;
  const bonus = Number(input.bonus) || 0;
  const commission = Number(input.commission) || 0;
  const advance = Number(input.advance) || 0;
  const otherDeductions = Number(input.other_deductions) || 0;
  const type = input.contract_type;

  // Đơn giá giờ = lương CB / 26 ngày / số giờ/ngày
  const hourlyRate = workingHours > 0 ? base / STANDARD_WORKDAYS / workingHours : 0;
  const otAmount = Math.round(hourlyRate * otHours * OT_MULTIPLIER);

  const gross = base + allowances + otAmount + bonus + commission;

  // Bảo hiểm: chỉ hợp đồng chính thức. Tính trên lương cơ bản.
  const isOfficial = type === 'fixed_term' || type === 'indefinite';
  const social = isOfficial ? Math.round(base * SOCIAL_RATE) : 0;
  const health = isOfficial ? Math.round(base * HEALTH_RATE) : 0;
  const unemployment = isOfficial ? Math.round(base * UNEMPLOYMENT_RATE) : 0;
  const insuranceTotal = social + health + unemployment;

  // Thuế TNCN
  let pit = 0;
  if (type === 'service') {
    // HĐ dịch vụ: khấu trừ thẳng 10% trên tổng thu nhập
    pit = Math.round(gross * SERVICE_TAX_RATE);
  } else {
    // Thử việc + chính thức: lũy tiến trên (gross - BH - giảm trừ bản thân)
    const taxable = gross - insuranceTotal - PERSONAL_DEDUCTION;
    pit = progressiveTax(taxable);
  }

  const net =
    gross - insuranceTotal - pit - advance - otherDeductions;

  return {
    base_salary: base,
    allowances_total: allowances,
    ot_amount: otAmount,
    bonus,
    commission,
    gross,
    social_insurance: social,
    health_insurance: health,
    unemployment_insurance: unemployment,
    insurance_total: insuranceTotal,
    personal_income_tax: pit,
    advance_deducted: advance,
    other_deductions: otherDeductions,
    net_salary: Math.round(net),
  };
}

// Cộng tổng các giá trị số trong JSONB allowances (bỏ qua giá trị không phải số)
function sumAllowances(allowances: any): number {
  if (!allowances || typeof allowances !== 'object') return 0;
  return Object.values(allowances).reduce((acc: number, v) => {
    const n = typeof v === 'string' ? parseFloat(v) : (v as number);
    return acc + (typeof n === 'number' && !isNaN(n) ? n : 0);
  }, 0);
}

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

  // ===== Danh sách nhân viên + lương CB (fallback khi chưa có kỳ) =====
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

  // ===== Thống kê =====
  async getStats(periodId?: string) {
    // Nếu có kỳ đã tính: tổng hợp từ payroll_records
    if (periodId) {
      const r = await this.pool.query(
        `SELECT
           COUNT(*) as total_employees,
           COALESCE(SUM(base_salary + COALESCE((SELECT SUM((value)::numeric) FROM jsonb_each_text(allowances)),0) + ot_amount + bonus + commission), 0) as total_gross,
           COALESCE(SUM(social_insurance + health_insurance + unemployment_insurance + personal_income_tax + other_deductions + advance_deducted), 0) as total_deductions,
           COALESCE(SUM(net_salary), 0) as total_net
         FROM payroll_records
         WHERE payroll_period_id = $1 AND deleted_at IS NULL`,
        [periodId],
      );
      return r.rows[0];
    }
    // Chưa có kỳ: giữ logic cũ (tổng lương CB của HĐ active)
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

  // ===== Kỳ lương =====
  async listPeriods() {
    const r = await this.pool.query(
      `SELECT id, month, year, status, calculated_at, created_at
       FROM payroll_periods
       WHERE deleted_at IS NULL
       ORDER BY year DESC, month DESC`,
    );
    return { items: r.rows, total: r.rowCount };
  }

  async createPeriod(month: number, year: number) {
    const m = parseInt(String(month), 10);
    const y = parseInt(String(year), 10);
    if (!m || m < 1 || m > 12) {
      throw new BadRequestException('Tháng không hợp lệ');
    }
    if (!y || y < 2020) {
      throw new BadRequestException('Năm không hợp lệ');
    }
    const existing = await this.pool.query(
      'SELECT id FROM payroll_periods WHERE month = $1 AND year = $2 AND deleted_at IS NULL',
      [m, y],
    );
    if (existing.rows.length > 0) {
      throw new BadRequestException(`Kỳ lương ${m}/${y} đã tồn tại`);
    }
    const r = await this.pool.query(
      `INSERT INTO payroll_periods (month, year, status)
       VALUES ($1, $2, 'draft')
       RETURNING id, month, year, status, created_at`,
      [m, y],
    );
    return r.rows[0];
  }

  private async getPeriod(periodId: string) {
    const r = await this.pool.query(
      'SELECT * FROM payroll_periods WHERE id = $1 AND deleted_at IS NULL',
      [periodId],
    );
    if (r.rows.length === 0) {
      throw new NotFoundException('Kỳ lương không tồn tại');
    }
    return r.rows[0];
  }

  // ===== Tính lương cho toàn bộ NV active của kỳ =====
  async calculate(periodId: string) {
    const period = await this.getPeriod(periodId);
    if (period.status === 'paid') {
      throw new BadRequestException('Kỳ lương đã thanh toán, không thể tính lại');
    }

    // Lấy NV active + HĐ active
    const emps = await this.pool.query(`
      SELECT e.id, e.full_name, e.code,
             c.contract_type, c.base_salary, c.allowances, c.working_hours
      FROM employees e
      JOIN contracts c ON c.employee_id = e.id AND c.status = 'active'
      WHERE e.deleted_at IS NULL AND e.status = 'active'
    `);

    let count = 0;
    for (const emp of emps.rows) {
      // OT từ chấm công trong tháng/năm của kỳ
      const ot = await this.pool.query(
        `SELECT COALESCE(SUM(ot_hours), 0) as ot_hours
         FROM attendance_records
         WHERE employee_id = $1 AND deleted_at IS NULL
           AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3`,
        [emp.id, period.month, period.year],
      );
      const otHours = Number(ot.rows[0]?.ot_hours) || 0;

      // Hoa hồng theo kỳ (tài xế)
      const comm = await this.pool.query(
        `SELECT COALESCE(SUM(total_commission + bonus), 0) as commission
         FROM commissions
         WHERE employee_id = $1 AND period_id = $2 AND deleted_at IS NULL`,
        [emp.id, periodId],
      );
      const commission = Number(comm.rows[0]?.commission) || 0;

      // Tạm ứng đã duyệt, chưa khấu trừ ở kỳ nào
      const adv = await this.pool.query(
        `SELECT COALESCE(SUM(amount), 0) as advance, ARRAY_AGG(id) as ids
         FROM salary_advances
         WHERE employee_id = $1 AND status = 'approved'
           AND deducted_in_period_id IS NULL AND deleted_at IS NULL`,
        [emp.id],
      );
      const advance = Number(adv.rows[0]?.advance) || 0;
      const advanceIds: string[] = (adv.rows[0]?.ids || []).filter(Boolean);

      const allowancesTotal = sumAllowances(emp.allowances);

      const result = computePayroll({
        contract_type: emp.contract_type,
        base_salary: Number(emp.base_salary) || 0,
        allowances_total: allowancesTotal,
        ot_hours: otHours,
        working_hours: Number(emp.working_hours) || 8,
        commission,
        advance,
      });

      // UPSERT payroll_record
      await this.pool.query(
        `INSERT INTO payroll_records
           (payroll_period_id, employee_id, base_salary, allowances, ot_amount, bonus,
            social_insurance, health_insurance, unemployment_insurance,
            personal_income_tax, other_deductions, advance_deducted, commission, net_salary)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (payroll_period_id, employee_id) DO UPDATE SET
           base_salary = EXCLUDED.base_salary,
           allowances = EXCLUDED.allowances,
           ot_amount = EXCLUDED.ot_amount,
           bonus = EXCLUDED.bonus,
           social_insurance = EXCLUDED.social_insurance,
           health_insurance = EXCLUDED.health_insurance,
           unemployment_insurance = EXCLUDED.unemployment_insurance,
           personal_income_tax = EXCLUDED.personal_income_tax,
           other_deductions = EXCLUDED.other_deductions,
           advance_deducted = EXCLUDED.advance_deducted,
           commission = EXCLUDED.commission,
           net_salary = EXCLUDED.net_salary,
           updated_at = NOW()`,
        [
          periodId,
          emp.id,
          result.base_salary,
          emp.allowances || {},
          result.ot_amount,
          result.bonus,
          result.social_insurance,
          result.health_insurance,
          result.unemployment_insurance,
          result.personal_income_tax,
          result.other_deductions,
          result.advance_deducted,
          result.commission,
          result.net_salary,
        ],
      );

      // Đánh dấu tạm ứng đã khấu trừ vào kỳ này
      if (advanceIds.length > 0) {
        await this.pool.query(
          `UPDATE salary_advances
           SET status = 'deducted', deducted_in_period_id = $1, updated_at = NOW()
           WHERE id = ANY($2::uuid[])`,
          [periodId, advanceIds],
        );
      }
      count++;
    }

    await this.pool.query(
      `UPDATE payroll_periods SET status = 'calculated', calculated_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [periodId],
    );

    return { message: `Đã tính lương cho ${count} nhân viên`, period_id: periodId, count };
  }

  // ===== Chi tiết bảng lương 1 kỳ =====
  async getRecords(periodId: string, search?: string) {
    await this.getPeriod(periodId);
    let query = `
      SELECT pr.*, e.full_name, e.code, d.name as department_name
      FROM payroll_records pr
      JOIN employees e ON pr.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE pr.payroll_period_id = $1 AND pr.deleted_at IS NULL
    `;
    const params: any[] = [periodId];
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (e.full_name ILIKE $${params.length} OR e.code ILIKE $${params.length})`;
    }
    query += ' ORDER BY e.full_name';
    const r = await this.pool.query(query, params);
    return { items: r.rows, total: r.rowCount };
  }

  async confirmPeriod(periodId: string) {
    const period = await this.getPeriod(periodId);
    if (period.status !== 'calculated') {
      throw new BadRequestException('Chỉ xác nhận được kỳ đã tính lương');
    }
    const r = await this.pool.query(
      `UPDATE payroll_periods SET status = 'confirmed', updated_at = NOW()
       WHERE id = $1 RETURNING id, month, year, status`,
      [periodId],
    );
    return r.rows[0];
  }

  async markPaid(periodId: string) {
    const period = await this.getPeriod(periodId);
    if (period.status !== 'confirmed') {
      throw new BadRequestException('Chỉ đánh dấu đã trả cho kỳ đã xác nhận');
    }
    const r = await this.pool.query(
      `UPDATE payroll_periods SET status = 'paid', updated_at = NOW()
       WHERE id = $1 RETURNING id, month, year, status`,
      [periodId],
    );
    return r.rows[0];
  }
}
