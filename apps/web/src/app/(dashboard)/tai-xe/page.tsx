"use client";

import { useState, useEffect } from "react";

interface Driver {
  id: string;
  code: string;
  full_name: string;
  license_class: string;
  license_number: string;
  expiry_date: string;
  license_status: string;
  plate_number: string;
  vehicle_type: string;
  status: string;
  phone?: string;
}

interface License {
  id: string;
  driverName: string;
  licenseNumber: string;
  licenseClass: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

interface Dispatch {
  id: string;
  driverName: string;
  vehiclePlate: string;
  route: string;
  startDate: string;
  endDate?: string;
  status: string;
}

interface DriverStats {
  total: number;
  active: number;
  onLeave: number;
  licenseExpiring: number;
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

const driverStatusColors: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: "#dcfce7", color: "#16a34a", label: "Đang hoạt động" },
  on_leave: { bg: "#fef3c7", color: "#d97706", label: "Nghỉ phép" },
  inactive: { bg: "#f3f4f6", color: "#6b7280", label: "Ngưng hoạt động" },
  suspended: { bg: "#fee2e2", color: "#dc2626", label: "Đình chỉ" },
};

const licenseStatusColors: Record<string, { bg: string; color: string; label: string }> = {
  valid: { bg: "#dcfce7", color: "#16a34a", label: "Còn hạn" },
  expiring: { bg: "#fef3c7", color: "#d97706", label: "Sắp hết hạn" },
  expired: { bg: "#fee2e2", color: "#dc2626", label: "Hết hạn" },
};

const dispatchStatusColors: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: "#dcfce7", color: "#16a34a", label: "Đang thực hiện" },
  completed: { bg: "#e0e7ff", color: "#4f46e5", label: "Hoàn thành" },
  pending: { bg: "#fef3c7", color: "#d97706", label: "Chờ xử lý" },
  cancelled: { bg: "#fee2e2", color: "#dc2626", label: "Đã hủy" },
};

export default function TaiXePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [stats, setStats] = useState<DriverStats | null>(null);
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

        const [driversRes, licensesRes, dispatchRes, statsRes] = await Promise.all([
          fetch("http://localhost:4000/api/v1/drivers", { headers }),
          fetch("http://localhost:4000/api/v1/drivers/licenses/expiring", { headers }),
          fetch("http://localhost:4000/api/v1/drivers/dispatch", { headers }),
          fetch("http://localhost:4000/api/v1/drivers/stats", { headers }),
        ]);

        if (!driversRes.ok) {
          throw new Error(`Lỗi ${driversRes.status}: Không thể tải dữ liệu tài xế`);
        }

        const driversData = await driversRes.json();
        setDrivers(driversData.data?.items || driversData.data || []);

        if (licensesRes.ok) {
          const licensesData = await licensesRes.json();
          setLicenses(licensesData.data || licensesData || []);
        }

        if (dispatchRes.ok) {
          const dispatchData = await dispatchRes.json();
          setDispatches(dispatchData.data || dispatchData || []);
        }

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
          <p style={{ color: "#6b7280", fontSize: 14 }}>Đang tải dữ liệu tài xế...</p>
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
    { label: "Tổng tài xế", value: stats?.total ?? drivers.length, color: "#2563eb", bg: "#eff6ff", icon: "🚗" },
    { label: "Đang hoạt động", value: stats?.active ?? 0, color: "#16a34a", bg: "#f0fdf4", icon: "✅" },
    { label: "Nghỉ phép", value: stats?.onLeave ?? 0, color: "#d97706", bg: "#fffbeb", icon: "📋" },
    { label: "GPLX sắp hết hạn", value: stats?.licenseExpiring ?? licenses.length, color: "#dc2626", bg: "#fef2f2", icon: "⚠️" },
  ];

  const tabs = [
    { label: "Danh sách", icon: "👤" },
    { label: "GPLX", icon: "🪪" },
    { label: "Điều động", icon: "🚛" },
  ];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
        Quản lý tài xế
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

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e5e7eb", paddingBottom: 0 }}>
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: activeTab === idx ? 600 : 400,
              color: activeTab === idx ? "#2563eb" : "#6b7280",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === idx ? "2px solid #2563eb" : "2px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Driver List */}
      {activeTab === 0 && (
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
                {["Mã NV", "Họ tên", "Hạng GPLX", "Hết hạn GPLX", "Biển số xe", "Trạng thái"].map((h) => (
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
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                    Không có dữ liệu tài xế
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => {
                  const st = driverStatusColors[driver.status] || { bg: "#f3f4f6", color: "#6b7280", label: driver.status };
                  return (
                    <tr key={driver.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#2563eb" }}>
                        {driver.code}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#111827" }}>
                        {driver.full_name}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                        {driver.license_class}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                        {formatDate(driver.expiry_date)}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                        {driver.plate_number}
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
      )}

      {/* Tab 2: Licenses */}
      {activeTab === 1 && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          {licenses.length > 0 && (
            <div style={{ padding: "16px 20px", background: "#fffbeb", borderBottom: "1px solid #fef3c7" }}>
              <p style={{ margin: 0, fontSize: 13, color: "#92400e", fontWeight: 500 }}>
                ⚠️ Có {licenses.length} GPLX sắp hết hạn hoặc đã hết hạn cần xử lý
              </p>
            </div>
          )}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Tài xế", "Số GPLX", "Hạng", "Ngày cấp", "Ngày hết hạn", "Trạng thái"].map((h) => (
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
              {licenses.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                    Không có GPLX sắp hết hạn
                  </td>
                </tr>
              ) : (
                licenses.map((lic) => {
                  const st = licenseStatusColors[lic.status] || { bg: "#f3f4f6", color: "#6b7280", label: lic.status };
                  return (
                    <tr key={lic.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#111827" }}>
                        {lic.driverName}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                        {lic.licenseNumber}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                        {lic.licenseClass}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                        {formatDate(lic.issueDate)}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                        {formatDate(lic.expiryDate)}
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
      )}

      {/* Tab 3: Dispatch */}
      {activeTab === 2 && (
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
                {["Tài xế", "Biển số xe", "Tuyến đường", "Ngày bắt đầu", "Ngày kết thúc", "Trạng thái"].map((h) => (
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
              {dispatches.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                    Không có dữ liệu điều động
                  </td>
                </tr>
              ) : (
                dispatches.map((d) => {
                  const st = dispatchStatusColors[d.status] || { bg: "#f3f4f6", color: "#6b7280", label: d.status };
                  return (
                    <tr key={d.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#111827" }}>
                        {d.driverName}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151", fontWeight: 500 }}>
                        {d.vehiclePlate}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                        {d.route}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                        {formatDate(d.startDate)}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                        {formatDate(d.endDate || "")}
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
      )}
    </div>
  );
}
