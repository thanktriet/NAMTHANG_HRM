"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalEmployees: number;
  totalCandidates: number;
  activeDrivers: number;
  contractsExpiring: number;
}

interface MissingDocEmployee {
  id: string;
  code: string;
  full_name: string;
  department_name: string;
  missing_docs: string[];
}

const DOC_LABELS: Record<string, string> = {
  cccd: "CCCD",
  so_yeu_ly_lich: "Sơ yếu lý lịch",
  giay_kham_suc_khoe: "Giấy khám sức khỏe",
  bang_lai: "Bằng lái xe",
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("namthang_hrm_token");
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missingDocs, setMissingDocs] = useState<MissingDocEmployee[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:4000/api/v1/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`Lỗi ${res.status}: Không thể tải dữ liệu`);
        }

        const data = await res.json();
        setStats(data.data);
      } catch (err: any) {
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    const fetchMissingDocs = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await fetch("http://localhost:4000/api/v1/employees/documents/missing", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setMissingDocs(data.items || []);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách hồ sơ thiếu:", err);
      }
    };

    fetchStats();
    fetchMissingDocs();
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
          <p style={{ color: "#6b7280", fontSize: 14 }}>Đang tải dữ liệu...</p>
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
    { label: "Tổng nhân sự", value: stats?.totalEmployees ?? 0, color: "#2563eb", bg: "#eff6ff", icon: "👥" },
    { label: "Ứng viên", value: stats?.totalCandidates ?? 0, color: "#9333ea", bg: "#faf5ff", icon: "📋" },
    { label: "Tài xế hoạt động", value: stats?.activeDrivers ?? 0, color: "#16a34a", bg: "#f0fdf4", icon: "✅" },
    { label: "HĐ sắp hết hạn", value: stats?.contractsExpiring ?? 0, color: "#ea580c", bg: "#fff7ed", icon: "⚠️" },
  ];

  const quickLinks = [
    { label: "Nhân sự", href: "/nhan-su", icon: "👤" },
    { label: "Tuyển dụng", href: "/tuyen-dung", icon: "📝" },
    { label: "Chấm công", href: "/cham-cong", icon: "⏰" },
    { label: "Tiền lương", href: "/tien-luong", icon: "💰" },
    { label: "Hợp đồng", href: "/hop-dong", icon: "📄" },
    { label: "Tài xế", href: "/tai-xe", icon: "🚗" },
    { label: "Tài sản", href: "/tai-san", icon: "🏢" },
    { label: "KPI", href: "/kpi", icon: "📊" },
    { label: "Báo cáo", href: "/bao-cao", icon: "📈" },
    { label: "Biểu mẫu", href: "/bieu-mau", icon: "📋" },
  ];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
        Tổng quan
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

      {/* Missing Documents Warning */}
      {missingDocs.length > 0 && (
        <div
          style={{
            background: "#fffbeb",
            borderRadius: 12,
            border: "1px solid #fde68a",
            padding: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 22 }}>⚠️</span>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#92400e", margin: 0 }}>
              {missingDocs.length} nhân viên chưa đủ hồ sơ
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {missingDocs.map((emp) => (
              <div
                key={emp.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: 8,
                  background: "#fff",
                  border: "1px solid #fde68a",
                }}
              >
                <div>
                  <div
                    style={{ fontWeight: 600, fontSize: 14, color: "#111827", cursor: "pointer" }}
                    onClick={() => router.push(`/nhan-su/${emp.id}`)}
                  >
                    {emp.full_name} ({emp.code})
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    {emp.department_name || "Chưa có phòng ban"}
                  </div>
                  <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>
                    Thiếu: {emp.missing_docs.map((d) => DOC_LABELS[d] || d).join(", ")}
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/nhan-su/${emp.id}`)}
                  style={{
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 500,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    color: "#374151",
                    cursor: "pointer",
                  }}
                >
                  Xem chi tiết
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
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
          Truy cập nhanh
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {quickLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => router.push(link.href)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "16px 8px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#eff6ff";
                e.currentTarget.style.borderColor = "#bfdbfe";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              <span style={{ fontSize: 24 }}>{link.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{link.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
