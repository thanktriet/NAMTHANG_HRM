"use client";

import { useState, useEffect } from "react";

interface DashboardStats {
  totalEmployees: number;
  totalCandidates: number;
  activeDrivers: number;
  contractsExpiring: number;
}

interface EmployeeStats {
  total: number;
  active: number;
  probation: number;
  resigned: number;
  byDepartment?: { department_name: string; count: string }[];
}

interface CandidateStats {
  total: number;
  new: number;
  screening: number;
  interview: number;
  evaluation: number;
  offer: number;
  hired: number;
  rejected: number;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("namthang_hrm_token");
}

export default function BaoCaoPage() {
  const [dashStats, setDashStats] = useState<DashboardStats | null>(null);
  const [empStats, setEmpStats] = useState<EmployeeStats | null>(null);
  const [candStats, setCandStats] = useState<CandidateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const [dashRes, empRes, candRes] = await Promise.all([
          fetch("/api-proxy/api/v1/dashboard/stats", { headers }),
          fetch("/api-proxy/api/v1/employees/stats", { headers }),
          fetch("/api-proxy/api/v1/candidates/stats", { headers }),
        ]);

        if (dashRes.ok) {
          const data = await dashRes.json();
          setDashStats(data.data?.items || data.data || data);
        }

        if (empRes.ok) {
          const data = await empRes.json();
          setEmpStats(data.data?.items || data.data || data);
        }

        if (candRes.ok) {
          const data = await candRes.json();
          setCandStats(data.data?.items || data.data || data);
        }
      } catch (err: any) {
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <p style={{ color: "#6b7280", fontSize: 14 }}>Đang tải báo cáo...</p>
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

  const summaryCards = [
    { label: "Tổng nhân sự", value: dashStats?.totalEmployees ?? empStats?.total ?? 0, color: "#2563eb", bg: "#eff6ff", icon: "👥" },
    { label: "Đang làm việc", value: empStats?.active ?? 0, color: "#16a34a", bg: "#f0fdf4", icon: "✅" },
    { label: "Ứng viên", value: candStats?.total ?? dashStats?.totalCandidates ?? 0, color: "#9333ea", bg: "#faf5ff", icon: "📋" },
    { label: "HĐ sắp hết hạn", value: dashStats?.contractsExpiring ?? 0, color: "#ea580c", bg: "#fff7ed", icon: "⚠️" },
  ];

  const employeeBreakdown = [
    { label: "Đang làm việc", value: empStats?.active ?? 0, color: "#16a34a" },
    { label: "Thử việc", value: empStats?.probation ?? 0, color: "#d97706" },
    { label: "Đã nghỉ", value: empStats?.resigned ?? 0, color: "#dc2626" },
  ];

  const recruitmentPipeline = [
    { label: "Ứng viên mới", value: candStats?.new ?? 0, color: "#2563eb" },
    { label: "Sàng lọc", value: candStats?.screening ?? 0, color: "#7c3aed" },
    { label: "Phỏng vấn", value: candStats?.interview ?? 0, color: "#d97706" },
    { label: "Đề xuất", value: candStats?.offer ?? 0, color: "#0891b2" },
    { label: "Đã tuyển", value: candStats?.hired ?? 0, color: "#16a34a" },
    { label: "Từ chối", value: candStats?.rejected ?? 0, color: "#dc2626" },
  ];

  const departmentData = (empStats?.byDepartment || []).map((row) => ({
    dept: row.department_name || "Chưa có phòng ban",
    count: row.count,
  }));

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
        Báo cáo tổng hợp
      </h1>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {summaryCards.map((card, idx) => (
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
                <div style={{ fontSize: 22, fontWeight: 700, color: card.color }}>{card.value}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{card.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Employee Breakdown */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          padding: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginTop: 0, marginBottom: 16 }}>
          Phân bổ nhân sự theo trạng thái
        </h2>
        <div style={{ display: "flex", gap: 24 }}>
          {employeeBreakdown.map((item, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.color }} />
              <span style={{ fontSize: 13, color: "#374151" }}>{item.label}:</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recruitment Pipeline */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          padding: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginTop: 0, marginBottom: 16 }}>
          Quy trình tuyển dụng
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>
                Giai đoạn
              </th>
              <th style={{ padding: "10px 16px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>
                Số lượng
              </th>
            </tr>
          </thead>
          <tbody>
            {recruitmentPipeline.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 16px", fontSize: 13, color: "#374151" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                    {item.label}
                  </div>
                </td>
                <td style={{ padding: "10px 16px", fontSize: 14, fontWeight: 600, color: item.color, textAlign: "right" }}>
                  {item.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Department Distribution */}
      {departmentData.length > 0 && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            padding: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginTop: 0, marginBottom: 16 }}>
            Nhân sự theo phòng ban
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>
                  Phòng ban
                </th>
                <th style={{ padding: "10px 16px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>
                  Số nhân viên
                </th>
              </tr>
            </thead>
            <tbody>
              {departmentData.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 16px", fontSize: 13, color: "#374151" }}>{item.dept}</td>
                  <td style={{ padding: "10px 16px", fontSize: 14, fontWeight: 600, color: "#2563eb", textAlign: "right" }}>
                    {item.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
