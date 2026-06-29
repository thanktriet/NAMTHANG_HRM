import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { TaxCalculator } from './calculations/tax-calculator';
import { InsuranceCalculator } from './calculations/insurance-calculator';
import { CalculatePayrollDto } from './dto/calculate-payroll.dto';
import { FilterPayrollDto, PayrollPeriodStatus } from './dto/filter-payroll.dto';
import { paginate, getSkip } from '../common/pagination.helper';

/**
 * Cấu trúc dữ liệu tính lương cho 1 nhân viên
 */
interface EmployeePayrollRecord {
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  position: string;

  // Thu nhập
  baseSalary: number; // Lương cơ bản theo hợp đồng
  allowances: {
    transport: number; // Phụ cấp đi lại
    phone: number; // Phụ cấp điện thoại
    meal: number; // Phụ cấp ăn trưa
    other: number; // Phụ cấp khác
    total: number;
  };
  overtimePay: number; // Tiền làm thêm giờ
  bonus: {
    kpiBonus: number; // Thưởng KPI
    otherBonus: number; // Thưởng khác
    total: number;
  };
  commission: number; // Hoa hồng (tài xế)
  grossIncome: number; // Tổng thu nhập

  // Khấu trừ
  deductions: {
    insurance: {
      socialInsurance: number; // BHXH 8%
      healthInsurance: number; // BHYT 1.5%
      unemploymentInsurance: number; // BHTN 1%
      total: number;
    };
    personalIncomeTax: number; // Thuế TNCN
    advances: number; // Tạm ứng đã nhận
    otherDeductions: number; // Khấu trừ khác
    totalDeductions: number;
  };

  // Lương thực nhận
  netSalary: number;

  // Chi phí doanh nghiệp
  employerInsurance: number; // Phần BH doanh nghiệp đóng
  totalCostToCompany: number; // Tổng chi phí cho DN
}

/**
 * Service xử lý logic tính lương
 * Bao gồm: tính lương, quản lý kỳ lương, xuất dữ liệu
 */
@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly taxCalculator: TaxCalculator,
    private readonly insuranceCalculator: InsuranceCalculator,
  ) {}

  /**
   * Tính lương cho toàn bộ nhân viên trong kỳ
   * Quy trình:
   * 1. Lấy danh sách nhân viên đang hoạt động
   * 2. Lấy thông tin hợp đồng, phụ cấp
   * 3. Lấy dữ liệu chấm công (OT)
   * 4. Lấy tạm ứng trong kỳ
   * 5. Tính bảo hiểm bắt buộc
   * 6. Tính thuế TNCN
   * 7. Tính lương thực nhận
   */
  async calculatePayroll(dto: CalculatePayrollDto) {
    const { month, year } = dto;

    // Kiểm tra kỳ lương đã tồn tại chưa
    const existingPeriod = await this.prisma.payrollPeriod.findFirst({
      where: { month, year },
    });

    if (existingPeriod && existingPeriod.status === PayrollPeriodStatus.CONFIRMED) {
      throw new BadRequestException(
        `Kỳ lương ${month}/${year} đã được xác nhận, không thể tính lại`,
      );
    }

    if (existingPeriod && existingPeriod.status === PayrollPeriodStatus.PAID) {
      throw new BadRequestException(
        `Kỳ lương ${month}/${year} đã thanh toán, không thể tính lại`,
      );
    }

    // Lấy danh sách nhân viên đang hoạt động
    const employees = await this.prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      include: {
        contract: true,
        department: true,
        dependents: true,
      },
    });

    // Tính lương từng nhân viên
    const payrollRecords: EmployeePayrollRecord[] = [];

    for (const employee of employees) {
      const record = await this.calculateForEmployee(employee, month, year);
      payrollRecords.push(record);
    }

    // Tính tổng quỹ lương
    const totalGross = payrollRecords.reduce((sum, r) => sum + r.grossIncome, 0);
    const totalNet = payrollRecords.reduce((sum, r) => sum + r.netSalary, 0);
    const totalDeductions = payrollRecords.reduce(
      (sum, r) => sum + r.deductions.totalDeductions, 0,
    );
    const totalEmployerInsurance = payrollRecords.reduce(
      (sum, r) => sum + r.employerInsurance, 0,
    );

    // Tạo hoặc cập nhật kỳ lương
    const period = await this.prisma.payrollPeriod.upsert({
      where: { id: existingPeriod?.id || 'new' },
      create: {
        month,
        year,
        status: PayrollPeriodStatus.CALCULATED,
        totalGross,
        totalNet,
        totalDeductions,
        totalEmployerInsurance,
        employeeCount: payrollRecords.length,
        calculatedAt: new Date(),
      },
      update: {
        status: PayrollPeriodStatus.CALCULATED,
        totalGross,
        totalNet,
        totalDeductions,
        totalEmployerInsurance,
        employeeCount: payrollRecords.length,
        calculatedAt: new Date(),
      },
    });

    // Lưu chi tiết từng nhân viên
    await this.prisma.payrollRecord.deleteMany({
      where: { periodId: period.id },
    });

    await this.prisma.payrollRecord.createMany({
      data: payrollRecords.map((record) => ({
        periodId: period.id,
        employeeId: record.employeeId,
        data: JSON.stringify(record),
        baseSalary: record.baseSalary,
        totalAllowances: record.allowances.total,
        overtimePay: record.overtimePay,
        totalBonus: record.bonus.total,
        commission: record.commission,
        grossIncome: record.grossIncome,
        insuranceDeduction: record.deductions.insurance.total,
        taxDeduction: record.deductions.personalIncomeTax,
        advancesDeduction: record.deductions.advances,
        otherDeductions: record.deductions.otherDeductions,
        totalDeductions: record.deductions.totalDeductions,
        netSalary: record.netSalary,
      })),
    });

    return {
      period,
      summary: {
        employeeCount: payrollRecords.length,
        totalGross,
        totalNet,
        totalDeductions,
        totalEmployerInsurance,
        totalCostToCompany: totalGross + totalEmployerInsurance,
      },
      records: payrollRecords,
    };
  }

  /**
   * Tính lương cho 1 nhân viên
   */
  private async calculateForEmployee(
    employee: any,
    month: number,
    year: number,
  ): Promise<EmployeePayrollRecord> {
    const contract = employee.contract;

    // Lương cơ bản từ hợp đồng
    const baseSalary = contract?.baseSalary || 0;

    // Phụ cấp
    const allowances = {
      transport: contract?.transportAllowance || 0,
      phone: contract?.phoneAllowance || 0,
      meal: contract?.mealAllowance || 0,
      other: contract?.otherAllowance || 0,
      total: 0,
    };
    allowances.total = allowances.transport + allowances.phone + allowances.meal + allowances.other;

    // Lấy giờ làm thêm từ attendance service
    const overtimeData = await this.getOvertimeData(employee.id, month, year);
    const overtimePay = this.calculateOvertimePay(baseSalary, overtimeData);

    // Lấy thưởng
    const bonusData = await this.getBonusData(employee.id, month, year);
    const bonus = {
      kpiBonus: bonusData.kpiBonus || 0,
      otherBonus: bonusData.otherBonus || 0,
      total: (bonusData.kpiBonus || 0) + (bonusData.otherBonus || 0),
    };

    // Hoa hồng (chỉ áp dụng cho tài xế)
    const commission = await this.getCommission(employee.id, month, year);

    // Tổng thu nhập (Gross)
    const grossIncome = baseSalary + allowances.total + overtimePay + bonus.total + commission;

    // Tính bảo hiểm bắt buộc
    // Mức lương đóng BH = lương cơ bản + phụ cấp đóng BH
    const insuranceSalary = baseSalary + (contract?.insuranceAllowance || 0);
    const region = employee.department?.region || 1;
    const insuranceResult = this.insuranceCalculator.calculate(insuranceSalary, region);

    const insurance = {
      socialInsurance: insuranceResult.socialInsurance.employee,
      healthInsurance: insuranceResult.healthInsurance.employee,
      unemploymentInsurance: insuranceResult.unemploymentInsurance.employee,
      total: insuranceResult.employeeTotal,
    };

    // Thu nhập sau BH (dùng để tính thuế)
    const incomeAfterInsurance = grossIncome - insurance.total;

    // Tính thuế TNCN
    // Thu nhập không chịu thuế: phụ cấp ăn trưa (<=730,000 không tính thuế)
    const nonTaxableMealAllowance = Math.min(allowances.meal, 730_000);
    const taxableGross = incomeAfterInsurance - nonTaxableMealAllowance;

    const numberOfDependents = employee.dependents?.length || 0;
    const taxResult = this.taxCalculator.calculate(taxableGross, numberOfDependents);

    // Lấy tạm ứng trong kỳ
    const advances = await this.getAdvances(employee.id, month, year);

    // Tổng khấu trừ
    const otherDeductions = 0; // Có thể mở rộng: nợ, phạt...
    const totalDeductions =
      insurance.total + taxResult.taxAmount + advances + otherDeductions;

    // Lương thực nhận (Net)
    const netSalary = grossIncome - totalDeductions;

    return {
      employeeId: employee.id,
      employeeName: employee.fullName,
      departmentId: employee.department?.id || '',
      departmentName: employee.department?.name || '',
      position: employee.position || '',
      baseSalary,
      allowances,
      overtimePay,
      bonus,
      commission,
      grossIncome,
      deductions: {
        insurance,
        personalIncomeTax: taxResult.taxAmount,
        advances,
        otherDeductions,
        totalDeductions,
      },
      netSalary,
      employerInsurance: insuranceResult.employerTotal,
      totalCostToCompany: grossIncome + insuranceResult.employerTotal,
    };
  }

  /**
   * Tính tiền làm thêm giờ
   * Ngày thường: 150% lương giờ
   * Cuối tuần: 200% lương giờ
   * Ngày lễ: 300% lương giờ
   */
  private calculateOvertimePay(
    baseSalary: number,
    overtimeData: { normalHours: number; weekendHours: number; holidayHours: number },
  ): number {
    // Lương giờ = Lương tháng / 26 ngày / 8 giờ
    const hourlyRate = baseSalary / 26 / 8;

    const normalOT = overtimeData.normalHours * hourlyRate * 1.5;
    const weekendOT = overtimeData.weekendHours * hourlyRate * 2.0;
    const holidayOT = overtimeData.holidayHours * hourlyRate * 3.0;

    return Math.round(normalOT + weekendOT + holidayOT);
  }

  /**
   * Lấy dữ liệu giờ làm thêm từ attendance service
   */
  private async getOvertimeData(
    employeeId: string,
    month: number,
    year: number,
  ): Promise<{ normalHours: number; weekendHours: number; holidayHours: number }> {
    try {
      const attendance = await this.prisma.attendanceRecord.findFirst({
        where: {
          employeeId,
          month,
          year,
        },
      });

      return {
        normalHours: attendance?.overtimeNormal || 0,
        weekendHours: attendance?.overtimeWeekend || 0,
        holidayHours: attendance?.overtimeHoliday || 0,
      };
    } catch {
      return { normalHours: 0, weekendHours: 0, holidayHours: 0 };
    }
  }

  /**
   * Lấy thông tin thưởng trong kỳ
   */
  private async getBonusData(
    employeeId: string,
    month: number,
    year: number,
  ): Promise<{ kpiBonus: number; otherBonus: number }> {
    try {
      const bonuses = await this.prisma.bonus.findMany({
        where: { employeeId, month, year },
      });

      const kpiBonus = bonuses
        .filter((b: any) => b.type === 'KPI')
        .reduce((sum: number, b: any) => sum + b.amount, 0);
      const otherBonus = bonuses
        .filter((b: any) => b.type !== 'KPI')
        .reduce((sum: number, b: any) => sum + b.amount, 0);

      return { kpiBonus, otherBonus };
    } catch {
      return { kpiBonus: 0, otherBonus: 0 };
    }
  }

  /**
   * Lấy hoa hồng tài xế trong kỳ
   */
  private async getCommission(
    employeeId: string,
    month: number,
    year: number,
  ): Promise<number> {
    try {
      const commissions = await this.prisma.commission.findMany({
        where: { employeeId, month, year, status: 'APPROVED' },
      });

      return commissions.reduce((sum: number, c: any) => sum + c.amount, 0);
    } catch {
      return 0;
    }
  }

  /**
   * Lấy tổng tạm ứng đã duyệt trong kỳ
   */
  private async getAdvances(
    employeeId: string,
    month: number,
    year: number,
  ): Promise<number> {
    try {
      const advances = await this.prisma.advance.findMany({
        where: {
          employeeId,
          month,
          year,
          status: 'APPROVED',
        },
      });

      return advances.reduce((sum: number, a: any) => sum + a.amount, 0);
    } catch {
      return 0;
    }
  }

  /**
   * Danh sách kỳ lương (có phân trang và lọc)
   */
  async listPeriods(filter: FilterPayrollDto) {
    const { month, year, status, page = 1, limit = 20 } = filter;

    const where: any = {};
    if (month) where.month = month;
    if (year) where.year = year;
    if (status) where.status = status;

    const [periods, total] = await Promise.all([
      this.prisma.payrollPeriod.findMany({
        where,
        skip: getSkip(page, limit),
        take: limit,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      this.prisma.payrollPeriod.count({ where }),
    ]);

    return paginate(periods, total, page, limit);
  }

  /**
   * Chi tiết kỳ lương - tất cả bản ghi nhân viên
   */
  async getPeriodDetail(periodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      include: {
        records: {
          orderBy: { netSalary: 'desc' },
        },
      },
    });

    if (!period) {
      throw new NotFoundException(`Không tìm thấy kỳ lương với ID: ${periodId}`);
    }

    return {
      period,
      records: period.records.map((r: any) => ({
        ...r,
        data: r.data ? JSON.parse(r.data) : null,
      })),
    };
  }

  /**
   * Phiếu lương cá nhân
   */
  async getPayslip(periodId: string, employeeId: string) {
    const record = await this.prisma.payrollRecord.findFirst({
      where: { periodId, employeeId },
      include: { period: true },
    });

    if (!record) {
      throw new NotFoundException(
        `Không tìm thấy phiếu lương cho nhân viên ${employeeId} trong kỳ ${periodId}`,
      );
    }

    return {
      period: record.period,
      payslip: record.data ? JSON.parse(record.data as string) : record,
    };
  }

  /**
   * Xác nhận kỳ lương
   * Chỉ cho phép chuyển từ CALCULATED → CONFIRMED
   */
  async confirmPeriod(periodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
    });

    if (!period) {
      throw new NotFoundException(`Không tìm thấy kỳ lương với ID: ${periodId}`);
    }

    if (period.status !== PayrollPeriodStatus.CALCULATED) {
      throw new BadRequestException(
        `Chỉ có thể xác nhận kỳ lương ở trạng thái CALCULATED. Trạng thái hiện tại: ${period.status}`,
      );
    }

    const updated = await this.prisma.payrollPeriod.update({
      where: { id: periodId },
      data: {
        status: PayrollPeriodStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
    });

    return {
      message: `Đã xác nhận kỳ lương ${period.month}/${period.year}`,
      period: updated,
    };
  }

  /**
   * Thống kê lương theo tháng
   * - Tổng quỹ lương
   * - Phân bổ theo phòng ban
   */
  async getMonthlyStats(month: number, year: number) {
    const period = await this.prisma.payrollPeriod.findFirst({
      where: { month, year },
      include: { records: true },
    });

    if (!period) {
      throw new NotFoundException(`Không tìm thấy kỳ lương ${month}/${year}`);
    }

    // Tổng hợp theo phòng ban
    const departmentStats: Record<string, {
      departmentName: string;
      employeeCount: number;
      totalGross: number;
      totalNet: number;
      totalInsurance: number;
      totalTax: number;
    }> = {};

    for (const record of period.records) {
      const data: EmployeePayrollRecord = record.data
        ? JSON.parse(record.data as string)
        : null;

      if (!data) continue;

      const deptId = data.departmentId || 'unknown';
      if (!departmentStats[deptId]) {
        departmentStats[deptId] = {
          departmentName: data.departmentName || 'Không xác định',
          employeeCount: 0,
          totalGross: 0,
          totalNet: 0,
          totalInsurance: 0,
          totalTax: 0,
        };
      }

      departmentStats[deptId].employeeCount++;
      departmentStats[deptId].totalGross += data.grossIncome;
      departmentStats[deptId].totalNet += data.netSalary;
      departmentStats[deptId].totalInsurance += data.deductions.insurance.total;
      departmentStats[deptId].totalTax += data.deductions.personalIncomeTax;
    }

    return {
      period: {
        month: period.month,
        year: period.year,
        status: period.status,
      },
      summary: {
        totalFund: period.totalGross + period.totalEmployerInsurance,
        totalGross: period.totalGross,
        totalNet: period.totalNet,
        totalDeductions: period.totalDeductions,
        totalEmployerInsurance: period.totalEmployerInsurance,
        employeeCount: period.employeeCount,
        averageSalary: period.employeeCount > 0
          ? Math.round(period.totalNet / period.employeeCount)
          : 0,
      },
      byDepartment: Object.values(departmentStats),
    };
  }

  /**
   * Xuất dữ liệu kỳ lương (dạng JSON cho export Excel/PDF)
   */
  async exportPeriodData(periodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      include: {
        records: {
          orderBy: { netSalary: 'desc' },
        },
      },
    });

    if (!period) {
      throw new NotFoundException(`Không tìm thấy kỳ lương với ID: ${periodId}`);
    }

    const exportData = period.records.map((record: any) => {
      const data: EmployeePayrollRecord = record.data
        ? JSON.parse(record.data)
        : null;

      return {
        maNV: data?.employeeId || record.employeeId,
        hoTen: data?.employeeName || '',
        phongBan: data?.departmentName || '',
        chucVu: data?.position || '',
        luongCoBan: record.baseSalary,
        phucap: record.totalAllowances,
        lamThem: record.overtimePay,
        thuong: record.totalBonus,
        hoaHong: record.commission,
        tongThuNhap: record.grossIncome,
        baoHiem: record.insuranceDeduction,
        thue: record.taxDeduction,
        tamUng: record.advancesDeduction,
        khauTruKhac: record.otherDeductions,
        tongKhauTru: record.totalDeductions,
        thucNhan: record.netSalary,
      };
    });

    return {
      period: {
        month: period.month,
        year: period.year,
        status: period.status,
        calculatedAt: period.calculatedAt,
        confirmedAt: period.confirmedAt,
      },
      totalRecords: exportData.length,
      data: exportData,
    };
  }
}
