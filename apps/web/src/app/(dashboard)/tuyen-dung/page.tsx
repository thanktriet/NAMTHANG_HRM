"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

type ViewMode = "kanban" | "table"

interface Candidate {
  id: string
  code: string
  full_name: string
  position_applied: string
  status: string
  applied_date: string
  phone: string
  email: string
  experience_years: number
  license_class: string
  expected_salary: string
}

interface Stats {
  total: string
  new: string
  screening: string
  interview: string
  evaluation: string
  offer: string
  hired: string
  rejected: string
}

const STATUS_LABELS: Record<string, string> = {
  new: "Mới nộp",
  screening: "Sàng lọc",
  interview: "Phỏng vấn",
  evaluation: "Đánh giá",
  offer: "Đề xuất",
  hired: "Nhận việc",
  rejected: "Từ chối",
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  new: { bg: "#dbeafe", text: "#1d4ed8", border: "#bfdbfe" },
  screening: { bg: "#fef3c7", text: "#a16207", border: "#fde68a" },
  interview: { bg: "#ede9fe", text: "#6d28d9", border: "#ddd6fe" },
  evaluation: { bg: "#cffafe", text: "#0e7490", border: "#a5f3fc" },
  offer: { bg: "#fce7f3", text: "#be185d", border: "#fbcfe8" },
  hired: { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" },
  rejected: { bg: "#fee2e2", text: "#b91c1c", border: "#fecaca" },
}

const KANBAN_COLUMN_COLORS: Record<string, string> = {
  new: "#6366f1",
  screening: "#f59e0b",
  interview: "#8b5cf6",
  evaluation: "#06b6d4",
  offer: "#ec4899",
  hired: "#22c55e",
  rejected: "#ef4444",
}

const KANBAN_COLUMNS_ORDER = ["new", "screening", "interview", "evaluation", "offer", "hired", "rejected"]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function formatSalary(salary: string): string {
  const num = parseFloat(salary)
  if (isNaN(num)) return salary
  return new Intl.NumberFormat("vi-VN").format(num) + "đ"
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("namthang_hrm_token")
}

export default function RecruitmentPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
      setLoading(true)
      setError(null)
      const token = getToken()
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      try {
        const [candidatesRes, statsRes] = await Promise.all([
          fetch("http://localhost:4000/api/v1/candidates", { headers }),
          fetch("http://localhost:4000/api/v1/candidates/stats", { headers }),
        ])

        if (!candidatesRes.ok) {
          throw new Error(`Lỗi tải danh sách ứng viên: ${candidatesRes.status}`)
        }
        if (!statsRes.ok) {
          throw new Error(`Lỗi tải thống kê: ${statsRes.status}`)
        }

        const candidatesData = await candidatesRes.json()
        const statsData = await statsRes.json()

        if (candidatesData.success) {
          setCandidates(candidatesData.data.items)
        }
        if (statsData.success) {
          setStats(statsData.data)
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu"
        setError(message)
      } finally {
        setLoading(false)
      }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const statsCards = stats
    ? [
        { label: "Tổng", value: stats.total, icon: "👥", bgColor: "#dbeafe", textColor: "#1d4ed8" },
        { label: "Mới nộp", value: stats.new, icon: "📋", bgColor: "#e0e7ff", textColor: "#4338ca" },
        { label: "Sàng lọc", value: stats.screening, icon: "🔍", bgColor: "#fef3c7", textColor: "#a16207" },
        { label: "Phỏng vấn", value: stats.interview, icon: "🗣️", bgColor: "#ede9fe", textColor: "#6d28d9" },
        { label: "Đánh giá", value: stats.evaluation, icon: "📝", bgColor: "#cffafe", textColor: "#0e7490" },
        { label: "Đề xuất", value: stats.offer, icon: "📨", bgColor: "#fce7f3", textColor: "#be185d" },
        { label: "Nhận việc", value: stats.hired, icon: "✅", bgColor: "#dcfce7", textColor: "#15803d" },
        { label: "Từ chối", value: stats.rejected, icon: "❌", bgColor: "#fee2e2", textColor: "#b91c1c" },
      ]
    : []

  // Group candidates by status for kanban
  const kanbanData = KANBAN_COLUMNS_ORDER.map((status) => ({
    id: status,
    title: STATUS_LABELS[status] || status,
    color: KANBAN_COLUMN_COLORS[status] || "#6b7280",
    candidates: candidates.filter((c) => c.status === status),
  }))

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            width: "40px",
            height: "40px",
            border: "4px solid #e5e7eb",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ marginTop: "16px", color: "#6b7280", fontSize: "14px" }}>
          Đang tải dữ liệu tuyển dụng...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          background: "#fef2f2",
          borderRadius: "8px",
          margin: "20px",
        }}
      >
        <p style={{ color: "#b91c1c", fontSize: "16px", fontWeight: 500 }}>⚠️ {error}</p>
        <button
          onClick={() => fetchData()}
          style={{
            marginTop: "16px",
            padding: "8px 20px",
            background: "#3b82f6",
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
    )
  }

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Quản lý tuyển dụng</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* View toggle */}
          <div
            style={{
              display: "flex",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setViewMode("kanban")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "8px 12px",
                fontSize: "13px",
                border: "none",
                cursor: "pointer",
                background: viewMode === "kanban" ? "#2563eb" : "#fff",
                color: viewMode === "kanban" ? "#fff" : "#374151",
                transition: "all 0.2s",
              }}
            >
              ☰ Kanban
            </button>
            <button
              onClick={() => setViewMode("table")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "8px 12px",
                fontSize: "13px",
                border: "none",
                borderLeft: "1px solid #e5e7eb",
                cursor: "pointer",
                background: viewMode === "table" ? "#2563eb" : "#fff",
                color: viewMode === "table" ? "#fff" : "#374151",
                transition: "all 0.2s",
              }}
            >
              ▤ Bảng
            </button>
          </div>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            + Đăng tin tuyển dụng
          </button>
        </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
          }}
        >
          {statsCards.map((stat) => (
            <div
              key={stat.label}
              style={{
                padding: "16px",
                background: "#fff",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: stat.bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                }}
              >
                {stat.icon}
              </div>
              <div>
                <p style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: stat.textColor }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {viewMode === "kanban" ? (
        <div
          style={{
            display: "flex",
            gap: "12px",
            overflowX: "auto",
            paddingBottom: "8px",
          }}
        >
          {kanbanData.map((col) => (
            <div
              key={col.id}
              style={{
                minWidth: "260px",
                maxWidth: "300px",
                flex: "1",
                background: "#f9fafb",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: col.color,
                  }}
                />
                <span style={{ fontWeight: 600, fontSize: "14px" }}>{col.title}</span>
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#e5e7eb",
                    borderRadius: "12px",
                    padding: "2px 8px",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#374151",
                  }}
                >
                  {col.candidates.length}
                </span>
              </div>
              {/* Column Cards */}
              <div
                style={{
                  padding: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  flex: 1,
                  overflowY: "auto",
                  maxHeight: "500px",
                }}
              >
                {col.candidates.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      color: "#9ca3af",
                      fontSize: "13px",
                      padding: "20px 0",
                    }}
                  >
                    Không có ứng viên
                  </p>
                ) : (
                  col.candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      style={{
                        background: "#fff",
                        borderRadius: "8px",
                        padding: "12px",
                        border: "1px solid #e5e7eb",
                        cursor: "pointer",
                        transition: "box-shadow 0.2s",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      }}
                      onClick={() => router.push(`/tuyen-dung/${candidate.id}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)"
                      }}
                    >
                      <p style={{ fontWeight: 600, fontSize: "13px", margin: "0 0 4px 0" }}>
                        {candidate.full_name}
                      </p>
                      <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 6px 0" }}>
                        {candidate.position_applied}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                          {formatDate(candidate.applied_date)}
                        </span>
                        {candidate.experience_years > 0 && (
                          <span
                            style={{
                              fontSize: "11px",
                              background: "#f3f4f6",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              color: "#4b5563",
                            }}
                          >
                            {candidate.experience_years} năm KN
                          </span>
                        )}
                      </div>
                      {candidate.license_class && (
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "6px",
                            fontSize: "11px",
                            background: "#dbeafe",
                            color: "#1d4ed8",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          Bằng lái: {candidate.license_class}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Mã UV</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Họ tên</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Vị trí</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>SĐT</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>
                  Ngày nộp
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>
                  Trạng thái
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>
                  Kinh nghiệm
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>
                  Mức lương KV
                </th>
                <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600 }}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => {
                const statusColor = STATUS_COLORS[c.status] || {
                  bg: "#f3f4f6",
                  text: "#374151",
                  border: "#d1d5db",
                }
                return (
                  <tr
                    key={c.id}
                    style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                    onClick={() => router.push(`/tuyen-dung/${c.id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f0f5ff"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff"
                    }}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 500 }}>{c.code}</td>
                    <td style={{ padding: "12px 16px" }}>{c.full_name}</td>
                    <td style={{ padding: "12px 16px" }}>{c.position_applied}</td>
                    <td style={{ padding: "12px 16px" }}>{c.phone}</td>
                    <td style={{ padding: "12px 16px" }}>{formatDate(c.applied_date)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 500,
                          background: statusColor.bg,
                          color: statusColor.text,
                          border: `1px solid ${statusColor.border}`,
                        }}
                      >
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {c.experience_years > 0 ? `${c.experience_years} năm` : "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {c.expected_salary ? formatSalary(c.expected_salary) : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button
                        style={{
                          padding: "4px 12px",
                          background: "transparent",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                          color: "#374151",
                        }}
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                )
              })}
              {candidates.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}
                  >
                    Chưa có ứng viên nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
