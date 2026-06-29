import { Injectable } from '@nestjs/common';

/**
 * Kết quả tính bảo hiểm bắt buộc
 */
export interface InsuranceCalculationResult {
  /** Tổng phần nhân viên đóng */
  employeeTotal: number;
  /** Tổng phần doanh nghiệp đóng */
  employerTotal: number;

  /** Chi tiết BHXH */
  socialInsurance: {
    employee: number; // 8%
    employer: number; // 17.5%
    base: number; // Mức lương đóng BH (có trần)
  };

  /** Chi tiết BHYT */
  healthInsurance: {
    employee: number; // 1.5%
    employer: number; // 3%
    base: number;
  };

  /** Chi tiết BHTN */
  unemploymentInsurance: {
    employee: number; // 1%
    employer: number; // 1%
    base: number; // Có trần riêng (20 lần lương tối thiểu vùng)
  };
}

/**
 * Calculator tính bảo hiểm bắt buộc theo quy định Việt Nam 2026
 *
 * BHXH: 8% (NV) + 17.5% (DN) - Trần: 20 lần mức lương cơ sở
 * BHYT: 1.5% (NV) + 3% (DN) - Trần: 20 lần mức lương cơ sở
 * BHTN: 1% (NV) + 1% (DN) - Trần: 20 lần mức lương tối thiểu vùng
 */
@Injectable()
export class InsuranceCalculator {
  /** Mức lương cơ sở 2026: 2,340,000 VND (theo Nghị định) */
  private readonly BASE_SALARY = 2_340_000;

  /** Trần đóng BHXH, BHYT: 20 lần lương cơ sở */
  private readonly SOCIAL_HEALTH_CAP = this.BASE_SALARY * 20; // 46,800,000

  /**
   * Mức lương tối thiểu vùng (2026)
   * Vùng I: 4,960,000
   * Vùng II: 4,410,000
   * Vùng III: 3,860,000
   * Vùng IV: 3,450,000
   */
  private readonly REGIONAL_MIN_SALARY: Record<number, number> = {
    1: 4_960_000,
    2: 4_410_000,
    3: 3_860_000,
    4: 3_450_000,
  };

  /** Tỷ lệ đóng BHXH */
  private readonly SOCIAL_INSURANCE_RATE = {
    employee: 8, // 8%
    employer: 17.5, // 17.5%
  };

  /** Tỷ lệ đóng BHYT */
  private readonly HEALTH_INSURANCE_RATE = {
    employee: 1.5, // 1.5%
    employer: 3, // 3%
  };

  /** Tỷ lệ đóng BHTN */
  private readonly UNEMPLOYMENT_INSURANCE_RATE = {
    employee: 1, // 1%
    employer: 1, // 1%
  };

  /**
   * Tính bảo hiểm bắt buộc cho nhân viên
   * @param contributionSalary - Mức lương đóng bảo hiểm (lương + phụ cấp đóng BH)
   * @param region - Vùng lương tối thiểu (1-4), mặc định vùng 1
   * @returns Kết quả chi tiết các khoản bảo hiểm
   */
  calculate(contributionSalary: number, region: number = 1): InsuranceCalculationResult {
    // Trần đóng BHXH và BHYT
    const socialHealthBase = Math.min(contributionSalary, this.SOCIAL_HEALTH_CAP);

    // Trần đóng BHTN: 20 lần lương tối thiểu vùng
    const regionalMin = this.REGIONAL_MIN_SALARY[region] || this.REGIONAL_MIN_SALARY[1];
    const unemploymentCap = regionalMin * 20;
    const unemploymentBase = Math.min(contributionSalary, unemploymentCap);

    // Tính BHXH
    const socialInsurance = {
      employee: Math.round(socialHealthBase * this.SOCIAL_INSURANCE_RATE.employee / 100),
      employer: Math.round(socialHealthBase * this.SOCIAL_INSURANCE_RATE.employer / 100),
      base: socialHealthBase,
    };

    // Tính BHYT
    const healthInsurance = {
      employee: Math.round(socialHealthBase * this.HEALTH_INSURANCE_RATE.employee / 100),
      employer: Math.round(socialHealthBase * this.HEALTH_INSURANCE_RATE.employer / 100),
      base: socialHealthBase,
    };

    // Tính BHTN
    const unemploymentInsurance = {
      employee: Math.round(unemploymentBase * this.UNEMPLOYMENT_INSURANCE_RATE.employee / 100),
      employer: Math.round(unemploymentBase * this.UNEMPLOYMENT_INSURANCE_RATE.employer / 100),
      base: unemploymentBase,
    };

    // Tổng phần nhân viên đóng (10.5%)
    const employeeTotal =
      socialInsurance.employee + healthInsurance.employee + unemploymentInsurance.employee;

    // Tổng phần doanh nghiệp đóng (21.5%)
    const employerTotal =
      socialInsurance.employer + healthInsurance.employer + unemploymentInsurance.employer;

    return {
      employeeTotal,
      employerTotal,
      socialInsurance,
      healthInsurance,
      unemploymentInsurance,
    };
  }

  /**
   * Tính nhanh tổng BH phần nhân viên đng
   */
  calculateEmployeePortion(contributionSalary: number, region: number = 1): number {
    return this.calculate(contributionSalary, region).employeeTotal;
  }

  /**
   * Tính nhanh tổng BH phần doanh nghiệp đóng
   */
  calculateEmployerPortion(contributionSalary: number, region: number = 1): number {
    return this.calculate(contributionSalary, region).employerTotal;
  }

  /**
   * Lấy trần đóng BHXH/BHYT
   */
  getSocialHealthCap(): number {
    return this.SOCIAL_HEALTH_CAP;
  }

  /**
   * Lấy trần đóng BHTN theo vùng
   */
  getUnemploymentCap(region: number = 1): number {
    const regionalMin = this.REGIONAL_MIN_SALARY[region] || this.REGIONAL_MIN_SALARY[1];
    return regionalMin * 20;
  }
}
