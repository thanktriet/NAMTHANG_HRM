/**
 * Tiện ích validate dữ liệu
 */

/**
 * Kiểm tra số điện thoại Việt Nam hợp lệ
 * Hỗ trợ: 0xx, +84xx, 84xx (10-11 số)
 * @param phone - Số điện thoại cần kiểm tra
 * @returns true nếu hợp lệ
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  // Số điện thoại VN: bắt đầu bằng 0, +84, hoặc 84, theo sau là 9-10 chữ số
  const phoneRegex = /^(\+?84|0)(3|5|7|8|9)\d{8}$/;
  // Loại bỏ khoảng trắng và dấu gạch ngang
  const cleaned = phone.replace(/[\s-]/g, '');
  return phoneRegex.test(cleaned);
}

/**
 * Kiểm tra số CCCD (Căn cước công dân) hợp lệ
 * CCCD mới có 12 số
 * @param cccd - Số CCCD cần kiểm tra
 * @returns true nếu hợp lệ
 */
export function isValidCCCD(cccd: string): boolean {
  if (!cccd) return false;
  // CCCD gồm 12 chữ số, bắt đầu bằng 0
  const cccdRegex = /^0\d{11}$/;
  return cccdRegex.test(cccd.trim());
}

/**
 * Kiểm tra email hợp lệ
 * @param email - Email cần kiểm tra
 * @returns true nếu hợp lệ
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Kiểm tra mã số thuế cá nhân hợp lệ
 * MST gồm 10 hoặc 13 số
 * @param taxCode - Mã số thuế
 * @returns true nếu hợp lệ
 */
export function isValidTaxCode(taxCode: string): boolean {
  if (!taxCode) return false;
  const taxRegex = /^\d{10}(\d{3})?$/;
  return taxRegex.test(taxCode.trim());
}

/**
 * Kiểm tra tên hợp lệ (tiếng Việt có dấu)
 * @param name - Tên cần kiểm tra
 * @returns true nếu hợp lệ
 */
export function isValidVietnameseName(name: string): boolean {
  if (!name || name.trim().length < 2) return false;
  // Cho phép chữ cái (bao gồm Unicode/tiếng Việt), khoảng trắng
  const nameRegex = /^[\p{L}\s]+$/u;
  return nameRegex.test(name.trim());
}
