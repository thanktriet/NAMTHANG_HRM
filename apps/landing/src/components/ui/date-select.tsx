"use client";

import { useMemo } from "react";

interface DateSelectProps {
  value?: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  /** Năm bắt đầu (mặc định 1960) */
  fromYear?: number;
  /** Năm kết thúc (mặc định năm hiện tại) */
  toYear?: number;
  /** Đảo thứ tự năm giảm dần (mặc định true - tiện cho ngày sinh) */
  yearDesc?: boolean;
}

const SELECT_CLASS =
  "px-2 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white";

export function DateSelect({
  value,
  onChange,
  fromYear = 1960,
  toYear = new Date().getFullYear(),
  yearDesc = true,
}: DateSelectProps) {
  // Tách value "YYYY-MM-DD" thành 3 phần
  const [y, m, d] = value ? value.split("-") : ["", "", ""];

  const years = useMemo(() => {
    const list: number[] = [];
    for (let year = fromYear; year <= toYear; year++) list.push(year);
    return yearDesc ? list.reverse() : list;
  }, [fromYear, toYear, yearDesc]);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  // Số ngày trong tháng (tính theo năm/tháng đã chọn để loại 30/31, năm nhuận)
  const daysInMonth = useMemo(() => {
    const yy = parseInt(y || "0", 10);
    const mm = parseInt(m || "0", 10);
    if (!yy || !mm) return 31;
    return new Date(yy, mm, 0).getDate();
  }, [y, m]);

  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  const emit = (nd: string, nm: string, ny: string) => {
    if (nd && nm && ny) {
      const dd = nd.padStart(2, "0");
      const mm = nm.padStart(2, "0");
      onChange(`${ny}-${mm}-${dd}`);
    } else {
      // Chưa đủ 3 phần: gộp tạm để giữ lựa chọn, validation sẽ báo nếu thiếu
      onChange([ny, nm, nd].every((x) => !x) ? "" : `${ny || ""}-${nm || ""}-${nd || ""}`);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <select
        aria-label="Ngày"
        value={d ? String(parseInt(d, 10)) : ""}
        onChange={(e) => emit(e.target.value, String(parseInt(m || "0", 10)) === "0" ? "" : String(parseInt(m, 10)), y)}
        className={SELECT_CLASS}
      >
        <option value="">Ngày</option>
        {days.map((day) => (
          <option key={day} value={day}>
            {day}
          </option>
        ))}
      </select>

      <select
        aria-label="Tháng"
        value={m ? String(parseInt(m, 10)) : ""}
        onChange={(e) => emit(d ? String(parseInt(d, 10)) : "", e.target.value, y)}
        className={SELECT_CLASS}
      >
        <option value="">Tháng</option>
        {months.map((month) => (
          <option key={month} value={month}>
            Th{month}
          </option>
        ))}
      </select>

      <select
        aria-label="Năm"
        value={y || ""}
        onChange={(e) => emit(d ? String(parseInt(d, 10)) : "", m ? String(parseInt(m, 10)) : "", e.target.value)}
        className={SELECT_CLASS}
      >
        <option value="">Năm</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
