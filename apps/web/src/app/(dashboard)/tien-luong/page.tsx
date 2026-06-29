"use client";

import { useState, useEffect } from "react";

interface PayrollRecord {
  id: string;
  code: string;
  full_name: string;
  department_name: string;
  base_salary: number;
  allowance?: number;
  deduction?: number;
  netSalary?: number;
  status?: string;
}

interface PayrollStats {
  totalFund: number;
  totalBaseSalary: number;
  totalAllowance: number;
  totalDeduction: number;
  employeeCount: number;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("namthang_hrm_token");
}

function formatCurrency(amount: number): string {
  if (!amount && amount !== 0) return "—";
  return amount.toLocaleString("vi-VN") + " ₫";
}

export default function TienLuongPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [stats, setStats] = useState<PayrollStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const [payrollRes, statsRes] = await Promise.all([
          fetch("http://localhost:4000/api/v1/payroll", { headers }),
          fetch("http://localhost:4000/api/v1/payroll/stats", { headers }),
        ]);

        if (!payrollRes.ok) {
          throw new Error(`Lỗi ${payrollRes.status}: Không thể tải dữ liệu tiền lương`);
        }

        const payrollData = await payrollRes.json();
        setRecords(payrollData.data?.items || []);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data || statsData);
        }
      } catch (err: any) {
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <div
            style={{
              width: 40,
              height: 40,
              border: "4px solid #e5e7eb",
              borderTopColor: "#2563eb",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ color: "#6b7280", fontSize: 14 }}>Đang tải dữ liệu tiền lương...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 12,
            padding: 20,
            color: "#dc2626",
            textAlign: "center",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Lỗi</p>
          <p style={{ fontSize: 14 }}>{error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Tổng quỹ lương", value: formatCurrency(stats?.totalFund ?? 0), color: "#2563eb", bg: "#eff6ff", icon: "💰" },
    { label: "Lương cơ bản", value: formatCurrency(stats?.totalBaseSalary ?? 0), color: "#16a34a", bg: "#f0fdf4", icon: "📋" },
    { label: "Phụ cấp", value: formatCurrency(stats?.totalAllowance ?? 0), color: "#9333ea", bg: "#faf5ff", icon: "➕" },
    { label: "Khấu trừ", value: formatCurrency(stats?.totalDeduction ?? 0), color: "#dc2626", bg: "#fef2f2", icon: "➖" },
  ];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
        Quản lý tiền lương
      </h1>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {statCards.map((card, idx) => (
          <div
            key={idx}
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: 20,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: card.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: card.color }}>{card.value}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{card.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          padding: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <input
          type="text"
          placeholder="Tìm theo tên hoặc mã NV..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 300,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: 13,
            outline: "none",
          }}
        />
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Mã NV", "Họ tên", "Phòng ban", "Lương CB", "Phụ cấp", "Khấu trừ", "Thực nhận"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                  Không có dữ liệu tiền lương
                </td>
              </tr>
            ) : (
              filtered.map((record) => (
                <tr key={record.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#2563eb" }}>
                    {record.code}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#111827" }}>
                    {record.full_name}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                    {record.department_name}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151", fontWeight: 500 }}>
                    {formatCurrency(record.base_salary)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#16a34a" }}>
                    {formatCurrency(record.allowance ?? 0)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#dc2626" }}>
                    {formatCurrency(record.deduction ?? 0)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#111827" }}>
                    {formatCurrency(record.netSalary ?? (record.base_salary + (record.allowance ?? 0) - (record.deduction ?? 0)))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
