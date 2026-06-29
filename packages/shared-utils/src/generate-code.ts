/**
 * Tiện ích sinh mã tự động cho các đối tượng trong hệ thống
 */

/**
 * Sinh mã nhân viên
 * @param sequence - Số thứ tự (VD: 1, 2, 3...)
 * @param prefix - Tiền tố (mặc định: "NV")
 * @returns Mã nhân viên (VD: "NV-0001")
 */
export function generateEmployeeCode(sequence: number, prefix = 'NV'): string {
  const paddedNumber = sequence.toString().padStart(4, '0');
  return `${prefix}-${paddedNumber}`;
}

/**
 * Sinh mã ứng viên
 * @param sequence - Số thứ tự
 * @param prefix - Tiền tố (mặc định: "UV")
 * @returns Mã ứng viên (VD: "UV-0001")
 */
export function generateCandidateCode(sequence: number, prefix = 'UV'): string {
  const paddedNumber = sequence.toString().padStart(4, '0');
  return `${prefix}-${paddedNumber}`;
}

/**
 * Sinh mã hợp đồng
 * @param sequence - Số thứ tự
 * @param prefix - Tiền tố (mặc định: "HD")
 * @returns Mã hợp đồng (VD: "HD-2024-0001")
 */
export function generateContractCode(sequence: number, prefix = 'HD'): string {
  const year = new Date().getFullYear();
  const paddedNumber = sequence.toString().padStart(4, '0');
  return `${prefix}-${year}-${paddedNumber}`;
}

/**
 * Sinh mã phòng ban
 * @param sequence - Số thứ tự
 * @param prefix - Tiền tố (mặc định: "PB")
 * @returns Mã phòng ban (VD: "PB-001")
 */
export function generateDepartmentCode(sequence: number, prefix = 'PB'): string {
  const paddedNumber = sequence.toString().padStart(3, '0');
  return `${prefix}-${paddedNumber}`;
}
