"use client";

import { useState, useEffect, useCallback } from "react";

interface PayrollPeriod {
  id: string;
  month: number;
  year: number;
  status: "draft" | "calculated" | "confirmed" | "paid";
  calculated_at?: string | null;
}

interface PayrollRecord {
  id: string;
  employee_id: string;
  code: string;
  full_name: string;
  department_name: string;
  base_salary: number | string;
  allowances?: Record<string, number> | null;
  ot_amount: number | string;
  bonus: number | string;
  social_insurance: number | string;
  health_insurance: number | string;
  unemployment_insurance: number | string;
  personal_income_tax: number | string;
  other_deductions: number | string;
  advance_deducted: number | string;
  commission: number | string;
  net_salary: number | string;
}

interface PayrollStats {
  total_employees?: number | string | null;
  total_gross?: number | string | null;
  total_deductions?: number | string | null;
  total_net?: number | string | null;
  total_salary_fund?: number | string | null;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Nháp",
  calculated: "Đã tính",
  confirmed: "Đã xác nhận",
  paid: "Đã thanh toán",
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  draft: { bg: "#f3f4f6", color: "#6b7280" },
  calculated: { bg: "#dbeafe", color: "#2563eb" },
  confirmed: { bg: "#dcfce7", color: "#16a34a" },
  paid: { bg: "#e0e7ff", color: "#4f46e5" },
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("namthang_hrm_token");
}

function num(v: number | string | null | undefined): number {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return n == null || isNaN(n) ? 0 : n;
}

function formatCurrency(amount: number | string | null | undefined): string {
  const n = num(amount);
  return n.toLocaleString("vi-VN") + " ₫";
}

function sumAllowances(a: Record<string, number> | null | undefined): number {
  if (!a || typeof a !== "object") return 0;
  return Object.values(a).reduce((acc: number, v) => acc + num(v as any), 0);
}

const API = "/api-proxy/api/v1/payroll";
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const NOW = new Date();

export default function TienLuongPage() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [stats, setStats] = useState<PayrollStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Form tạo kỳ
  const [newMonth, setNewMonth] = useState(NOW.getMonth() + 1);
  const [newYear, setNewYear] = useState(NOW.getFullYear());

  const headers = useCallback((): Record<string, string> => {
    return { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
  }, []);

  const fetchPeriods = useCallback(async () => {
    const res = await fetch(`${API}/periods`, { headers: headers() });
    if (!res.ok) throw new Error(`Lỗi ${res.status}: không tải được kỳ lương`);
    const data = await res.json();
    const items: PayrollPeriod[] = data.data?.items || data.items || [];
    setPeriods(items);
    return items;
  }, [headers]);

  const fetchRecords = useCallback(async (periodId: string) => {
    const [recRes, statRes] = await Promise.all([
      fetch(`${API}/periods/${periodId}/records`, { headers: headers() }),
      fetch(`${API}/stats?period_id=${periodId}`, { headers: headers() }),
    ]);
    const recData = await recRes.json();
    setRecords(recData.data?.items || recData.items || []);
    if (statRes.ok) {
      const s = await statRes.json();
      setStats(s.data || s);
    }
  }, [headers]);

  useEffect(() => {
    const init = async () => {
      try {
        if (!getToken()) {
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          setLoading(false);
          return;
        }
        const items = await fetchPeriods();
        if (items.length > 0) {
          setSelectedPeriod(items[0]);
          await fetchRecords(items[0].id);
        }
      } catch (err: any) {
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchPeriods, fetchRecords]);

  const selectPeriod = async (p: PayrollPeriod) => {
    setSelectedPeriod(p);
    setRecords([]);
    setStats(null);
    try {
      await fetchRecords(p.id);
    } catch {
      // bỏ qua
    }
  };

  const handleCreatePeriod = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${API}/periods`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ month: newMonth, year: newYear }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Tạo kỳ lương thất bại");
      const items = await fetchPeriods();
      const created = items.find((x) => x.month === newMonth && x.year === newYear);
      if (created) await selectPeriod(created);
    } catch (err: any) {
      alert(err.message || "Có lỗi khi tạo kỳ lương");
    } finally {
      setBusy(false);
    }
  };

  const handleCalculate = async () => {
    if (!selectedPeriod) return;
    if (!window.confirm(`Tính lương cho kỳ ${selectedPeriod.month}/${selectedPeriod.year}?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/periods/${selectedPeriod.id}/calculate`, {
        method: "POST",
        headers: headers(),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Tính lương thất bại");
      await fetchPeriods();
      await fetchRecords(selectedPeriod.id);
      setSelectedPeriod((prev) => (prev ? { ...prev, status: "calculated" } : prev));
    } catch (err: any) {
      alert(err.message || "Có lỗi khi tính lương");
    } finally {
      setBusy(false);
    }
  };

  const handleStatusAction = async (action: "confirm" | "pay") => {
    if (!selectedPeriod) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/periods/${selectedPeriod.id}/${action}`, {
        method: "PATCH",
        headers: headers(),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Thao tác thất bại");
      const items = await fetchPeriods();
      const updated = items.find((x) => x.id === selectedPeriod.id);
      if (updated) setSelectedPeriod(updated);
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra");
    } finally {
      setBusy(false);
    }
  };

  const filtered = records.filter((r) => {
    if (!search) return true;
    return (
      r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.code?.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "4px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#6b7280", fontSize: 14 }}>Đang tải dữ liệu tiền lương...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 20, color: "#dc2626", textAlign: "center" }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Lỗi</p>
          <p style={{ fontSize: 14 }}>{error}</p>
        </div>
      </div>
    );
  }

  const st = selectedPeriod?.status;
  const statCards = [
    { label: "Số nhân viên", value: String(num(stats?.total_employees)), color: "#2563eb", bg: "#eff6ff", icon: "👥" },
    { label: "Tổng thu nhập", value: formatCurrency(stats?.total_gross ?? stats?.total_salary_fund), color: "#16a34a", bg: "#f0fdf4", icon: "💰" },
    { label: "Tổng khấu trừ", value: formatCurrency(stats?.total_deductions), color: "#dc2626", bg: "#fef2f2", icon: "➖" },
    { label: "Tổng thực nhận", value: formatCurrency(stats?.total_net), color: "#4f46e5", bg: "#eef2ff", icon: "🏦" },
  ];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Quản lý tiền lương</h1>

      {/* Thanh kỳ lương */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 16, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Kỳ lương:</span>
          <select
            value={selectedPeriod?.id || ""}
            onChange={(e) => {
              const p = periods.find((x) => x.id === e.target.value);
              if (p) selectPeriod(p);
            }}
            style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, minWidth: 160 }}
          >
            {periods.length === 0 && <option value="">Chưa có kỳ nào</option>}
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                Tháng {p.month}/{p.year} — {STATUS_LABELS[p.status]}
              </option>
            ))}
          </select>
          {selectedPeriod && (
            <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, ...STATUS_COLORS[selectedPeriod.status] }}>
              {STATUS_LABELS[selectedPeriod.status]}
            </span>
          )}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* Tạo kỳ mới */}
          <select value={newMonth} onChange={(e) => setNewMonth(Number(e.target.value))} style={{ padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
            {MONTHS.map((m) => <option key={m} value={m}>Tháng {m}</option>)}
          </select>
          <input type="number" value={newYear} onChange={(e) => setNewYear(Number(e.target.value))} style={{ padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, width: 90 }} />
          <button onClick={handleCreatePeriod} disabled={busy} style={{ padding: "8px 14px", border: "1px solid #2563eb", background: "#fff", color: "#2563eb", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer" }}>
            + Tạo kỳ
          </button>

          {/* Hành động theo trạng thái */}
          {selectedPeriod && (st === "draft" || st === "calculated") && (
            <button onClick={handleCalculate} disabled={busy} style={{ padding: "8px 14px", border: "none", background: "#2563eb", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer" }}>
              {busy ? "Đang tính..." : st === "calculated" ? "Tính lại" : "Tính lương"}
            </button>
          )}
          {selectedPeriod && st === "calculated" && (
            <button onClick={() => handleStatusAction("confirm")} disabled={busy} style={{ padding: "8px 14px", border: "none", background: "#16a34a", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer" }}>
              Xác nhận
            </button>
          )}
          {selectedPeriod && st === "confirmed" && (
            <button onClick={() => handleStatusAction("pay")} disabled={busy} style={{ padding: "8px 14px", border: "none", background: "#4f46e5", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer" }}>
              Đánh dấu đã trả
            </button>
          )}
        </div>
      </div>

      {periods.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 40, textAlign: "center", color: "#6b7280", fontSize: 14 }}>
          Chưa có kỳ lương nào. Chọn tháng/năm và bấm "Tạo kỳ" để bắt đầu.
        </div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {statCards.map((card, idx) => (
              <div key={idx} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{card.icon}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: card.color }}>{card.value}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>{card.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 16 }}>
            <input type="text" placeholder="Tìm theo tên hoặc mã NV..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", maxWidth: 300, padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, outline: "none" }} />
          </div>

          {/* Bảng lương chi tiết */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["Mã NV", "Họ tên", "Phòng ban", "Lương CB", "Phụ cấp", "Tăng ca", "Bảo hiểm", "Thuế TNCN", "Tạm ứng", "Thực nhận"].map((h) => (
                    <th key={h} style={{ padding: "12px 14px", textAlign: h === "Mã NV" || h === "Họ tên" || h === "Phòng ban" ? "left" : "right", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                      {st === "draft" ? 'Chưa tính lương. Bấm "Tính lương" để sinh bảng lương.' : "Không có dữ liệu"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const insurance = num(r.social_insurance) + num(r.health_insurance) + num(r.unemployment_insurance);
                    return (
                      <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 500, color: "#2563eb", whiteSpace: "nowrap" }}>{r.code}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 500, color: "#111827", whiteSpace: "nowrap" }}>{r.full_name}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{r.department_name || "—"}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: "#374151", textAlign: "right", whiteSpace: "nowrap" }}>{formatCurrency(r.base_salary)}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: "#16a34a", textAlign: "right", whiteSpace: "nowrap" }}>{formatCurrency(sumAllowances(r.allowances))}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: "#0891b2", textAlign: "right", whiteSpace: "nowrap" }}>{formatCurrency(r.ot_amount)}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: "#dc2626", textAlign: "right", whiteSpace: "nowrap" }}>{formatCurrency(insurance)}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: "#dc2626", textAlign: "right", whiteSpace: "nowrap" }}>{formatCurrency(r.personal_income_tax)}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: "#dc2626", textAlign: "right", whiteSpace: "nowrap" }}>{formatCurrency(r.advance_deducted)}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#111827", textAlign: "right", whiteSpace: "nowrap" }}>{formatCurrency(r.net_salary)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
