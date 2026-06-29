"use client";

import { useState } from "react";

interface Template {
  id: string;
  name: string;
  category: string;
  fileType: string;
  description: string;
  lastModified: string;
}

const templates: Template[] = [
  {
    id: "1",
    name: "Hợp đồng lao động có thời hạn",
    category: "Hợp đồng",
    fileType: "docx",
    description: "Mẫu hợp đồng lao động có thời hạn theo quy định Bộ luật Lao động 2019",
    lastModified: "15/03/2026",
  },
  {
    id: "2",
    name: "Hợp đồng lao động không thời hạn",
    category: "Hợp đồng",
    fileType: "docx",
    description: "Mẫu hợp đồng lao động không xác định thời hạn",
    lastModified: "15/03/2026",
  },
  {
    id: "3",
    name: "Hợp đồng thử việc",
    category: "Hợp đồng",
    fileType: "docx",
    description: "Mẫu hợp đồng thử việc dành cho nhân viên mới",
    lastModified: "10/02/2026",
  },
  {
    id: "4",
    name: "Quyết định bổ nhiệm",
    category: "Quyết định",
    fileType: "docx",
    description: "Mẫu quyết định bổ nhiệm chức vụ mới",
    lastModified: "20/01/2026",
  },
  {
    id: "5",
    name: "Quyết định tăng lương",
    category: "Quyết định",
    fileType: "docx",
    description: "Mẫu quyết định điều chỉnh mức lương cho nhân viên",
    lastModified: "05/04/2026",
  },
  {
    id: "6",
    name: "Quyết định chấm dứt HĐLĐ",
    category: "Quyết định",
    fileType: "docx",
    description: "Mẫu quyết định chấm dứt hợp đồng lao động",
    lastModified: "12/03/2026",
  },
  {
    id: "7",
    name: "Biên bản bàn giao công việc",
    category: "Biên bản",
    fileType: "docx",
    description: "Mẫu biên bản bàn giao công việc khi chuyển vị trí hoặc nghỉ việc",
    lastModified: "18/02/2026",
  },
  {
    id: "8",
    name: "Biên bản họp kỷ luật",
    category: "Biên bản",
    fileType: "docx",
    description: "Mẫu biên bản cuộc họp xử lý kỷ luật lao động",
    lastModified: "22/01/2026",
  },
  {
    id: "9",
    name: "Cam kết bảo mật thông tin",
    category: "Cam kết",
    fileType: "pdf",
    description: "Mẫu cam kết bảo mật thông tin công ty dành cho nhân viên",
    lastModified: "01/01/2026",
  },
  {
    id: "10",
    name: "Cam kết không cạnh tranh",
    category: "Cam kết",
    fileType: "pdf",
    description: "Mẫu thỏa thuận không cạnh tranh sau khi nghỉ việc",
    lastModified: "01/01/2026",
  },
  {
    id: "11",
    name: "Đơn xin nghỉ phép",
    category: "Biểu mẫu",
    fileType: "docx",
    description: "Mẫu đơn xin nghỉ phép năm, nghỉ không lương",
    lastModified: "10/01/2026",
  },
  {
    id: "12",
    name: "Phiếu đánh giá thử việc",
    category: "Biểu mẫu",
    fileType: "docx",
    description: "Mẫu phiếu đánh giá kết quả thử việc của nhân viên mới",
    lastModified: "08/03/2026",
  },
];

const categories = ["Tất cả", "Hợp đồng", "Quyết định", "Biên bản", "Cam kết", "Biểu mẫu"];

const fileTypeIcons: Record<string, { icon: string; color: string }> = {
  docx: { icon: "W", color: "#2563eb" },
  pdf: { icon: "P", color: "#dc2626" },
  xlsx: { icon: "X", color: "#16a34a" },
};

export default function BieuMauPage() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const filtered =
    activeCategory === "Tất cả"
      ? templates
      : templates.filter((t) => t.category === activeCategory);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
        Biểu mẫu & Mẫu văn bản
      </h1>

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: activeCategory === cat ? 600 : 400,
              background: activeCategory === cat ? "#2563eb" : "#fff",
              color: activeCategory === cat ? "#fff" : "#374151",
              border: activeCategory === cat ? "1px solid #2563eb" : "1px solid #e5e7eb",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {filtered.map((template) => {
          const ft = fileTypeIcons[template.fileType] || { icon: "?", color: "#6b7280" };
          return (
            <div
              key={template.id}
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                padding: 20,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: ft.color + "15",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 700,
                    color: ft.color,
                  }}
                >
                  {ft.icon}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    padding: "3px 8px",
                    borderRadius: 12,
                    background: "#f3f4f6",
                    color: "#6b7280",
                    fontWeight: 500,
                  }}
                >
                  {template.fileType.toUpperCase()}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>
                  {template.name}
                </h3>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
                  {template.description}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  Cập nhật: {template.lastModified}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      background: "#eff6ff",
                      color: "#2563eb",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Xem
                  </button>
                  <button
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      background: "#2563eb",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Sử dụng
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
