"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

const API_BASE = "/api-proxy/api/v1";
// Base URL để mở file đã upload (file_path dạng /uploads/... phục vụ qua nginx domain tuyển dụng)
const DOC_BASE = "https://tuyendung.vinfastnamthang.vn";

const REQUIRED_DOCS = [
  { key: "cccd", label: "CCCD" },
  { key: "so_yeu_ly_lich", label: "Sơ yếu lý lịch" },
  { key: "giay_kham_suc_khoe", label: "Giấy khám sức khỏe" },
  { key: "bang_lai", label: "Bằng lái xe" },
];

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("namthang_hrm_token");
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const DATE_FIELDS = ["date_of_birth", "id_card_date", "hire_date"];

const EMP_STATUS_LABEL: Record<string, string> = {
  probation: "Thử việc",
  active: "Đang làm việc",
  resigned: "Đã nghỉ",
  terminated: "Chấm dứt",
};

const CONTRACT_STATUS_LABEL: Record<string, string> = {
  active: "Hiệu lực",
  expired: "Hết hạn",
  terminated: "Đã thanh lý",
  draft: "Nháp",
};

const FIELD_MAP: Record<string, string> = {
  full_name: "Họ và tên",
  date_of_birth: "Ngày sinh",
  gender: "Giới tính",
  id_card_number: "Số CCCD",
  id_card_date: "Ngày cấp",
  id_card_place: "Nơi cấp",
  permanent_address: "Địa chỉ thường trú",
  current_address: "Địa chỉ tạm trú",
  email: "Email",
  phone: "Số điện thoại",
  ethnicity: "Dân tộc",
  religion: "Tôn giáo",
  education_level: "Trình độ học vấn",
  marital_status: "Tình trạng hôn nhân",
  bank_account: "Số tài khoản",
  bank_name: "Ngân hàng",
  tax_code: "Mã số thuế",
  social_insurance_number: "Số BHXH",
};

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params?.id as string;

  const [activeTab, setActiveTab] = useState(0);
  const [employee, setEmployee] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);

  // Reward form
  const [rewardForm, setRewardForm] = useState({ type: "reward", title: "", description: "", decision_number: "", effective_date: "", amount: "", file_name: "", file_path: "" });
  const [addingReward, setAddingReward] = useState(false);

  // Contract form
  const [contractForm, setContractForm] = useState({ contract_type: "fixed_term", start_date: "", end_date: "", base_salary: "", file_name: "", file_path: "" });
  const [addingContract, setAddingContract] = useState(false);

  // Document upload
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const headers = () => {
    const token = getToken();
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    if (employeeId) {
      fetchAll();
    }
  }, [employeeId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [empRes, rewRes, conRes, docRes] = await Promise.all([
        fetch(`${API_BASE}/employees/${employeeId}`, { headers: headers() }),
        fetch(`${API_BASE}/employees/${employeeId}/rewards`, { headers: headers() }),
        fetch(`${API_BASE}/employees/${employeeId}/contracts`, { headers: headers() }),
        fetch(`${API_BASE}/employees/${employeeId}/documents`, { headers: headers() }),
      ]);
      if (empRes.ok) { const d = await empRes.json(); setEmployee(d.data); }
      if (rewRes.ok) { const d = await rewRes.json(); setRewards(d.data?.items || d.items || []); }
      if (conRes.ok) { const d = await conRes.json(); setContracts(d.data?.items || d.items || []); }
      if (docRes.ok) { const d = await docRes.json(); setDocuments(d.data?.items || d.items || []); }
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveField = async (field: string) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/employees/${employeeId}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ [field]: editValue }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEmployee(updated.data || updated);
        setEditingField(null);
      } else {
        alert("Lỗi khi cập nhật");
      }
    } catch { alert("Lỗi khi cập nhật"); }
    finally { setSaving(false); }
  };

  const handleAddReward = async () => {
    setAddingReward(true);
    try {
      const res = await fetch(`${API_BASE}/employees/${employeeId}/rewards`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ ...rewardForm, amount: parseFloat(rewardForm.amount) || 0 }),
      });
      if (res.ok) {
        setRewardForm({ type: "reward", title: "", description: "", decision_number: "", effective_date: "", amount: "", file_name: "", file_path: "" });
        const r = await fetch(`${API_BASE}/employees/${employeeId}/rewards`, { headers: headers() });
        if (r.ok) { const d = await r.json(); setRewards(d.data?.items || d.items || []); }
      } else { alert("Lỗi khi thêm khen thưởng/kỷ luật"); }
    } catch { alert("Lỗi khi thêm"); }
    finally { setAddingReward(false); }
  };

  const handleAddContract = async () => {
    setAddingContract(true);
    try {
      const res = await fetch(`${API_BASE}/contracts`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ ...contractForm, employee_id: employeeId, base_salary: parseFloat(contractForm.base_salary) || 0 }),
      });
      if (res.ok) {
        setContractForm({ contract_type: "fixed_term", start_date: "", end_date: "", base_salary: "", file_name: "", file_path: "" });
        const r = await fetch(`${API_BASE}/employees/${employeeId}/contracts`, { headers: headers() });
        if (r.ok) { const d = await r.json(); setContracts(d.data?.items || d.items || []); }
      } else { alert("Lỗi khi thêm hợp đồng"); }
    } catch { alert("Lỗi khi thêm hợp đồng"); }
    finally { setAddingContract(false); }
  };

  const handleUpload = async (documentType: string, file: File) => {
    setUploading(documentType);
    try {
      const token = localStorage.getItem("namthang_hrm_token");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("document_type", documentType);
      const res = await fetch(`${API_BASE}/employees/${employeeId}/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const r = await fetch(`${API_BASE}/employees/${employeeId}/documents`, { headers: headers() });
        if (r.ok) { const d = await r.json(); setDocuments(d.data?.items || d.items || []); }
      } else { alert("Lỗi khi upload tài liệu"); }
    } catch { alert("Lỗi khi upload tài liệu"); }
    finally { setUploading(null); }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!window.confirm("Xóa tài liệu này? (vẫn lưu lịch sử, có thể tải lại file mới)")) return;
    try {
      const res = await fetch(`${API_BASE}/employees/${employeeId}/documents/${docId}`, {
        method: "DELETE",
        headers: headers(),
      });
      if (res.ok) {
        const r = await fetch(`${API_BASE}/employees/${employeeId}/documents`, { headers: headers() });
        if (r.ok) { const d = await r.json(); setDocuments(d.data?.items || d.items || []); }
      } else { alert("Lỗi khi xóa tài liệu"); }
    } catch { alert("Lỗi khi xóa tài liệu"); }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Đang tải...</div>;
  }

  if (!employee) {
    return <div style={{ padding: 40, textAlign: "center", color: "#dc2626" }}>Không tìm thấy nhân viên</div>;
  }

  const tabs = ["Thông tin cá nhân", "Khen thưởng / Kỷ luật", "Hợp đồng", "Hồ sơ"];

  const tabStyle = (idx: number) => ({
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: activeTab === idx ? 700 : 500,
    color: activeTab === idx ? "#2563eb" : "#6b7280",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    borderBottom: activeTab === idx ? "3px solid #2563eb" : "3px solid transparent",
    background: "none",
    cursor: "pointer" as const,
  });

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <button onClick={() => router.push("/nhan-su")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#2563eb" }}>
          ← Quay lại danh sách
        </button>
        <div style={{ fontSize: 12, color: "#9ca3af" }}>Mã NV: {employee.code}</div>
      </div>

      {/* Employee summary */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>{employee.full_name}</h1>
        <div style={{ display: "flex", gap: 24, marginTop: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>Phòng ban: <b>{employee.department_name || "—"}</b></span>
          <span style={{ fontSize: 13, color: "#6b7280" }}>Chức vụ: <b>{employee.position_name || "—"}</b></span>
          <span style={{ fontSize: 13, color: "#6b7280" }}>Trạng thái: <b>{EMP_STATUS_LABEL[employee.status] || employee.status || "—"}</b></span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: 24 }}>
        {tabs.map((t, i) => (
          <button key={i} style={tabStyle(i)} onClick={() => setActiveTab(i)}>{t}</button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 0 && renderPersonalInfo()}
      {activeTab === 1 && renderRewards()}
      {activeTab === 2 && renderContracts()}
      {activeTab === 3 && renderDocuments()}
    </div>
  );

  function renderPersonalInfo() {
    return (
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Thông tin cá nhân</h2>
          <button
            onClick={() => { setIsEditMode(!isEditMode); setEditingField(null); }}
            style={{ padding: "6px 16px", fontSize: 13, fontWeight: 600, background: isEditMode ? "#f3f4f6" : "#2563eb", color: isEditMode ? "#374151" : "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            {isEditMode ? "Xong" : "Chỉnh sửa"}
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {Object.entries(FIELD_MAP).map(([field, label]) => {
            const value = employee[field] || "";
            const isEditing = editingField === field;
            return (
              <div key={field} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{label}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isEditing ? (
                    <>
                      <input
                        type={DATE_FIELDS.includes(field) ? "date" : "text"}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{ flex: 1, padding: "6px 10px", fontSize: 14, border: "1px solid #d1d5db", borderRadius: 6 }}
                      />
                      <button onClick={() => handleSaveField(field)} disabled={saving} style={{ padding: "4px 12px", fontSize: 12, background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                        {saving ? "..." : "Lưu"}
                      </button>
                      <button onClick={() => setEditingField(null)} style={{ padding: "4px 10px", fontSize: 12, background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer" }}>Huỷ</button>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 14, color: "#111827", flex: 1 }}>{DATE_FIELDS.includes(field) && value ? formatDate(value) : (value || "—")}</span>
                      {isEditMode && (
                        <button onClick={() => {
                          setEditingField(field);
                          let val = value;
                          if (DATE_FIELDS.includes(field) && val) {
                            val = new Date(val).toISOString().split("T")[0];
                          }
                          setEditValue(val);
                        }} style={{ padding: "2px 8px", fontSize: 11, background: "none", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", color: "#6b7280" }}>Sửa</button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderRewards() {
    return (
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginTop: 0, marginBottom: 20 }}>Khen thưởng / Kỷ luật</h2>

        {/* List */}
        {rewards.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: 14 }}>Chưa có dữ liệu</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {rewards.map((r, i) => (
              <div key={i} style={{ padding: 14, borderRadius: 8, border: "1px solid #e5e7eb", background: r.type === "reward" ? "#f0fdf4" : "#fef2f2" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: r.type === "reward" ? "#16a34a" : "#dc2626" }}>
                    {r.type === "reward" ? "Khen thưởng" : "Kỷ luật"}: {r.title}
                  </span>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>{formatDate(r.effective_date)}</span>
                </div>
                {r.description && <p style={{ fontSize: 13, color: "#374151", marginTop: 6, marginBottom: 0 }}>{r.description}</p>}
                {r.decision_number && <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4, marginBottom: 0 }}>QĐ: {r.decision_number}</p>}
                {r.file_name && (
                  <span style={{ fontSize: 12, color: "#2563eb", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    📎 {r.file_name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add form */}
        {!showRewardForm ? (
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
            <button onClick={() => setShowRewardForm(true)} style={{ padding: "8px 20px", fontSize: 13, fontWeight: 600, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
              + Thêm mới
            </button>
          </div>
        ) : (
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Thêm mới</h3>
            <button onClick={() => setShowRewardForm(false)} style={{ padding: "4px 12px", fontSize: 12, background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer" }}>Huỷ</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280" }}>Loại</label>
              <select value={rewardForm.type} onChange={(e) => setRewardForm({ ...rewardForm, type: e.target.value })} style={{ width: "100%", padding: "8px 10px", fontSize: 14, border: "1px solid #d1d5db", borderRadius: 6, marginTop: 4 }}>
                <option value="reward">Khen thưởng</option>
                <option value="discipline">Kỷ luật</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280" }}>Tiêu đề</label>
              <input type="text" value={rewardForm.title} onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })} style={{ width: "100%", padding: "8px 10px", fontSize: 14, border: "1px solid #d1d5db", borderRadius: 6, marginTop: 4 }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 12, color: "#6b7280" }}>Mô tả</label>
              <input type="text" value={rewardForm.description} onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })} style={{ width: "100%", padding: "8px 10px", fontSize: 14, border: "1px solid #d1d5db", borderRadius: 6, marginTop: 4 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280" }}>Số quyết định</label>
              <input type="text" value={rewardForm.decision_number} onChange={(e) => setRewardForm({ ...rewardForm, decision_number: e.target.value })} style={{ width: "100%", padding: "8px 10px", fontSize: 14, border: "1px solid #d1d5db", borderRadius: 6, marginTop: 4 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280" }}>Ngày hiệu lực</label>
              <input type="date" value={rewardForm.effective_date} onChange={(e) => setRewardForm({ ...rewardForm, effective_date: e.target.value })} style={{ width: "100%", padding: "8px 10px", fontSize: 14, border: "1px solid #d1d5db", borderRadius: 6, marginTop: 4 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280" }}>Số tiền</label>
              <input type="number" value={rewardForm.amount} onChange={(e) => setRewardForm({ ...rewardForm, amount: e.target.value })} style={{ width: "100%", padding: "8px 10px", fontSize: 14, border: "1px solid #d1d5db", borderRadius: 6, marginTop: 4 }} />
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1", marginTop: 4 }}>
            <label style={{ fontSize: 12, color: "#6b7280" }}>Đính kèm file</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setRewardForm({ ...rewardForm, file_name: file.name, file_path: `/uploads/rewards/${file.name}` });
              }}
              style={{ display: "block", fontSize: 13, padding: "8px 0", marginTop: 4 }}
            />
            {rewardForm.file_name && <span style={{ fontSize: 12, color: "#16a34a" }}>📎 {rewardForm.file_name}</span>}
          </div>
          <button onClick={handleAddReward} disabled={addingReward || !rewardForm.title} style={{ marginTop: 16, padding: "10px 24px", fontSize: 14, fontWeight: 600, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: addingReward || !rewardForm.title ? 0.5 : 1 }}>
            {addingReward ? "Đang thêm..." : "Thêm"}
          </button>
        </div>
        )}
      </div>
    );
  }

  function renderContracts() {
    return (
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginTop: 0, marginBottom: 20 }}>Hợp đồng lao động</h2>

        {/* List */}
        {contracts.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: 14 }}>Chưa có hợp đồng</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {contracts.map((c, i) => (
              <div key={i} style={{ padding: 14, borderRadius: 8, border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
                    {c.contract_type === "probation" ? "Thử việc" : c.contract_type === "fixed_term" ? "Có thời hạn" : c.contract_type === "indefinite" ? "Không thời hạn" : c.contract_type === "service" ? "Dịch vụ" : c.contract_type}
                  </span>
                  <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: c.status === "active" ? "#dcfce7" : "#fee2e2", color: c.status === "active" ? "#16a34a" : "#dc2626" }}>
                    {CONTRACT_STATUS_LABEL[c.status] || c.status}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>
                  {formatDate(c.start_date)} → {c.end_date ? formatDate(c.end_date) : "Không thời hạn"}
                </div>
                {c.base_salary && <div style={{ fontSize: 13, color: "#374151", marginTop: 4 }}>Lương: {Number(c.base_salary).toLocaleString("vi-VN")} VNĐ</div>}
                {c.code && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Mã: {c.code}</div>}
                {c.file_name && (
                  <span style={{ fontSize: 12, color: "#2563eb", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    📎 {c.file_name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add form */}
        {!showContractForm ? (
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
            <button onClick={() => setShowContractForm(true)} style={{ padding: "8px 20px", fontSize: 13, fontWeight: 600, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
              + Thêm hợp đồng
            </button>
          </div>
        ) : (
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Thêm hợp đồng mới</h3>
            <button onClick={() => setShowContractForm(false)} style={{ padding: "4px 12px", fontSize: 12, background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer" }}>Huỷ</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280" }}>Loại hợp đồng</label>
              <select value={contractForm.contract_type} onChange={(e) => setContractForm({ ...contractForm, contract_type: e.target.value })} style={{ width: "100%", padding: "8px 10px", fontSize: 14, border: "1px solid #d1d5db", borderRadius: 6, marginTop: 4 }}>
                <option value="probation">Thử việc</option>
                <option value="fixed_term">Có thời hạn</option>
                <option value="indefinite">Không xác định thời hạn</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280" }}>Lương cơ bản</label>
              <input type="number" value={contractForm.base_salary} onChange={(e) => setContractForm({ ...contractForm, base_salary: e.target.value })} style={{ width: "100%", padding: "8px 10px", fontSize: 14, border: "1px solid #d1d5db", borderRadius: 6, marginTop: 4 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280" }}>Ngày bắt đầu</label>
              <input type="date" value={contractForm.start_date} onChange={(e) => setContractForm({ ...contractForm, start_date: e.target.value })} style={{ width: "100%", padding: "8px 10px", fontSize: 14, border: "1px solid #d1d5db", borderRadius: 6, marginTop: 4 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280" }}>Ngày kết thúc</label>
              <input type="date" value={contractForm.end_date} onChange={(e) => setContractForm({ ...contractForm, end_date: e.target.value })} style={{ width: "100%", padding: "8px 10px", fontSize: 14, border: "1px solid #d1d5db", borderRadius: 6, marginTop: 4 }} />
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1", marginTop: 4 }}>
            <label style={{ fontSize: 12, color: "#6b7280" }}>Đính kèm file hợp đồng</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setContractForm({ ...contractForm, file_name: file.name, file_path: `/uploads/contracts/${file.name}` });
              }}
              style={{ display: "block", fontSize: 13, padding: "8px 0", marginTop: 4 }}
            />
            {contractForm.file_name && <span style={{ fontSize: 12, color: "#16a34a" }}>📎 {contractForm.file_name}</span>}
          </div>
          <button onClick={handleAddContract} disabled={addingContract || !contractForm.start_date} style={{ marginTop: 16, padding: "10px 24px", fontSize: 14, fontWeight: 600, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: addingContract || !contractForm.start_date ? 0.5 : 1 }}>
            {addingContract ? "Đang thêm..." : "Thêm hợp đồng"}
          </button>
        </div>
        )}
      </div>
    );
  }

  function renderDocuments() {
    return (
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginTop: 0, marginBottom: 20 }}>Hồ sơ nhân viên</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {REQUIRED_DOCS.map((doc) => {
            const uploaded = documents.filter((d) => d.document_type === doc.key);
            const hasFiles = uploaded.length > 0;
            const isUploading = uploading === doc.key;
            const canUploadMore = uploaded.length < 5;
            return (
              <div key={doc.key} style={{ borderRadius: 8, border: hasFiles ? "1px solid #bbf7d0" : "1px solid #fecaca", background: hasFiles ? "#f0fdf4" : "#fef2f2", overflow: "hidden" }}>
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{hasFiles ? "✅" : "❌"}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
                        {doc.label}
                        {hasFiles && <span style={{ marginLeft: 8, fontSize: 12, color: "#6b7280", fontWeight: 400 }}>({uploaded.length} file)</span>}
                      </div>
                      {!hasFiles && <div style={{ fontSize: 12, color: "#dc2626", marginTop: 2 }}>Chưa upload</div>}
                    </div>
                  </div>
                  {canUploadMore && (
                    <div>
                      <input type="file" ref={(el) => { fileInputRefs.current[doc.key] = el; }} style={{ display: "none" }} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(doc.key, file); e.target.value = ""; }} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                      <button onClick={() => fileInputRefs.current[doc.key]?.click()} disabled={isUploading} style={{ padding: "6px 14px", fontSize: 13, fontWeight: 500, borderRadius: 6, border: "1px solid #d1d5db", background: isUploading ? "#f3f4f6" : "#fff", color: isUploading ? "#9ca3af" : "#374151", cursor: isUploading ? "not-allowed" : "pointer" }}>
                        {isUploading ? "Đang tải..." : hasFiles ? "+ Thêm file" : "Chọn file"}
                      </button>
                    </div>
                  )}
                </div>
                {/* File list */}
                {hasFiles && (
                  <div style={{ borderTop: "1px solid #d1fae5", padding: "8px 18px 12px" }}>
                    {uploaded.map((f, idx) => (
                      <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: idx < uploaded.length - 1 ? "1px solid #d1fae5" : "none" }}>
                        <div style={{ fontSize: 13, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}>
                          📄 {f.file_name}
                          <span style={{ color: "#9ca3af", marginLeft: 8, fontSize: 11 }}>{formatDate(f.uploaded_at)}</span>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          <a
                            href={f.file_path?.startsWith("http") ? f.file_path : `${DOC_BASE}${f.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: "4px 12px", fontSize: 12, fontWeight: 500, borderRadius: 6, border: "1px solid #2563eb", background: "#fff", color: "#2563eb", textDecoration: "none" }}
                          >
                            Xem
                          </a>
                          <button
                            onClick={() => handleDeleteDoc(f.id)}
                            style={{ padding: "4px 12px", fontSize: 12, fontWeight: 500, borderRadius: 6, border: "1px solid #dc2626", background: "#fff", color: "#dc2626", cursor: "pointer" }}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
