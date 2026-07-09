"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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

// Nhãn hiển thị cho từng loại giấy tờ
const DOC_TYPE_LABELS: Record<string, string> = {
  cccd_front: "CCCD mặt trước",
  cccd_back: "CCCD mặt sau",
  gplx: "Giấy phép lái xe",
  cv: "Sơ yếu lý lịch",
  health_cert: "Giấy khám sức khỏe",
  portrait: "Ảnh chân dung",
  full_body: "Ảnh toàn thân",
  video: "Video xác minh",
}

// Base URL để mở file (file_path dạng /uploads/... phục vụ qua nginx của domain tuyển dụng)
const DOC_BASE = "https://tuyendung.vinfastnamthang.vn"

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
  const router = useRouter()
  const id = params.id as string
  const [candidate, setCandidate] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updating, setUpdating] = useState(false)
  const [converting, setConverting] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [depts, setDepts] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])
  const [selDept, setSelDept] = useState("b0000002-0000-0000-0000-000000000001")
  const [selPos, setSelPos] = useState("c0000006-0000-0000-0000-000000000001")
  const [selStatus, setSelStatus] = useState("probation")

  const fetchCandidate = async () => {
    try {
      const token = localStorage.getItem("namthang_hrm_token")
      const res = await fetch(`/api-proxy/api/v1/candidates/${id}`, {
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

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("namthang_hrm_token")
      const res = await fetch(`/api-proxy/api/v1/candidates/${id}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setDocuments(data.data?.items || data.items || [])
    } catch {
      // bỏ qua nếu lỗi
    }
  }

  useEffect(() => {
    fetchCandidate()
    fetchDocuments()
  }, [id])

  const handleStatusChange = async (newStatus: string, actionLabel: string) => {
    const confirmMsg = `Bạn có chắc chắn muốn "${actionLabel}" cho ứng viên ${candidate?.full_name || ""}?`
    if (!window.confirm(confirmMsg)) return

    setUpdating(true)
    try {
      const token = localStorage.getItem("namthang_hrm_token")
      const res = await fetch(`/api-proxy/api/v1/candidates/${id}/status`, {
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

  const openConvertModal = async () => {
    setShowConvertModal(true)
    try {
      const token = localStorage.getItem("namthang_hrm_token")
      const [dRes, pRes] = await Promise.all([
        fetch(`/api-proxy/api/v1/candidates/meta/departments`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api-proxy/api/v1/candidates/meta/positions`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const dJson = await dRes.json().catch(() => null)
      const pJson = await pRes.json().catch(() => null)
      setDepts(dJson?.data?.items || dJson?.items || [])
      setPositions(pJson?.data?.items || pJson?.items || [])
    } catch {
      // bỏ qua, vẫn cho tạo với mặc định
    }
  }

  const handleConvert = async () => {
    setConverting(true)
    try {
      const token = localStorage.getItem("namthang_hrm_token")
      const res = await fetch(`/api-proxy/api/v1/candidates/${id}/convert-to-employee`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ department_id: selDept, position_id: selPos, status: selStatus }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.message || "Tạo hồ sơ nhân viên thất bại")
      }
      const result = await res.json()
      const emp = result.data || result
      if (emp?.already) {
        alert("Ứng viên này đã có hồ sơ nhân viên. Đang mở hồ sơ...")
      }
      if (emp?.id) {
        router.push(`/nhan-su/${emp.id}`)
      } else {
        alert("Đã tạo hồ sơ nhân viên nhưng không lấy được mã. Vui lòng kiểm tra danh sách nhân sự.")
      }
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra khi tạo hồ sơ nhân viên")
    } finally {
      setConverting(false)
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

  // Format ngày ISO/Date -> dd/mm/yyyy (dùng UTC vì giá trị gốc là ngày thuần)
  const formatDate = (val: string) => {
    if (!val) return "—"
    // Nếu đã dạng YYYY-MM-DD thuần thì tách trực tiếp
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(val)
    if (m) return `${m[3]}/${m[2]}/${m[1]}`
    const d = new Date(val)
    if (isNaN(d.getTime())) return val
    const dd = String(d.getUTCDate()).padStart(2, "0")
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0")
    return `${dd}/${mm}/${d.getUTCFullYear()}`
  }

  // Tách "Tài xế xe 7 chỗ - VF5" -> vị trí + loại xe
  const splitPosition = (raw: string | null | undefined) => {
    const s = (raw || "").trim()
    if (!s) return { position: "—", vehicle: "—" }
    const idx = s.lastIndexOf(" - ")
    if (idx === -1) return { position: s, vehicle: "—" }
    return { position: s.slice(0, idx).trim() || "—", vehicle: s.slice(idx + 3).trim() || "—" }
  }
  const pos = splitPosition(candidate.position_applied)

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
              <div><p style={labelStyle}>Ngày sinh</p><p style={valueStyle}>{formatDate(candidate.date_of_birth)}</p></div>
              <div><p style={labelStyle}>Giới tính</p><p style={valueStyle}>{candidate.gender || "—"}</p></div>
              <div><p style={labelStyle}>Số CMND/CCCD</p><p style={valueStyle}>{candidate.id_card_number || "—"}</p></div>
              <div><p style={labelStyle}>Ngày cấp</p><p style={valueStyle}>{formatDate(candidate.id_card_date)}</p></div>
              <div><p style={labelStyle}>Nơi cấp</p><p style={valueStyle}>{candidate.id_card_place || "—"}</p></div>
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
              <div><p style={labelStyle}>Vị trí ứng tuyển</p><p style={valueStyle}>{pos.position}</p></div>
              <div><p style={labelStyle}>Loại xe</p><p style={valueStyle}>{pos.vehicle}</p></div>
              <div><p style={labelStyle}>Số năm kinh nghiệm</p><p style={valueStyle}>{candidate.experience_years != null ? `${candidate.experience_years} năm` : "—"}</p></div>
              <div><p style={labelStyle}>Hạng bằng lái</p><p style={valueStyle}>{candidate.license_class || "—"}</p></div>
              <div><p style={labelStyle}>Khu vực làm việc</p><p style={valueStyle}>{candidate.work_area || "—"}</p></div>
              <div><p style={labelStyle}>Công ty gần nhất</p><p style={valueStyle}>{candidate.last_company || "—"}</p></div>
              <div><p style={labelStyle}>Thời gian làm việc</p><p style={valueStyle}>{candidate.work_period || "—"}</p></div>
            </div>
          </div>

          {/* Giay to & Hinh anh */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#111827" }}>Giấy tờ &amp; Hình ảnh</h2>
            {documents.length === 0 ? (
              <p style={{ fontSize: 14, color: "#9ca3af" }}>Chưa có giấy tờ nào được tải lên.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                {documents.map((doc) => {
                  const label = DOC_TYPE_LABELS[doc.document_type] || doc.document_type
                  const isImage = (doc.mime_type || "").startsWith("image/")
                  const url = doc.file_path?.startsWith("http") ? doc.file_path : `${DOC_BASE}${doc.file_path}`
                  return (
                    <a
                      key={doc.id}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "block", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", textDecoration: "none", color: "#111827" }}
                    >
                      {isImage ? (
                        <img src={url} alt={label} style={{ width: "100%", height: 110, objectFit: "cover", display: "block", background: "#f3f4f6" }} />
                      ) : (
                        <div style={{ width: "100%", height: 110, display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", fontSize: 32 }}>📄</div>
                      )}
                      <div style={{ padding: "6px 8px" }}>
                        <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{label}</p>
                        <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.file_name}</p>
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
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
              {status === "hired" && (
                <button
                  disabled={converting}
                  onClick={openConvertModal}
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    borderRadius: 6,
                    border: "none",
                    background: "#22c55e",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: converting ? "not-allowed" : "pointer",
                    opacity: converting ? 0.6 : 1,
                    marginTop: 4,
                  }}
                >
                  {converting ? "Đang tạo..." : "Tạo hồ sơ nhân viên"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConvertModal && (
        <div
          onClick={() => !converting && setShowConvertModal(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 10, padding: 24, width: 420, maxWidth: "90%", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: "#111827" }}>Tạo hồ sơ nhân viên</h2>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Chọn thông tin cho nhân viên {candidate?.full_name || ""}</p>

            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Phòng ban</label>
            <select value={selDept} onChange={(e) => setSelDept(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, marginBottom: 16, background: "#fff" }}>
              {depts.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
            </select>

            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Chức vụ</label>
            <select value={selPos} onChange={(e) => setSelPos(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, marginBottom: 16, background: "#fff" }}>
              {positions.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>

            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Trạng thái</label>
            <select value={selStatus} onChange={(e) => setSelStatus(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, marginBottom: 24, background: "#fff" }}>
              <option value="probation">Thử việc</option>
              <option value="active">Chính thức</option>
              <option value="resigned">Đã nghỉ</option>
              <option value="terminated">Chấm dứt</option>
            </select>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setShowConvertModal(false)} disabled={converting} style={{ padding: "10px 18px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Huỷ</button>
              <button onClick={handleConvert} disabled={converting} style={{ padding: "10px 18px", borderRadius: 6, border: "none", background: "#22c55e", color: "#fff", fontSize: 14, fontWeight: 600, cursor: converting ? "not-allowed" : "pointer", opacity: converting ? 0.6 : 1 }}>{converting ? "Đang tạo..." : "Tạo hồ sơ"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
