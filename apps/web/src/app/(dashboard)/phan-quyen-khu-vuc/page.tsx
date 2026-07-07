"use client"

import { useEffect, useState } from "react"

const WORK_AREAS = ["Rạch Giá", "Phú Quốc", "An Giang", "Cần Thơ", "Sóc Trăng", "Cà Mau"]

interface Role {
  id: string
  name: string
  code: string
}

export default function PhanQuyenKhuVucPage() {
  const [users, setUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [savingId, setSavingId] = useState("")

  // Modal tạo tài khoản
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createErr, setCreateErr] = useState("")
  const [form, setForm] = useState({ username: "", password: "", role_id: "", work_area: "" })

  const token = () => localStorage.getItem("namthang_hrm_token")

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api-proxy/api/v1/users", {
        headers: { Authorization: `Bearer ${token()}` },
      })
      if (res.status === 403) throw new Error("Chỉ quản trị viên mới xem được trang này")
      if (!res.ok) throw new Error("Không tải được danh sách người dùng")
      const data = await res.json()
      setUsers(data.data?.items || data.items || [])
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api-proxy/api/v1/users/meta/roles", {
        headers: { Authorization: `Bearer ${token()}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setRoles(data.data?.items || data.items || [])
    } catch {
      // bỏ qua - vẫn tạo được với vai trò trống
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const handleChange = async (id: string, workArea: string) => {
    setSavingId(id)
    try {
      const res = await fetch(`/api-proxy/api/v1/users/${id}/work-area`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ work_area: workArea || null }),
      })
      if (!res.ok) throw new Error("Lưu thất bại")
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, work_area: workArea || null } : u)))
    } catch (err: any) {
      alert(err.message || "Có lỗi khi lưu")
    } finally {
      setSavingId("")
    }
  }

  const openCreate = () => {
    setForm({ username: "", password: "", role_id: "", work_area: "" })
    setCreateErr("")
    setShowCreate(true)
  }

  const handleCreate = async () => {
    if (form.username.trim().length < 3) {
      setCreateErr("Tên đăng nhập phải có ít nhất 3 ký tự")
      return
    }
    if (form.password.length < 6) {
      setCreateErr("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }
    setCreating(true)
    setCreateErr("")
    try {
      const res = await fetch("/api-proxy/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
          role_id: form.role_id || null,
          work_area: form.work_area || null,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || "Tạo tài khoản thất bại")
      }
      setShowCreate(false)
      await fetchUsers()
    } catch (err: any) {
      setCreateErr(err.message || "Có lỗi khi tạo tài khoản")
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <div style={{ padding: 24, color: "#6b7280" }}>Đang tải...</div>
  if (error) return <div style={{ padding: 24, color: "#ef4444" }}>{error}</div>

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Tài khoản & Phân quyền khu vực</h1>
        <button
          onClick={openCreate}
          style={{ padding: "9px 16px", background: "#0057FF", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          + Tạo tài khoản
        </button>
      </div>
      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
        Tạo tài khoản đăng nhập HRM và gán khu vực cho từng người. HR chỉ thấy và xử lý hồ sơ ứng viên thuộc khu vực được gán. Để trống = thấy tất cả (quản trị viên).
      </p>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", textAlign: "left" }}>
              <th style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#374151" }}>Tài khoản</th>
              <th style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#374151" }}>Vai trò</th>
              <th style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#374151" }}>Khu vực phụ trách</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: "24px 16px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                  Chưa có tài khoản nào. Nhấn "Tạo tài khoản" để thêm.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#111827" }}>{u.username}</td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#6b7280" }}>{u.role_name || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <select
                      value={u.work_area || ""}
                      disabled={savingId === u.id}
                      onChange={(e) => handleChange(u.id, e.target.value)}
                      style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, background: "#fff", minWidth: 180 }}
                    >
                      <option value="">— Tất cả (không giới hạn) —</option>
                      {WORK_AREAS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                    {savingId === u.id && <span style={{ marginLeft: 8, fontSize: 12, color: "#6b7280" }}>Đang lưu...</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div
          onClick={() => !creating && setShowCreate(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 12, padding: 28, width: 440, maxWidth: "90vw" }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "#111827" }}>Tạo tài khoản mới</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Tên đăng nhập *</label>
                <input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="vd: hr.rachgia"
                  autoComplete="off"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Mật khẩu *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Ít nhất 6 ký tự"
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Vai trò</label>
                <select
                  value={form.role_id}
                  onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">— Chọn vai trò —</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Khu vực phụ trách</label>
                <select
                  value={form.work_area}
                  onChange={(e) => setForm({ ...form, work_area: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">— Tất cả (không giới hạn) —</option>
                  {WORK_AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              {createErr && <p style={{ fontSize: 13, color: "#ef4444", margin: 0 }}>{createErr}</p>}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowCreate(false)}
                disabled={creating}
                style={{ padding: "9px 16px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", fontSize: 14, cursor: "pointer" }}
              >
                Huỷ
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                style={{ padding: "9px 16px", border: "none", borderRadius: 8, background: "#0057FF", color: "#fff", fontSize: 14, fontWeight: 600, cursor: creating ? "not-allowed" : "pointer", opacity: creating ? 0.7 : 1 }}
              >
                {creating ? "Đang tạo..." : "Tạo tài khoản"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
