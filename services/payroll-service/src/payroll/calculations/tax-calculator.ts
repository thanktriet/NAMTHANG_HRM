import { Injectable } from '@nestjs/common';

/**
 * Bậc thuế thu nhập cá nhân theo luật Việt Nam
 * Áp dụng biểu thuế lũy tiến từng phần
 */
interface TaxBracket {
  /** Giới hạn trên của bậc (VND) */
  upperLimit: number;
  /** Thuế suất (%) */
  rate: number;
}

/**
 * Kết quả tính thuế TNCN
 */
export interface TaxCalculationResult {
  /** Thu nhập chịu thuế */
  taxableIncome: number;
  /** Số thuế phải nộp */
  taxAmount: number;
  /** Thu nhập sau thuế */
  incomeAfterTax: number;
  /** Chi tiết từng bậc thuế */
  brackets: { bracket: number; amount: number; rate: number; tax: number }[];
}

/**
 * Calculator tính thuế thu nhập cá nhân Việt Nam
 * Theo Luật Thuế TNCN và các nghị định hướng dẫn (2026)
 */
@Injectable()
export class TaxCalculator {
  /** Giảm trừ bản thân: 11,000,000 VND/tháng */
  private readonly PERSONAL_DEDUCTION = 11_000_000;

  /** Giảm trừ người phụ thuộc: 4,400,000 VND/người/tháng */
  private readonly DEPENDENT_DEDUCTION = 4_400_000;

  /**
   * Biểu thuế lũy tiến từng phần (đơn vị: VND/tháng)
   * Bậc 1: Đến 5 triệu      - 5%
   * Bậc 2: 5 - 10 triệu     - 10%
   * Bậc 3: 10 - 18 triệu    - 15%
   * Bậc 4: 18 - 32 triệu    - 20%
   * Bậc 5: 32 - 52 triệu    - 25%
   * Bậc 6: 52 - 80 triệu    - 30%
   * Bậc 7: Trên 80 triệu    - 35%
   */
  private readonly TAX_BRACKETS: TaxBracket[] = [
    { upperLimit: 5_000_000, rate: 5 },
    { upperLimit: 10_000_000, rate: 10 },
    { upperLimit: 18_000_000, rate: 15 },
    { upperLimit: 32_000_000, rate: 20 },
    { upperLimit: 52_000_000, rate: 25 },
    { upperLimit: 80_000_000, rate: 30 },
    { upperLimit: Infinity, rate: 35 },
  ];

  /**
   * Tính thuế thu nhập cá nhân
   * @param grossIncome - Thu nhập chịu thuế trước giảm trừ (đã trừ BH bắt buộc)
   * @param numberOfDependents - Số người phụ thuộc
   * @returns Kết quả tính thuế chi tiết
   */
  calculate(grossIncome: number, numberOfDependents: number = 0): TaxCalculationResult {
    // Tính tổng giảm trừ gia cảnh
    const totalDeduction =
      this.PERSONAL_DEDUCTION + this.DEPENDENT_DEDUCTION * numberOfDependents;

    // Thu nhập chịu thuế = thu nhập - giảm trừ gia cảnh
    const taxableIncome = Math.max(0, grossIncome - totalDeduction);

    // Nếu thu nhập chịu thuế <= 0, không phải nộp thuế
    if (taxableIncome <= 0) {
      return {
        taxableIncome: 0,
        taxAmount: 0,
        incomeAfterTax: grossIncome,
        brackets: [],
      };
    }

    // Tính thuế theo biểu lũy tiến từng phần
    let remainingIncome = taxableIncome;
    let totalTax = 0;
    let previousLimit = 0;
    const bracketDetails: { bracket: number; amount: number; rate: number; tax: number }[] = [];

    for (let i = 0; i < this.TAX_BRACKETS.length; i++) {
      if (remainingIncome <= 0) break;

      const bracket = this.TAX_BRACKETS[i];
      const bracketWidth = bracket.upperLimit === Infinity
        ? remainingIncome
        : bracket.upperLimit - previousLimit;

      // Số tiền chịu thuế trong bậc này
      const taxableInBracket = Math.min(remainingIncome, bracketWidth);
      const taxInBracket = Math.round(taxableInBracket * bracket.rate / 100);

      bracketDetails.push({
        bracket: i + 1,
        amount: taxableInBracket,
        rate: bracket.rate,
        tax: taxInBracket,
      });

      totalTax += taxInBracket;
      remainingIncome -= taxableInBracket;
      previousLimit = bracket.upperLimit;
    }

    return {
      taxableIncome,
      taxAmount: totalTax,
      incomeAfterTax: grossIncome - totalTax,
      brackets: bracketDetails,
    };
  }

  /**
   * Tính thuế TNCN nhanh (chỉ trả về số thuế)
   */
  calculateQuick(grossIncome: number, numberOfDependents: number = 0): number {
    return this.calculate(grossIncome, numberOfDependents).taxAmount;
  }

  /**
   * Lấy giá trị giảm trừ bản thân
   */
  getPersonalDeduction(): number {
    return this.PERSONAL_DEDUCTION;
  }

  /**
   * Lấy giá trị giảm trừ người phụ thuộc
   */
  getDependentDeduction(): number {
    return this.DEPENDENT_DEDUCTION;
  }
}
