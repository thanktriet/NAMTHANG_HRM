"use client";

import { useState, useEffect } from "react";

interface KpiEvaluation {
  id: string;
  employee_code: string;
  full_name: string;
  department_name: string;
  period: string;
  score: number | string;
  grade: string;
  evaluator?: string;
  evaluatedAt?: string;
}

interface KpiStats {
  // Backend (kpi/stats) trả về các field snake_case dưới đây.
  total_evaluations?: number | string;
  average_score?: number | string;
  excellent_count?: number | string;
  good_count?: number | string;
  needs_improvement_count?: number | string;
  // Các field dưới đây backend hiện không trả về → hiển thị "—".
  currentPeriod?: string;
  pendingEvaluation?: number;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("namthang_hrm_token");
}

const gradeColors: Record<string, { bg: string; color: string; label: string }> = {
  excellent: { bg: "#dcfce7", color: "#16a34a", label: "Xuất sắc" },
  good: { bg: "#dbeafe", color: "#2563eb", label: "Tốt" },
  average: { bg: "#fef3c7", color: "#d97706", label: "Đạt" },
  below_average: { bg: "#fee2e2", color: "#dc2626", label: "Chưa đạt" },
  A: { bg: "#dcfce7", color: "#16a34a", label: "Xuất sắc" },
  B: { bg: "#dbeafe", color: "#2563eb", label: "Tốt" },
  C: { bg: "#fef3c7", color: "#d97706", label: "Đạt" },
  D: { bg: "#fee2e2", color: "#dc2626", label: "Chưa đạt" },
};

export default function KpiPage() {
  const [evaluations, setEvaluations] = useState<KpiEvaluation[]>([]);
  const [stats, setStats] = useState<KpiStats | null>(null);
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

        const [evalRes, statsRes] = await Promise.all([
          fetch("/api-proxy/api/v1/kpi/evaluations", { headers }),
          fetch("/api-proxy/api/v1/kpi/stats", { headers }),
        ]);

        if (!evalRes.ok) {
          throw new Error(`Lỗi ${evalRes.status}: Không thể tải dữ liệu KPI`);
        }

        const evalData = await evalRes.json();
        setEvaluations(evalData.data?.items || evalData.data || []);

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
          <p style={{ color: "#6b7280", fontSize: 14 }}>Đang tải dữ liệu KPI...</p>
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

  const avgScoreNum = stats?.average_score != null ? Number(stats.average_score) : null;
  const statCards = [
    { label: "Kỳ đánh giá", value: stats?.currentPeriod ?? "—", color: "#2563eb", bg: "#eff6ff", icon: "📅" },
    { label: "Đã đánh giá", value: stats?.total_evaluations ?? evaluations.length, color: "#16a34a", bg: "#f0fdf4", icon: "✅" },
    { label: "Chưa đánh giá", value: stats?.pendingEvaluation ?? "—", color: "#d97706", bg: "#fffbeb", icon: "⏳" },
    { label: "Điểm trung bình", value: avgScoreNum != null && !isNaN(avgScoreNum) ? avgScoreNum.toFixed(1) : "—", color: "#9333ea", bg: "#faf5ff", icon: "📊" },
  ];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
        Đánh giá KPI
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
                <div style={{ fontSize: 22, fontWeight: 700, color: card.color }}>{card.value}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{card.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Evaluations Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        {evaluations.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📋</p>
            <p style={{ fontSize: 16, fontWeight: 500, color: "#374151", marginBottom: 4 }}>
              Chưa có dữ liệu đánh giá
            </p>
            <p style={{ fontSize: 13, color: "#9ca3af" }}>
              Dữ liệu đánh giá KPI sẽ hiển thị tại đây khi có kết quả
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Mã NV", "Họ tên", "Phòng ban", "Kỳ đánh giá", "Điểm", "Xếp loại"].map((h) => (
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
              {evaluations.map((ev) => {
                const gr = gradeColors[ev.grade] || { bg: "#f3f4f6", color: "#6b7280", label: ev.grade };
                return (
                  <tr key={ev.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#2563eb" }}>
                      {ev.employee_code}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#111827" }}>
                      {ev.full_name}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                      {ev.department_name}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                      {ev.period}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#111827" }}>
                      {ev.score}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 500,
                          background: gr.bg,
                          color: gr.color,
                        }}
                      >
                        {gr.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
