"use client";

import { useState, useEffect } from "react";

interface Asset {
  id: string;
  code: string;
  name: string;
  category: string;
  assigned_to?: string;
  handover_date?: string;
  status: string;
  value?: number;
}

interface AssetStats {
  total: number;
  inUse: number;
  maintenance: number;
  liquidated: number;
  available: number;
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

function formatCurrency(amount: number): string {
  if (!amount && amount !== 0) return "—";
  return amount.toLocaleString("vi-VN") + " ₫";
}

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  in_use: { bg: "#dcfce7", color: "#16a34a", label: "Đang sử dụng" },
  available: { bg: "#e0e7ff", color: "#4f46e5", label: "Sẵn sàng" },
  maintenance: { bg: "#fef3c7", color: "#d97706", label: "Bảo trì" },
  liquidated: { bg: "#fee2e2", color: "#dc2626", label: "Thanh lý" },
  broken: { bg: "#f3f4f6", color: "#6b7280", label: "Hỏng" },
};

export default function TaiSanPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

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

        const [assetsRes, statsRes] = await Promise.all([
          fetch("http://localhost:4000/api/v1/assets", { headers }),
          fetch("http://localhost:4000/api/v1/assets/stats", { headers }),
        ]);

        if (!assetsRes.ok) {
          throw new Error(`Lỗi ${assetsRes.status}: Không thể tải dữ liệu tài sản`);
        }

        const assetsData = await assetsRes.json();
        setAssets(assetsData.data?.items || assetsData.data || []);

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

  const categories = [...new Set(assets.map((a) => a.category).filter(Boolean))];

  const filtered = assets.filter((a) => {
    const matchSearch =
      !search ||
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.code?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filterCategory || a.category === filterCategory;
    const matchStatus = !filterStatus || a.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
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
          <p style={{ color: "#6b7280", fontSize: 14 }}>Đang tải dữ liệu tài sản...</p>
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
    { label: "Tổng tài sản", value: stats?.total ?? assets.length, color: "#2563eb", bg: "#eff6ff", icon: "🏢" },
    { label: "Đang sử dụng", value: stats?.inUse ?? 0, color: "#16a34a", bg: "#f0fdf4", icon: "✅" },
    { label: "Bảo trì", value: stats?.maintenance ?? 0, color: "#d97706", bg: "#fffbeb", icon: "🔧" },
    { label: "Thanh lý", value: stats?.liquidated ?? 0, color: "#dc2626", bg: "#fef2f2", icon: "🗑️" },
  ];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
        Quản lý tài sản
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

      {/* Category Summary */}
      {categories.length > 0 && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            padding: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: "0 0 12px" }}>Theo danh mục</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {categories.map((cat) => {
              const count = assets.filter((a) => a.category === cat).length;
              return (
                <div
                  key={cat}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    fontSize: 13,
                  }}
                >
                  <span style={{ fontWeight: 500, color: "#374151" }}>{cat}</span>
                  <span style={{ marginLeft: 8, color: "#2563eb", fontWeight: 600 }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          padding: 16,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <input
          type="text"
          placeholder="Tìm theo tên hoặc mã tài sản..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 200,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: 13,
            outline: "none",
          }}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13 }}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13 }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="in_use">Đang sử dụng</option>
          <option value="available">Sẵn sàng</option>
          <option value="maintenance">Bảo trì</option>
          <option value="liquidated">Thanh lý</option>
        </select>
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
              {["Mã TS", "Tên tài sản", "Danh mục", "Người sử dụng", "Ngày bàn giao", "Giá trị", "Trạng thái"].map((h) => (
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
                  Không có dữ liệu tài sản
                </td>
              </tr>
            ) : (
              filtered.map((asset) => {
                const st = statusColors[asset.status] || { bg: "#f3f4f6", color: "#6b7280", label: asset.status };
                return (
                  <tr key={asset.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#2563eb" }}>
                      {asset.code}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#111827" }}>
                      {asset.name}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                      {asset.category}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                      {asset.assigned_to || "—"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                      {formatDate(asset.handover_date || "")}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                      {asset.value ? formatCurrency(asset.value) : "—"}
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
