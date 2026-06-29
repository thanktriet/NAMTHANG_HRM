"use client"

import { useState } from "react"

interface JobPosting {
  id: string
  title: string
  position: string
  branch: string
  quantity: number
  posted_date: string
  deadline: string
  status: "active" | "closed" | "draft"
}

const SAMPLE_DATA: JobPosting[] = [
  {
    id: "1",
    title: "Tuyển lái xe tải hạng nặng - Kiên Giang",
    position: "Lái xe tải",
    branch: "Chi nhánh Kiên Giang",
    quantity: 5,
    posted_date: "2024-12-01",
    deadline: "2025-01-15",
    status: "active",
  },
  {
    id: "2",
    title: "Tuyển lái xe container - TP.HCM",
    position: "Lái xe container",
    branch: "Chi nhánh TP.HCM",
    quantity: 3,
    posted_date: "2024-12-05",
    deadline: "2025-01-20",
    status: "active",
  },
  {
    id: "3",
    title: "Tuyển lái xe đầu kéo - Cần Thơ",
    position: "Lái xe đầu kéo",
    branch: "Chi nhánh Cần Thơ",
    quantity: 2,
    posted_date: "2024-12-10",
    deadline: "2025-01-25",
    status: "active",
  },
  {
    id: "4",
    title: "Tuyển nhân viên kế toán",
    position: "Nhân viên kế toán",
    branch: "Trụ sở chính",
    quantity: 1,
    posted_date: "2024-11-01",
    deadline: "2024-12-01",
    status: "closed",
  },
  {
    id: "5",
    title: "Tuyển nhân viên kinh doanh - Hà Nội",
    position: "Nhân viên kinh doanh",
    branch: "Chi nhánh Hà Nội",
    quantity: 2,
    posted_date: "",
    deadline: "2025-02-01",
    status: "draft",
  },
]

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  active: { label: "Đang tuyển", bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" },
  closed: { label: "Đã đóng", bg: "#fee2e2", text: "#b91c1c", border: "#fecaca" },
  draft: { label: "Nháp", bg: "#f3f4f6", text: "#374151", border: "#d1d5db" },
}

const POSITIONS = [
  "Lái xe tải",
  "Lái xe container",
  "Lái xe đầu kéo",
  "Nhân viên kế toán",
  "Nhân viên kinh doanh",
  "Nhân viên kho",
  "Nhân viên hành chính",
]

const BRANCHES = [
  "Trụ sở chính",
  "Chi nhánh TP.HCM",
  "Chi nhánh Hà Nội",
  "Chi nhánh Kiên Giang",
  "Chi nhánh Cần Thơ",
  "Chi nhánh Đà Nẵng",
]

function formatDate(dateStr: string): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export default function JobPostingsPage() {
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    position: "",
    branch: "",
    quantity: 1,
    description: "",
    requirements: "",
    salary_min: "",
    salary_max: "",
    deadline: "",
  })

  const postings = SAMPLE_DATA

  const statsData = [
    {
      label: "Tổng tin đăng",
      value: postings.length,
      icon: "📄",
      bgColor: "#dbeafe",
      textColor: "#1d4ed8",
    },
    {
      label: "Đang tuyển",
      value: postings.filter((p) => p.status === "active").length,
      icon: "✅",
      bgColor: "#dcfce7",
      textColor: "#15803d",
    },
    {
      label: "Đã đóng",
      value: postings.filter((p) => p.status === "closed").length,
      icon: "🚫",
      bgColor: "#fee2e2",
      textColor: "#b91c1c",
    },
    {
      label: "Nháp",
      value: postings.filter((p) => p.status === "draft").length,
      icon: "📝",
      bgColor: "#f3f4f6",
      textColor: "#374151",
    },
  ]

  const handleSubmit = (type: "draft" | "publish") => {
    alert("Tính năng đang phát triển")
    setShowModal(false)
  }

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Back link */}
      <a
        href="/tuyen-dung"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "#2563eb",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 500,
        }}
      >
        ← Quay lại Tuyển dụng
      </a>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Tin tuyển dụng</h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 20px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          + Tạo tin mới
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {statsData.map((stat) => (
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
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                background: stat.bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: "22px", fontWeight: 700, margin: 0, color: stat.textColor }}>
                {stat.value}
              </p>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Tiêu đề</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Vị trí</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Chi nhánh</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600 }}>Số lượng</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Ngày đăng</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Hạn nộp</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Trạng thái</th>
              <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {postings.map((posting) => {
              const statusCfg = STATUS_CONFIG[posting.status]
              return (
                <tr
                  key={posting.id}
                  style={{ borderBottom: "1px solid #f3f4f6" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f0f5ff"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff"
                  }}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 500, maxWidth: "280px" }}>
                    {posting.title}
                  </td>
                  <td style={{ padding: "12px 16px" }}>{posting.position}</td>
                  <td style={{ padding: "12px 16px" }}>{posting.branch}</td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>{posting.quantity}</td>
                  <td style={{ padding: "12px 16px" }}>{formatDate(posting.posted_date)}</td>
                  <td style={{ padding: "12px 16px" }}>{formatDate(posting.deadline)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 500,
                        background: statusCfg.bg,
                        color: statusCfg.text,
                        border: `1px solid ${statusCfg.border}`,
                      }}
                    >
                      {statusCfg.label}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button
                        style={{
                          padding: "4px 10px",
                          background: "transparent",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                          color: "#2563eb",
                        }}
                        onClick={() => alert("Tính năng đang phát triển")}
                      >
                        Xem
                      </button>
                      <button
                        style={{
                          padding: "4px 10px",
                          background: "transparent",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                          color: "#374151",
                        }}
                        onClick={() => alert("Tính năng đang phát triển")}
                      >
                        Sửa
                      </button>
                      {posting.status === "active" && (
                        <button
                          style={{
                            padding: "4px 10px",
                            background: "transparent",
                            border: "1px solid #fecaca",
                            borderRadius: "6px",
                            fontSize: "12px",
                            cursor: "pointer",
                            color: "#b91c1c",
                          }}
                          onClick={() => alert("Tính năng đang phát triển")}
                        >
                          Đóng
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false)
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "32px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>Tạo tin tuyển dụng</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#6b7280",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Tiêu đề */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
                  Tiêu đề <span style={{ color: "#b91c1c" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Tuyển lái xe tải hạng nặng..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Vị trí + Chi nhánh */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
                    Vị trí <span style={{ color: "#b91c1c" }}>*</span>
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                      background: "#fff",
                    }}
                  >
                    <option value="">-- Chọn vị trí --</option>
                    {POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
                    Chi nhánh <span style={{ color: "#b91c1c" }}>*</span>
                  </label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                      background: "#fff",
                    }}
                  >
                    <option value="">-- Chọn chi nhánh --</option>
                    {BRANCHES.map((br) => (
                      <option key={br} value={br}>
                        {br}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Số lượng + Hạn nộp */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
                    Số lượng <span style={{ color: "#b91c1c" }}>*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
                    Hạn nộp
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
                  Mô tả công việc
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết công việc..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Yêu cầu */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
                  Yêu cầu ứng viên
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="VD: Bằng lái hạng C, kinh nghiệm 2 năm..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Mức lương */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
                    Mức lương tối thiểu
                  </label>
                  <input
                    type="text"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                    placeholder="VD: 10000000"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
                    Mức lương tối đa
                  </label>
                  <input
                    type="text"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                    placeholder="VD: 15000000"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                  marginTop: "8px",
                  paddingTop: "16px",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 20px",
                    background: "#fff",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    cursor: "pointer",
                    color: "#374151",
                  }}
                >
                  Huỷ
                </button>
                <button
                  onClick={() => handleSubmit("draft")}
                  style={{
                    padding: "10px 20px",
                    background: "#f3f4f6",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    color: "#374151",
                  }}
                >
                  Lưu nháp
                </button>
                <button
                  onClick={() => handleSubmit("publish")}
                  style={{
                    padding: "10px 20px",
                    background: "#2563eb",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    color: "#fff",
                  }}
                >
                  Đăng tin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
