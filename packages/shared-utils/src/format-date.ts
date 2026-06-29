/**
 * Tiện ích định dạng ngày tháng theo locale Việt Nam
 */

/**
 * Định dạng ngày theo kiểu Việt Nam (dd/MM/yyyy)
 * @param date - Ngày cần định dạng (Date | string | number)
 * @returns Chuỗi ngày đã định dạng (VD: "25/12/2024")
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '';
  }

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Định dạng ngày giờ theo kiểu Việt Nam (dd/MM/yyyy HH:mm)
 * @param date - Ngày cần định dạng
 * @returns Chuỗi ngày giờ đã định dạng (VD: "25/12/2024 14:30")
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '';
  }

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Định dạng ngày giờ đầy đủ (dd/MM/yyyy HH:mm:ss)
 * @param date - Ngày cần định dạng
 * @returns Chuỗi ngày giờ đầy đủ (VD: "25/12/2024 14:30:59")
 */
export function formatDateTimeFull(date: Date | string | number): string {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '';
  }

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Tính khoảng cách thời gian relative (VD: "2 giờ trước", "3 ngày trước")
 * @param date - Ngày cần so sánh
 * @returns Chuỗi thời gian tương đối
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '';
  }

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 30) return `${diffDays} ngày trước`;
  if (diffMonths < 12) return `${diffMonths} tháng trước`;
  return `${diffYears} năm trước`;
}
