/**
 * Tiện ích định dạng tiền tệ Việt Nam
 */

/**
 * Định dạng số tiền sang VND
 * @param amount - Số tiền cần định dạng
 * @returns Chuỗi đã định dạng (VD: "1.236.000.000 ₫")
 * @example
 * formatVND(1236000000) // "1.236.000.000 ₫"
 * formatVND(5000000) // "5.000.000 ₫"
 * formatVND(0) // "0 ₫"
 */
export function formatVND(amount: number): string {
  if (!Number.isFinite(amount)) {
    return '0 ₫';
  }

  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${formatted} ₫`;
}

/**
 * Định dạng số tiền rút gọn (triệu, tỷ)
 * @param amount - Số tiền
 * @returns Chuỗi rút gọn (VD: "1.2 tỷ", "5 triệu")
 */
export function formatVNDShort(amount: number): string {
  if (!Number.isFinite(amount)) {
    return '0 ₫';
  }

  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_000_000_000) {
    const value = abs / 1_000_000_000;
    return `${sign}${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} tỷ`;
  }

  if (abs >= 1_000_000) {
    const value = abs / 1_000_000;
    return `${sign}${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} triệu`;
  }

  return formatVND(amount);
}
