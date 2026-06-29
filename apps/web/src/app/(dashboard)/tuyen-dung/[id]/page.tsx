"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  new: { label: "Mới nộp", color: "#6b7280" },
  screening: { label: "Sàng lọc", color: "#3b82f6" },
  interview: { label: "Phỏng vấn", color: "#8b5cf6" },
  evaluation: { label: "Đánh giá", color: "#f97316" },
  offer: { label: "Đề xuất", color: "#06b6d4" },
  hired: { label: "Nhận việc", color: "#22c55e" },
  rejected: { label: "Từ chối", color: "#ef4444" },
}

const PIPELINE_STAGES = ["new", "screening", "interview", "evaluation", "offer", "hired"]

const STATUS_TRANSITIONS: Record<string, { next: string; label: string }[]> = {
  new: [{ next: "screening", label: "Chuyển sang Sàng lọc" }],
  screening: [{ next: "interview", label: "Mời Phỏng vấn" }],
  interview: [
    { next: "evaluation", label: "Đánh giá" },
    { next: "rejected", label: "Từ chối" },
  ],
  evaluation: [
    { next: "offer", label: "Đề xuất tuyển" },
    { next: "rejected", label: "Từ chối" },
  ],
  offer: [
    { next: "hired", label: "Nhận việc" },
    { next: "rejected", label: "Từ chối" },
  ],
}

export default function CandidateDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [candidate, setCandidate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updating, setUpdating] = useState(false)

  const fetchCandidate = async () => {
    try {
      const token = localStorage.getItem("namthang_hrm_token")
      const res = await fetch(`http://localhost:4000/api/v1/candidates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Không tìm thấy ứng viên")
      const data = await res.json()
      setCandidate(data.data)
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidate()
  }, [id])

  const handleStatusChange = async (newStatus: string, actionLabel: string) => {
    const confirmMsg = `Bạn có chắc chắn muốn "${actionLabel}" cho ứng viên ${candidate?.full_name || ""}?`
    if (!window.confirm(confirmMsg)) return

    setUpdating(true)
    try {
      const token = localStorage.getItem("namthang_hrm_token")
      const res = await fetch(`http://localhost:4000/api/v1/candidates/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.message || "Cập nhật trạng thái thất bại")
      }
      const result = await res.json()
      if (result.success && result.data) {
        setCandidate(result.data)
      } else {
        await fetchCandidate()
      }
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra khi cập nhật trạng thái")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "4px solid #e5e7eb", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#6b7280" }}>Đang tải thông tin ứng viên...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p style={{ color: "#ef4444", fontSize: 16 }}>{error}</p>
        <Link href="/tuyen-dung" style={{ color: "#3b82f6", marginTop: 16, display: "inline-block" }}>
          ← Quay lại danh sách
        </Link>
      </div>
    )
  }

  const status = candidate.status || "new"
  const statusInfo = STATUS_MAP[status] || STATUS_MAP.new
  const currentStageIndex = PIPELINE_STAGES.indexOf(status)

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    padding: 24,
    marginBottom: 20,
  }

  const labelStyle: React.CSSProperties = {
    color: "#6b7280",
    fontSize: 13,
    marginBottom: 4,
  }

  const valueStyle: React.CSSProperties = {
    fontSize: 14,
    color: "#111827",
    marginBottom: 12,
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px" }}>
      {/* Back button */}
      <Link href="/tuyen-dung" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#3b82f6", textDecoration: "none", fontSize: 14, marginBottom: 20 }}>
        ← Quay lại danh sách
      </Link>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, color: "#7c3aed", fontSize: 18 }}>
          {candidate.full_name?.charAt(0) || "?"}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>{candidate.full_name}</h1>
          <span style={{ fontSize: 13, color: "#6b7280" }}>Mã: {candidate.code}</span>
        </div>
        <span style={{
          marginLeft: 12,
          padding: "4px 12px",
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 500,
          color: "#fff",
          background: statusInfo.color,
        }}>
          {statusInfo.label}
        </span>
      </div>

      {/* Two columns */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {/* Left 60% */}
        <div style={{ flex: "1 1 58%", minWidth: 320 }}>
          {/* Thong tin ca nhan */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#111827" }}>Thông tin cá nhân</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px" }}>
              <div><p style={labelStyle}>Họ và tên</p><p style={valueStyle}>{candidate.full_name || "—"}</p></div>
              <div><p style={labelStyle}>Ngày sinh</p><p style={valueStyle}>{candidate.date_of_birth || "—"}</p></div>
              <div><p style={labelStyle}>Giới tính</p><p style={valueStyle}>{candidate.gender || "—"}</p></div>
              <div><p style={labelStyle}>Số CMND/CCCD</p><p style={valueStyle}>{candidate.id_card_number || "—"}</p></div>
              <div><p style={labelStyle}>Số điện thoại</p><p style={valueStyle}>{candidate.phone || "—"}</p></div>
              <div><p style={labelStyle}>Email</p><p style={valueStyle}>{candidate.email || "—"}</p></div>
              <div><p style={labelStyle}>Địa chỉ thường trú</p><p style={valueStyle}>{candidate.permanent_address || "—"}</p></div>
              <div><p style={labelStyle}>Địa chỉ hiện tại</p><p style={valueStyle}>{candidate.current_address || "—"}</p></div>
            </div>
          </div>

          {/* Thong tin nghe nghiep */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#111827" }}>Thông tin nghề nghiệp</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px" }}>
              <div><p style={labelStyle}>Vị trí ứng tuyển</p><p style={valueStyle}>{candidate.position_applied || "—"}</p></div>
              <div><p style={labelStyle}>Số năm kinh nghiệm</p><p style={valueStyle}>{candidate.experience_years != null ? `${candidate.experience_years} năm` : "—"}</p></div>
              <div><p style={labelStyle}>Hạng bằng lái</p><p style={valueStyle}>{candidate.license_class || "—"}</p></div>
              <div><p style={labelStyle}>Mức lương mong muốn</p><p style={valueStyle}>{candidate.expected_salary ? `${Number(candidate.expected_salary).toLocaleString("vi-VN")} VNĐ` : "—"}</p></div>
              <div><p style={labelStyle}>Công ty gần nhất</p><p style={valueStyle}>{candidate.last_company || "—"}</p></div>
              <div><p style={labelStyle}>Thời gian làm việc</p><p style={valueStyle}>{candidate.work_period || "—"}</p></div>
            </div>
          </div>
        </div>

        {/* Right 40% */}
        <div style={{ flex: "1 1 38%", minWidth: 280 }}>
          {/* Trang thai timeline */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#111827" }}>Trạng thái</h2>
            {status === "rejected" && (
              <div style={{ marginBottom: 12, padding: "8px 12px", background: "#fef2f2", borderRadius: 6, border: "1px solid #fecaca" }}>
                <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 500 }}>Ứng viên đã bị từ chối</span>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PIPELINE_STAGES.map((stage, i) => {
                const info = STATUS_MAP[stage]
                const isCurrent = stage === status
                const isPast = status !== "rejected" ? i < currentStageIndex : false
                return (
                  <div key={stage} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: isPast || isCurrent ? "#fff" : "#9ca3af",
                      background: isCurrent ? info.color : isPast ? "#22c55e" : "#f3f4f6",
                      border: isCurrent ? `2px solid ${info.color}` : isPast ? "2px solid #22c55e" : "2px solid #d1d5db",
                    }}>
                      {isPast ? "✓" : i + 1}
                    </div>
                    <span style={{
                      fontSize: 14,
                      fontWeight: isCurrent ? 600 : 400,
                      color: isCurrent ? info.color : isPast ? "#111827" : "#9ca3af",
                    }}>
                      {info.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Hanh dong */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#111827" }}>Hành động</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {status !== "hired" && status !== "rejected" && (
                <>
                  {(STATUS_TRANSITIONS[status] || [])
                    .filter((t) => t.next !== "rejected")
                    .map((transition) => (
                      <button
                        key={transition.next}
                        disabled={updating}
                        onClick={() => handleStatusChange(transition.next, transition.label)}
                        style={{
                          width: "100%",
                          padding: "10px 0",
                          borderRadius: 6,
                          border: "none",
                          background: "#8b5cf6",
                          color: "#fff",
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: updating ? "not-allowed" : "pointer",
                          opacity: updating ? 0.6 : 1,
                        }}
                      >
                        {updating ? "Đang xử lý..." : transition.label}
                      </button>
                    ))}
                  {/* Reject button - always visible unless already rejected/hired */}
                  <button
                    disabled={updating}
                    onClick={() => handleStatusChange("rejected", "Từ chối")}
                    style={{
                      width: "100%",
                      padding: "10px 0",
                      borderRadius: 6,
                      border: "1px solid #ef4444",
                      background: "#fff",
                      color: "#ef4444",
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: updating ? "not-allowed" : "pointer",
                      opacity: updating ? 0.6 : 1,
                    }}
                  >
                    {updating ? "Đang xử lý..." : "Từ chối"}
                  </button>
                </>
              )}
              {(status === "hired" || status === "rejected") && (
                <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", margin: 0 }}>
                  {status === "hired" ? "Ứng viên đã nhận việc" : "Ứng viên đã bị từ chối"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
