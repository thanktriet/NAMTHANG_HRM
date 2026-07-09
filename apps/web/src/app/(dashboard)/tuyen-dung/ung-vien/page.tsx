"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Candidate {
  id: string
  code: string
  full_name: string
  position_applied: string
  status: string
  applied_date: string
  phone: string
  email: string
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; border: string }> = {
  new: { label: "Mới nộp", bg: "#f3f4f6", text: "#374151", border: "#d1d5db" },
  screening: { label: "Sàng lọc", bg: "#dbeafe", text: "#1d4ed8", border: "#bfdbfe" },
  interview: { label: "Phỏng vấn", bg: "#ede9fe", text: "#6d28d9", border: "#ddd6fe" },
  evaluation: { label: "Đánh giá", bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  offer: { label: "Đề xuất", bg: "#ecfeff", text: "#0e7490", border: "#a5f3fc" },
  hired: { label: "Nhận việc", bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" },
  rejected: { label: "Từ chối", bg: "#fee2e2", text: "#b91c1c", border: "#fecaca" },
}

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "new", label: "Mới nộp" },
  { value: "screening", label: "Sàng lọc" },
  { value: "interview", label: "Phỏng vấn" },
  { value: "evaluation", label: "Đánh giá" },
  { value: "offer", label: "Đề xuất" },
  { value: "hired", label: "Nhận việc" },
  { value: "rejected", label: "Từ chối" },
]

const POSITION_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "Tài xế", label: "Tài xế" },
  { value: "NV Kinh doanh", label: "NV Kinh doanh" },
  { value: "NV Kế toán", label: "NV Kế toán" },
  { value: "NV IT", label: "NV IT" },
  { value: "Thực tập sinh", label: "Thực tập sinh" },
]

function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

// Tách "Tài xế xe 7 chỗ - VF5" -> { position: "Tài xế xe 7 chỗ", vehicle: "VF5" }
function splitPosition(raw: string | null | undefined): { position: string; vehicle: string } {
  const s = (raw || "").trim()
  if (!s) return { position: "—", vehicle: "—" }
  const idx = s.lastIndexOf(" - ")
  if (idx === -1) return { position: s, vehicle: "—" }
  return { position: s.slice(0, idx).trim() || "—", vehicle: s.slice(idx + 3).trim() || "—" }
}

export default function UngVienPage() {
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [positionFilter, setPositionFilter] = useState("")

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("namthang_hrm_token")
      const res = await fetch("/api-proxy/api/v1/candidates", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (!res.ok) throw new Error("Không thể tải danh sách ứng viên")
      const data = await res.json()
      setCandidates(data.data.items || [])
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi")
    } finally {
      setLoading(false)
    }
  }

  const filtered = candidates.filter((c) => {
    const matchSearch =
      !search ||
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || c.status === statusFilter
    const matchPosition = !positionFilter || c.position_applied === positionFilter
    return matchSearch && matchStatus && matchPosition
  })

  const handleRowClick = (id: string) => {
    router.push(`/tuyen-dung/${id}`)
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <a
            href="/tuyen-dung"
            style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px", marginBottom: "8px", display: "inline-block" }}
          >
            ← Quay lại Tuyển dụng
          </a>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#111827" }}>
            Quản lý ứng viên
          </h1>
        </div>
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "center",
          padding: "16px",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        <input
          type="text"
          placeholder="Tìm theo tên, mã..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            minWidth: "220px",
            outline: "none",
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            backgroundColor: "#fff",
            cursor: "pointer",
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            backgroundColor: "#fff",
            cursor: "pointer",
          }}
        >
          {POSITION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#6b7280" }}>
          <p style={{ fontSize: "16px" }}>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "#b91c1c",
            backgroundColor: "#fef2f2",
            borderRadius: "8px",
            border: "1px solid #fecaca",
          }}
        >
          <p style={{ fontSize: "16px", margin: 0 }}>{error}</p>
          <button
            onClick={fetchCandidates}
            style={{
              marginTop: "12px",
              padding: "8px 16px",
              backgroundColor: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Thử lại
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#6b7280" }}>
          <p style={{ fontSize: "16px" }}>Không có ứng viên nào</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                  Mã UV
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                  Họ tên
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                  Vị trí
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                  Loại xe
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                  SĐT
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                  Email
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                  Ngày nộp
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                  Trạng thái
                </th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const statusInfo = STATUS_MAP[c.status] || { label: c.status, bg: "#f3f4f6", text: "#374151", border: "#d1d5db" }
                return (
                  <tr
                    key={c.id}
                    onClick={() => handleRowClick(c.id)}
                    style={{ cursor: "pointer", borderBottom: "1px solid #e5e7eb" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#f9fafb" }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent" }}
                  >
                    <td style={{ padding: "12px 16px", color: "#6b7280" }}>{c.code}</td>
                    <td style={{ padding: "12px 16px", color: "#2563eb", fontWeight: 500 }}>{c.full_name}</td>
                    <td style={{ padding: "12px 16px", color: "#374151" }}>{splitPosition(c.position_applied).position}</td>
                    <td style={{ padding: "12px 16px", color: "#374151" }}>{splitPosition(c.position_applied).vehicle}</td>
                    <td style={{ padding: "12px 16px", color: "#374151" }}>{c.phone}</td>
                    <td style={{ padding: "12px 16px", color: "#374151" }}>{c.email}</td>
                    <td style={{ padding: "12px 16px", color: "#374151" }}>{formatDate(c.applied_date)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "9999px",
                          fontSize: "12px",
                          fontWeight: 500,
                          backgroundColor: statusInfo.bg,
                          color: statusInfo.text,
                          border: `1px solid ${statusInfo.border}`,
                        }}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRowClick(c.id)
                        }}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#2563eb",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
