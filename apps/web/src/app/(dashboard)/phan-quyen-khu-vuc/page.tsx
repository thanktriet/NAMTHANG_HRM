"use client"

import { useEffect, useState } from "react"

const WORK_AREAS = ["Rạch Giá", "Phú Quốc", "An Giang", "Cần Thơ", "Sóc Trăng", "Cà Mau"]

export default function PhanQuyenKhuVucPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [savingId, setSavingId] = useState("")

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("namthang_hrm_token")
      const res = await fetch("/api-proxy/api/v1/users", {
        headers: { Authorization: `Bearer ${token}` },
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

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleChange = async (id: string, workArea: string) => {
    setSavingId(id)
    try {
      const token = localStorage.getItem("namthang_hrm_token")
      const res = await fetch(`/api-proxy/api/v1/users/${id}/work-area`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

  if (loading) return <div style={{ padding: 24, color: "#6b7280" }}>Đang tải...</div>
  if (error) return <div style={{ padding: 24, color: "#ef4444" }}>{error}</div>

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Phân quyền khu vực</h1>
      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
        Gán khu vực cho từng nhân viên HR. HR chỉ thấy và xử lý hồ sơ ứng viên thuộc khu vực được gán. Để trống = thấy tất cả (quản trị viên).
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
            {users.map((u) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
