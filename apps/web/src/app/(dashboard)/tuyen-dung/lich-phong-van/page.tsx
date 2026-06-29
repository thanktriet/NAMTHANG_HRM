"use client"

import { useState } from "react"

interface InterviewToday {
  time: string
  candidate: string
  position: string
  location: string
  status: "sap_dien_ra" | "dang_pv" | "cho_xac_nhan"
}

interface InterviewUpcoming {
  id: string
  datetime: string
  candidate: string
  position: string
  location: string
  interviewer: string
  status: "da_xac_nhan" | "cho_xac_nhan" | "da_huy"
}

const todayInterviews: InterviewToday[] = [
  { time: "09:00", candidate: "Nguyễn Thanh Sơn", position: "Tài xế", location: "Phòng họp A", status: "sap_dien_ra" },
  { time: "10:30", candidate: "Lê Văn Tiến", position: "Tài xế", location: "Phòng họp B", status: "dang_pv" },
  { time: "14:00", candidate: "Trần Thị Thuỷ", position: "NV Kinh doanh", location: "Online", status: "cho_xac_nhan" },
]

const upcomingInterviews: InterviewUpcoming[] = [
  { id: "1", datetime: "23/06/2026 09:00", candidate: "Phạm Văn Hùng", position: "Tài xế", location: "Phòng họp A", interviewer: "Nguyễn Văn Minh", status: "da_xac_nhan" },
  { id: "2", datetime: "23/06/2026 14:00", candidate: "Hoàng Thị Lan", position: "NV Kế toán", location: "Online", interviewer: "Trần Thị Hoa", status: "cho_xac_nhan" },
  { id: "3", datetime: "24/06/2026 10:00", candidate: "Võ Minh Tuấn", position: "Tài xế", location: "Phòng họp B", interviewer: "Lê Quang Đạt", status: "da_xac_nhan" },
  { id: "4", datetime: "25/06/2026 08:30", candidate: "Đặng Thị Mai", position: "NV Nhân sự", location: "Phòng họp A", interviewer: "Nguyễn Văn Minh", status: "da_huy" },
  { id: "5", datetime: "26/06/2026 15:00", candidate: "Bùi Quốc Bảo", position: "Lái xe tải", location: "Online", interviewer: "Trần Thị Hoa", status: "cho_xac_nhan" },
]

const STATUS_TODAY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  sap_dien_ra: { label: "Sắp diễn ra", bg: "#dbeafe", text: "#1d4ed8" },
  dang_pv: { label: "Đang PV", bg: "#ffedd5", text: "#c2410c" },
  cho_xac_nhan: { label: "Chờ xác nhận", bg: "#f3f4f6", text: "#4b5563" },
}

const STATUS_UPCOMING_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  da_xac_nhan: { label: "Đã xác nhận", bg: "#dcfce7", text: "#15803d" },
  cho_xac_nhan: { label: "Chờ xác nhận", bg: "#fef9c3", text: "#a16207" },
  da_huy: { label: "Đã hủy", bg: "#fee2e2", text: "#b91c1c" },
}

const weekDays = [
  { label: "T2", date: "16/06", hasInterview: false },
  { label: "T3", date: "17/06", hasInterview: false },
  { label: "T4", date: "18/06", hasInterview: true },
  { label: "T5", date: "19/06", hasInterview: false },
  { label: "T6", date: "20/06", hasInterview: true },
  { label: "T7", date: "21/06", hasInterview: false },
  { label: "CN", date: "22/06", hasInterview: false },
]

const candidateOptions = [
  "Nguyễn Thanh Sơn",
  "Lê Văn Tiến",
  "Trần Thị Thuỷ",
  "Phạm Văn Hùng",
  "Hoàng Thị Lan",
  "Võ Minh Tuấn",
  "Đặng Thị Mai",
  "Bùi Quốc Bảo",
]

export default function LichPhongVanPage() {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    candidate: "",
    datetime: "",
    location: "",
    interviewer: "",
    note: "",
  })

  const handleSubmit = () => {
    if (!form.candidate || !form.datetime || !form.location || !form.interviewer) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }
    alert("Tính năng đang phát triển")
    setShowModal(false)
    setForm({ candidate: "", datetime: "", location: "", interviewer: "", note: "" })
  }

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a
            href="/tuyen-dung"
            style={{ color: "#6366f1", textDecoration: "none", fontSize: 14, display: "flex", alignItems: "center", gap: 4 }}
          >
            ← Quay lại
          </a>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", margin: 0 }}>Lịch phỏng vấn</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          + Lên lịch PV
        </button>
      </div>

      {/* Calendar mini view */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        padding: "16px 24px",
        marginBottom: 24,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 12 }}>Tuần 16/06 - 22/06/2026</div>
        <div style={{ display: "flex", gap: 0 }}>
          {weekDays.map((day) => (
            <div
              key={day.date}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "8px 0",
                borderRadius: 8,
                backgroundColor: day.date === "20/06" ? "#eef2ff" : "transparent",
                border: day.date === "20/06" ? "2px solid #6366f1" : "2px solid transparent",
              }}
            >
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{day.label}</div>
              <div style={{ fontSize: 14, fontWeight: day.date === "20/06" ? 700 : 500, color: day.date === "20/06" ? "#6366f1" : "#1e293b" }}>
                {day.date.split("/")[0]}
              </div>
              {day.hasInterview && (
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#6366f1", margin: "4px auto 0" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Today's interviews */}
      <div style={{
        background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        border: "1px solid #c7d2fe",
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#3730a3", margin: "0 0 16px 0" }}>
          Hôm nay - 20/06/2026
        </h2>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {todayInterviews.map((item, idx) => {
            const statusConfig = STATUS_TODAY_CONFIG[item.status]
            return (
              <div
                key={idx}
                style={{
                  flex: "1 1 280px",
                  background: "#fff",
                  borderRadius: 10,
                  padding: 16,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#6366f1" }}>{item.time}</span>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor: statusConfig.bg,
                    color: statusConfig.text,
                  }}>
                    {statusConfig.label}
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>{item.candidate}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 2 }}>{item.position}</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>📍 {item.location}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming interviews */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        padding: 24,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: "0 0 16px 0" }}>Sắp tới</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                {["Ngày giờ", "Ứng viên", "Vị trí", "Địa điểm", "Người PV", "Trạng thái", "Hành động"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 8px", color: "#64748b", fontWeight: 600, fontSize: 13 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {upcomingInterviews.map((item) => {
                const statusConfig = STATUS_UPCOMING_CONFIG[item.status]
                return (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 8px", fontWeight: 500 }}>{item.datetime}</td>
                    <td style={{ padding: "12px 8px", fontWeight: 600, color: "#1e293b" }}>{item.candidate}</td>
                    <td style={{ padding: "12px 8px", color: "#475569" }}>{item.position}</td>
                    <td style={{ padding: "12px 8px", color: "#475569" }}>{item.location}</td>
                    <td style={{ padding: "12px 8px", color: "#475569" }}>{item.interviewer}</td>
                    <td style={{ padding: "12px 8px" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: statusConfig.bg,
                        color: statusConfig.text,
                      }}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => alert("Tính năng đang phát triển")}
                          style={{
                            padding: "4px 12px",
                            fontSize: 12,
                            border: "1px solid #e2e8f0",
                            borderRadius: 6,
                            background: "#fff",
                            color: "#475569",
                            cursor: "pointer",
                            fontWeight: 500,
                          }}
                        >
                          Xem
                        </button>
                        <button
                          onClick={() => alert("Tính năng đang phát triển")}
                          style={{
                            padding: "4px 12px",
                            fontSize: 12,
                            border: "1px solid #fecaca",
                            borderRadius: 6,
                            background: "#fff",
                            color: "#b91c1c",
                            cursor: "pointer",
                            fontWeight: 500,
                          }}
                        >
                          Hủy
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 16,
            padding: 32,
            width: "100%",
            maxWidth: 500,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: "0 0 24px 0" }}>Lên lịch phỏng vấn</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                Ứng viên <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                value={form.candidate}
                onChange={(e) => setForm({ ...form, candidate: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 14,
                  color: "#1e293b",
                  backgroundColor: "#fff",
                }}
              >
                <option value="">-- Chọn ứng viên --</option>
                {candidateOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                Ngày giờ <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="datetime-local"
                value={form.datetime}
                onChange={(e) => setForm({ ...form, datetime: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 14,
                  color: "#1e293b",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                Địa điểm <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Phòng họp A, Online..."
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 14,
                  color: "#1e293b",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                Người phỏng vấn <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Nguyễn Văn Minh"
                value={form.interviewer}
                onChange={(e) => setForm({ ...form, interviewer: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 14,
                  color: "#1e293b",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                Ghi chú
              </label>
              <textarea
                placeholder="Ghi chú thêm..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 14,
                  color: "#1e293b",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                onClick={() => {
                  setShowModal(false)
                  setForm({ candidate: "", datetime: "", location: "", interviewer: "", note: "" })
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "#6366f1",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Lên lịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
