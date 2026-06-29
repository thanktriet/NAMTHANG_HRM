"use client";

import { useState, useEffect } from "react";

interface AttendanceRecord {
  id: string;
  employee_code: string;
  full_name: string;
  date: string;
  check_in: string;
  check_out: string;
  check_in_method: string;
  status: string;
  ot_hours: number;
}

interface AttendanceStats {
  totalRecords: number;
  onTime: number;
  late: number;
  earlyLeave: number;
  absent: number;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("namthang_hrm_token");
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  on_time: { bg: "#dcfce7", color: "#16a34a", label: "Đúng giờ" },
  late: { bg: "#fef3c7", color: "#d97706", label: "Đi trễ" },
  early_leave: { bg: "#fed7aa", color: "#ea580c", label: "Về sớm" },
  absent: { bg: "#fee2e2", color: "#dc2626", label: "Vắng mặt" },
  overtime: { bg: "#e0e7ff", color: "#4f46e5", label: "Tăng ca" },
};

const methodLabels: Record<string, string> = {
  fingerprint: "Vân tay",
  face: "Khuôn mặt",
  card: "Thẻ từ",
  manual: "Thủ công",
  qr: "QR Code",
};

export default function ChamCongPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
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

        const [recordsRes, statsRes] = await Promise.all([
          fetch("http://localhost:4000/api/v1/attendance", { headers }),
          fetch("http://localhost:4000/api/v1/attendance/stats", { headers }),
        ]);

        if (!recordsRes.ok) {
          throw new Error(`Lỗi ${recordsRes.status}: Không thể tải dữ liệu chấm công`);
        }

        const recordsData = await recordsRes.json();
        setRecords(recordsData.data?.items || []);

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
      r.employee_code?.toLowerCase().includes(search.toLowerCase())
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
          <p style={{ color: "#6b7280", fontSize: 14 }}>Đang tải dữ liệu chấm công...</p>
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
    { label: "Tổng bản ghi", value: stats?.totalRecords ?? records.length, color: "#2563eb", bg: "#eff6ff", icon: "📊" },
    { label: "Đúng giờ", value: stats?.onTime ?? 0, color: "#16a34a", bg: "#f0fdf4", icon: "✅" },
    { label: "Đi trễ", value: stats?.late ?? 0, color: "#d97706", bg: "#fffbeb", icon: "⏰" },
    { label: "Vắng mặt", value: stats?.absent ?? 0, color: "#dc2626", bg: "#fef2f2", icon: "❌" },
  ];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
        Chấm công
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
              {["Mã NV", "Họ tên", "Ngày", "Check-in", "Check-out", "Phương thức", "Trạng thái"].map((h) => (
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
                  Không có dữ liệu chấm công
                </td>
              </tr>
            ) : (
              filtered.map((record) => {
                const st = statusColors[record.status] || { bg: "#f3f4f6", color: "#6b7280", label: record.status };
                return (
                  <tr
                    key={record.id}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#2563eb" }}>
                      {record.employee_code}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#111827" }}>
                      {record.full_name}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                      {formatDate(record.date)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                      {record.check_in || "—"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                      {record.check_out || "—"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                      {methodLabels[record.check_in_method] || record.check_in_method || "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 500,
                          background: st.bg,
                          color: st.color,
                        }}
                      >
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
