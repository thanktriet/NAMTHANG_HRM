"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Employee {
  id: string;
  code: string;
  full_name: string;
  department_name: string;
  position_name: string;
  organization_name: string;
  status: string;
  phone?: string;
  email?: string;
  hire_date?: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("namthang_hrm_token");
}

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: "#dcfce7", color: "#16a34a", label: "Đang làm việc" },
  probation: { bg: "#fef3c7", color: "#d97706", label: "Thử việc" },
  resigned: { bg: "#fee2e2", color: "#dc2626", label: "Đã nghỉ" },
  maternity: { bg: "#e0e7ff", color: "#4f46e5", label: "Nghỉ thai sản" },
};

export default function NhanSuPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
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

        const res = await fetch("/api-proxy/api/v1/employees", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`Lỗi ${res.status}: Không thể tải danh sách nhân sự`);
        }

        const data = await res.json();
        setEmployees(data.data.items || []);
      } catch (err: any) {
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = employees.filter((emp) => {
    const matchSearch =
      !search ||
      emp.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.code?.toLowerCase().includes(search.toLowerCase());
    const matchDept = !filterDept || emp.department_name === filterDept;
    const matchBranch = !filterBranch || emp.organization_name === filterBranch;
    const matchStatus = !filterStatus || emp.status === filterStatus;
    return matchSearch && matchDept && matchBranch && matchStatus;
  });

  const departments = [...new Set(employees.map((e) => e.department_name).filter(Boolean))];
  const branches = [...new Set(employees.map((e) => e.organization_name).filter(Boolean))];

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
          <p style={{ color: "#6b7280", fontSize: 14 }}>Đang tải danh sách nhân sự...</p>
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

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
          Quản lý nhân sự
        </h1>
        <span style={{ fontSize: 13, color: "#6b7280" }}>Tổng: {employees.length} nhân viên</span>
      </div>

      {/* Filter Bar */}
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
          placeholder="Tìm theo tên hoặc mã NV..."
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
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13 }}
        >
          <option value="">Tất cả phòng ban</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={filterBranch}
          onChange={(e) => setFilterBranch(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13 }}
        >
          <option value="">Tất cả chi nhánh</option>
          {branches.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13 }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang làm việc</option>
          <option value="probation">Thử việc</option>
          <option value="resigned">Đã nghỉ</option>
          <option value="maternity">Nghỉ thai sản</option>
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
              {["Mã NV", "Họ tên", "Phòng ban", "Chức vụ", "Chi nhánh", "Trạng thái"].map((h) => (
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
                <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                  Không tìm thấy nhân viên nào
                </td>
              </tr>
            ) : (
              filtered.map((emp) => {
                const st = statusColors[emp.status] || { bg: "#f3f4f6", color: "#6b7280", label: emp.status };
                return (
                  <tr
                    key={emp.id}
                    onClick={() => router.push(`/nhan-su/${emp.id}`)}
                    style={{ cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#2563eb" }}>
                      {emp.code}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#111827" }}>
                      {emp.full_name}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{emp.department_name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{emp.position_name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{emp.organization_name}</td>
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
