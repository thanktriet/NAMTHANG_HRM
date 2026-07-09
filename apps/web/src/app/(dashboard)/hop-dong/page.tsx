"use client";
import React, { useState, useEffect } from "react";

interface Contract {
  id: string;
  code: string;
  employee_id: string;
  employee_name: string;
  employee_code?: string;
  contract_type: "probation" | "fixed_term" | "indefinite";
  start_date: string;
  end_date: string | null;
  base_salary: number | string;
  status: string;
  file_path?: string | null;
  file_name?: string | null;
  created_at?: string;
  note?: string;
}

interface Employee {
  id: string;
  full_name: string;
  code?: string;
  employee_code?: string;
}

interface ContractStats {
  total: number;
  active: number;
  expiring: number;
  expired: number;
}

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  probation: "Thử việc",
  fixed_term: "Xác định thời hạn",
  indefinite: "Không xác định thời hạn",
  service: "Hợp đồng dịch vụ",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Hiệu lực",
  expiring: "Sắp hết hạn",
  expiring_soon: "Sắp hết hạn",
  expired: "Hết hạn",
  terminated: "Đã thanh lý",
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatCurrency(amount: number | string | null | undefined): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString("vi-VN") + " ₫";
}

function daysUntil(dateStr: string | null | undefined): number {
  if (!dateStr) return Infinity;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return Infinity;
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function HopDongPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<ContractStats>({ total: 0, active: 0, expiring: 0, expired: 0 });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [createForm, setCreateForm] = useState({
    employee_id: "",
    contract_type: "probation",
    start_date: "",
    end_date: "",
    salary: "",
    file: null as File | null,
  });
  const [renewForm, setRenewForm] = useState({ new_end_date: "", new_salary: "" });

  const API_BASE = "/api-proxy/api/v1";

  function getToken(): string {
    return localStorage.getItem("namthang_hrm_token") || "";
  }

  function getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    };
  }

  async function fetchContracts() {
    try {
      const res = await fetch(`${API_BASE}/contracts`, { headers: getHeaders() });
      const data = await res.json();
      setContracts(data.data?.items || data.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách hợp đồng:", err);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE}/contracts/stats`, { headers: getHeaders() });
      const data = await res.json();
      setStats(data.data || data);
    } catch (err) {
      console.error("Lỗi tải thống kê:", err);
    }
  }

  async function fetchEmployees() {
    try {
      const res = await fetch(`${API_BASE}/employees`, { headers: getHeaders() });
      const data = await res.json();
      setEmployees(data.data || data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách nhân viên:", err);
    }
  }

  async function refreshData() {
    await Promise.all([fetchContracts(), fetchStats()]);
  }

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchContracts(), fetchStats(), fetchEmployees()]);
      setLoading(false);
    }
    init();
  }, []);

  async function handleCreate() {
    try {
      const formData = new FormData();
      formData.append("employee_id", createForm.employee_id);
      formData.append("contract_type", createForm.contract_type);
      formData.append("start_date", createForm.start_date);
      formData.append("end_date", createForm.end_date);
      formData.append("salary", createForm.salary);
      if (createForm.file) {
        formData.append("file", createForm.file);
      }
      await fetch(`${API_BASE}/contracts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      setShowCreateModal(false);
      setCreateForm({ employee_id: "", contract_type: "probation", start_date: "", end_date: "", salary: "", file: null });
      await refreshData();
    } catch (err) {
      console.error("Lỗi tạo hợp đồng:", err);
    }
  }

  async function handleRenew() {
    if (!selectedContract) return;
    try {
      const body: Record<string, string> = { new_end_date: renewForm.new_end_date };
      if (renewForm.new_salary) body.new_salary = renewForm.new_salary;
      await fetch(`${API_BASE}/contracts/${selectedContract.id}/renew`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      setShowRenewModal(false);
      setRenewForm({ new_end_date: "", new_salary: "" });
      await refreshData();
    } catch (err) {
      console.error("Lỗi gia hạn hợp đồng:", err);
    }
  }

  async function handleTerminate(contract: Contract) {
    if (!window.confirm(`Bạn có chắc muốn thanh lý hợp đồng ${contract.code}?`)) return;
    try {
      await fetch(`${API_BASE}/contracts/${contract.id}/terminate`, {
        method: "PATCH",
        headers: getHeaders(),
      });
      await refreshData();
    } catch (err) {
      console.error("Lỗi thanh lý hợp đồng:", err);
    }
  }

  const filteredContracts = contracts.filter((c) => {
    const matchSearch =
      !searchTerm ||
      c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.employee_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = !filterType || c.contract_type === filterType;
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const expiringContracts = contracts.filter((c) => {
    const days = daysUntil(c.end_date);
    return days > 0 && days <= 30 && c.status !== "terminated";
  });

  function getStatusBadgeStyle(status: string): React.CSSProperties {
    const base: React.CSSProperties = {
      padding: "4px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: 600,
      display: "inline-block",
    };
    switch (status) {
      case "active":
        return { ...base, backgroundColor: "#d4edda", color: "#155724" };
      case "expiring":
      case "expiring_soon":
        return { ...base, backgroundColor: "#fff3cd", color: "#856404" };
      case "expired":
        return { ...base, backgroundColor: "#f8d7da", color: "#721c24" };
      case "terminated":
        return { ...base, backgroundColor: "#e2e3e5", color: "#383d41" };
      default:
        return { ...base, backgroundColor: "#e2e3e5", color: "#383d41" };
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", fontSize: "16px", color: "#666" }}>
        Đang tải dữ liệu hợp đồng...
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: "#1a1a1a" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>Quản lý hợp đồng</h1>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>Tổng HĐ</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#1a1a1a" }}>{stats.total}</div>
        </div>
        <div style={{ background: "#fff", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>Hiệu lực</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#155724" }}>{stats.active}</div>
        </div>
        <div style={{ background: "#fff", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>Sắp hết hạn</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#856404" }}>{stats.expiring}</div>
        </div>
        <div style={{ background: "#fff", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>Hết hạn</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#721c24" }}>{stats.expired}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Tìm kiếm mã HĐ, nhân viên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "8px 14px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", minWidth: "240px" }}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: "8px 14px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}
        >
          <option value="">Loại HĐ</option>
          <option value="probation">Thử việc</option>
          <option value="fixed_term">Xác định thời hạn</option>
          <option value="indefinite">Không xác định thời hạn</option>
          <option value="service">Hợp đồng dịch vụ</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "8px 14px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}
        >
          <option value="">Trạng thái</option>
          <option value="active">Hiệu lực</option>
          <option value="expiring_soon">Sắp hết hạn</option>
          <option value="expired">Hết hạn</option>
          <option value="terminated">Đã thanh lý</option>
        </select>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ marginLeft: "auto", padding: "8px 18px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
        >
          + Tạo hợp đồng
        </button>
      </div>

      {/* Contracts Table */}
      <div style={{ background: "#fff", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "auto", marginBottom: "24px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #e9ecef" }}>
              <th style={{ padding: "12px 14px", textAlign: "left", fontWeight: 600 }}>Mã HĐ</th>
              <th style={{ padding: "12px 14px", textAlign: "left", fontWeight: 600 }}>Nhân viên</th>
              <th style={{ padding: "12px 14px", textAlign: "left", fontWeight: 600 }}>Loại</th>
              <th style={{ padding: "12px 14px", textAlign: "left", fontWeight: 600 }}>Ngày bắt đầu</th>
              <th style={{ padding: "12px 14px", textAlign: "left", fontWeight: 600 }}>Ngày kết thúc</th>
              <th style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600 }}>Lương</th>
              <th style={{ padding: "12px 14px", textAlign: "center", fontWeight: 600 }}>Trạng thái</th>
              <th style={{ padding: "12px 14px", textAlign: "center", fontWeight: 600 }}>File</th>
              <th style={{ padding: "12px 14px", textAlign: "center", fontWeight: 600 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredContracts.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: "24px", textAlign: "center", color: "#999" }}>
                  Không có hợp đồng nào
                </td>
              </tr>
            ) : (
              filteredContracts.map((contract) => (
                <tr key={contract.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 500 }}>{contract.code}</td>
                  <td style={{ padding: "10px 14px" }}>{contract.employee_name}</td>
                  <td style={{ padding: "10px 14px" }}>{CONTRACT_TYPE_LABELS[contract.contract_type] || contract.contract_type}</td>
                  <td style={{ padding: "10px 14px" }}>{formatDate(contract.start_date)}</td>
                  <td style={{ padding: "10px 14px" }}>{formatDate(contract.end_date)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>{formatCurrency(contract.base_salary)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                    <span style={getStatusBadgeStyle(contract.status)}>
                      {STATUS_LABELS[contract.status] || contract.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                    {contract.file_path ? <span title="Có file đính kèm">📎</span> : "—"}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                      <button
                        onClick={() => { setSelectedContract(contract); setShowDetailPanel(true); }}
                        style={{ padding: "4px 10px", fontSize: "12px", border: "1px solid #2563eb", color: "#2563eb", backgroundColor: "transparent", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Xem
                      </button>
                      <button
                        onClick={() => { setSelectedContract(contract); setShowRenewModal(true); }}
                        style={{ padding: "4px 10px", fontSize: "12px", border: "1px solid #16a34a", color: "#16a34a", backgroundColor: "transparent", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Gia hạn
                      </button>
                      <button
                        onClick={() => handleTerminate(contract)}
                        style={{ padding: "4px 10px", fontSize: "12px", border: "1px solid #dc2626", color: "#dc2626", backgroundColor: "transparent", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Thanh lý
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Expiring Contracts Alert */}
      {expiringContracts.length > 0 && (
        <div style={{ background: "#fffbeb", border: "1px solid #f59e0b", borderRadius: "8px", padding: "16px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#92400e", marginBottom: "12px" }}>
            ⚠️ Hợp đồng sắp hết hạn
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {expiringContracts.map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", backgroundColor: "#fef3c7", borderRadius: "6px" }}>
                <span style={{ fontWeight: 500 }}>{c.code} — {c.employee_name}</span>
                <span style={{ color: "#b45309", fontWeight: 600, fontSize: "13px" }}>
                  Còn {daysUntil(c.end_date)} ngày
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Contract Modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "28px", width: "500px", maxWidth: "90vw", maxHeight: "90vh", overflow: "auto" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "20px" }}>Tạo hợp đồng mới</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "4px" }}>Nhân viên</label>
                <select
                  value={createForm.employee_id}
                  onChange={(e) => setCreateForm({ ...createForm, employee_id: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.code || emp.employee_code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "4px" }}>Loại HĐ</label>
                <select
                  value={createForm.contract_type}
                  onChange={(e) => setCreateForm({ ...createForm, contract_type: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}
                >
                  <option value="probation">Thử việc</option>
                  <option value="fixed_term">Xác định thời hạn</option>
                  <option value="indefinite">Không xác định thời hạn</option>
          <option value="service">Hợp đồng dịch vụ</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "4px" }}>Ngày bắt đầu</label>
                <input
                  type="date"
                  value={createForm.start_date}
                  onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "4px" }}>Ngày kết thúc</label>
                <input
                  type="date"
                  value={createForm.end_date}
                  onChange={(e) => setCreateForm({ ...createForm, end_date: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "4px" }}>Lương cơ bản (VNĐ)</label>
                <input
                  type="number"
                  value={createForm.salary}
                  onChange={(e) => setCreateForm({ ...createForm, salary: e.target.value })}
                  placeholder="VD: 15000000"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "4px" }}>Đính kèm file</label>
                <input
                  type="file"
                  onChange={(e) => setCreateForm({ ...createForm, file: e.target.files?.[0] || null })}
                  style={{ fontSize: "14px" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ padding: "8px 18px", border: "1px solid #ddd", borderRadius: "6px", backgroundColor: "#fff", fontSize: "14px", cursor: "pointer" }}
              >
                Huỷ
              </button>
              <button
                onClick={handleCreate}
                style={{ padding: "8px 18px", border: "none", borderRadius: "6px", backgroundColor: "#2563eb", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                Tạo hợp đồng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {showRenewModal && selectedContract && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "28px", width: "420px", maxWidth: "90vw" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>Gia hạn hợp đồng</h2>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
              Hợp đồng: {selectedContract.code} — {selectedContract.employee_name}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "4px" }}>Ngày kết thúc mới</label>
                <input
                  type="date"
                  value={renewForm.new_end_date}
                  onChange={(e) => setRenewForm({ ...renewForm, new_end_date: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "4px" }}>Lương mới (tuỳ chọn)</label>
                <input
                  type="number"
                  value={renewForm.new_salary}
                  onChange={(e) => setRenewForm({ ...renewForm, new_salary: e.target.value })}
                  placeholder="Để trống nếu không đổi"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button
                onClick={() => { setShowRenewModal(false); setRenewForm({ new_end_date: "", new_salary: "" }); }}
                style={{ padding: "8px 18px", border: "1px solid #ddd", borderRadius: "6px", backgroundColor: "#fff", fontSize: "14px", cursor: "pointer" }}
              >
                Huỷ
              </button>
              <button
                onClick={handleRenew}
                style={{ padding: "8px 18px", border: "none", borderRadius: "6px", backgroundColor: "#16a34a", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                Gia hạn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Panel (slide from right) */}
      {showDetailPanel && selectedContract && (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "480px", maxWidth: "100vw", backgroundColor: "#fff", boxShadow: "-4px 0 20px rgba(0,0,0,0.15)", zIndex: 1000, overflow: "auto", padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600 }}>Chi tiết hợp đồng</h2>
            <button
              onClick={() => setShowDetailPanel(false)}
              style={{ padding: "6px 12px", border: "1px solid #ddd", borderRadius: "6px", backgroundColor: "#fff", fontSize: "18px", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          {/* Contract Info */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", color: "#374151" }}>Thông tin hợp đồng</h3>
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px", fontSize: "14px" }}>
              <span style={{ color: "#666" }}>Mã HĐ:</span>
              <span style={{ fontWeight: 500 }}>{selectedContract.code}</span>
              <span style={{ color: "#666" }}>Loại:</span>
              <span>{CONTRACT_TYPE_LABELS[selectedContract.contract_type]}</span>
              <span style={{ color: "#666" }}>Ngày bắt đầu:</span>
              <span>{formatDate(selectedContract.start_date)}</span>
              <span style={{ color: "#666" }}>Ngày kết thúc:</span>
              <span>{formatDate(selectedContract.end_date)}</span>
              <span style={{ color: "#666" }}>Lương:</span>
              <span style={{ fontWeight: 500 }}>{formatCurrency(selectedContract.base_salary)}</span>
              <span style={{ color: "#666" }}>Trạng thái:</span>
              <span style={getStatusBadgeStyle(selectedContract.status)}>
                {STATUS_LABELS[selectedContract.status] || selectedContract.status}
              </span>
            </div>
          </div>

          {/* Employee Info */}
          <div style={{ marginBottom: "20px", padding: "16px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", color: "#374151" }}>Thông tin nhân viên</h3>
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px", fontSize: "14px" }}>
              <span style={{ color: "#666" }}>Họ và tên:</span>
              <span style={{ fontWeight: 500 }}>{selectedContract.employee_name}</span>
              <span style={{ color: "#666" }}>Mã nhân viên:</span>
              <span>{selectedContract.employee_id}</span>
            </div>
          </div>

          {/* Status Timeline */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", color: "#374151" }}>Lịch sử trạng thái</h3>
            <div style={{ borderLeft: "2px solid #e5e7eb", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "-22px", top: "4px", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#2563eb" }}></div>
                <div style={{ fontSize: "13px", color: "#666" }}>Ngày tạo</div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{formatDate(selectedContract.created_at || selectedContract.start_date)}</div>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "-22px", top: "4px", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#16a34a" }}></div>
                <div style={{ fontSize: "13px", color: "#666" }}>Bắt đầu hiệu lực</div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{formatDate(selectedContract.start_date)}</div>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "-22px", top: "4px", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: selectedContract.status === "terminated" ? "#dc2626" : "#9ca3af" }}></div>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  {selectedContract.status === "terminated" ? "Đã thanh lý" : "Ngày kết thúc dự kiến"}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{formatDate(selectedContract.end_date)}</div>
              </div>
            </div>
          </div>

          {/* File Attachment */}
          {selectedContract.file_path && (
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", color: "#374151" }}>File đính kèm</h3>
              <a
                href={selectedContract.file_path}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: "#eff6ff", borderRadius: "6px", color: "#2563eb", textDecoration: "none", fontSize: "14px" }}
              >
                📎 Xem file đính kèm
              </a>
            </div>
          )}
        </div>
      )}

      {/* Overlay for detail panel */}
      {showDetailPanel && (
        <div
          onClick={() => setShowDetailPanel(false)}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 999 }}
        />
      )}
    </div>
  );
}
