"use client";

import { useMemo } from "react";

interface MonthSelectProps {
  value?: string; // "YYYY-MM"
  onChange: (value: string) => void;
  fromYear?: number;
  toYear?: number;
}

const SELECT_CLASS =
  "px-2 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white";

export function MonthSelect({
  value,
  onChange,
  fromYear = 1990,
  toYear = new Date().getFullYear(),
}: MonthSelectProps) {
  const [y, m] = value ? value.split("-") : ["", ""];

  const years = useMemo(() => {
    const list: number[] = [];
    for (let year = fromYear; year <= toYear; year++) list.push(year);
    return list.reverse();
  }, [fromYear, toYear]);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const emit = (nm: string, ny: string) => {
    if (nm && ny) {
      onChange(`${ny}-${nm.padStart(2, "0")}`);
    } else {
      onChange(!ny && !nm ? "" : `${ny || ""}-${nm || ""}`);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <select
        aria-label="Tháng"
        value={m ? String(parseInt(m, 10)) : ""}
        onChange={(e) => emit(e.target.value, y)}
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
        onChange={(e) => emit(m ? String(parseInt(m, 10)) : "", e.target.value)}
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
