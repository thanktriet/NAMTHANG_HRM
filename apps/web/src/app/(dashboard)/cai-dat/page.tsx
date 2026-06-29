"use client";

import { useState } from "react";

export default function CaiDatPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "Cài đặt chung" },
    { id: "account", label: "Tài khoản" },
    { id: "roles", label: "Phân quyền" },
    { id: "system", label: "Hệ thống" },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 24 }}>Cài đặt</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e5e7eb", marginBottom: 24 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? "#0057FF" : "#6b7280",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #0057FF" : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "general" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Thông tin công ty</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Tên công ty</label>
              <input defaultValue="Tập đoàn Nam Thắng" style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Mã số thuế</label>
              <input defaultValue="0123456789" style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Email</label>
              <input defaultValue="info@namthang.vn" style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Hotline</label>
              <input defaultValue="1900 xxxx" style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14 }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Địa chỉ</label>
              <input defaultValue="123 Đường ABC, Kiên Giang" style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14 }} />
            </div>
          </div>
          <button style={{ marginTop: 20, padding: "10px 24px", background: "#0057FF", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Lưu thay đổi
          </button>
        </div>
      )}

      {activeTab === "account" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Tài khoản của tôi</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Tên đăng nhập</label>
              <input defaultValue="admin" disabled style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, background: "#f9fafb" }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Họ tên</label>
              <input defaultValue="Quản trị viên" style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Mật khẩu mới</label>
              <input type="password" placeholder="Nhập mật khẩu mới" style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Xác nhận mật khẩu</label>
              <input type="password" placeholder="Nhập lại mật khẩu" style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14 }} />
            </div>
          </div>
          <button style={{ marginTop: 20, padding: "10px 24px", background: "#0057FF", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Cập nhật
          </button>
        </div>
      )}

      {activeTab === "roles" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Phân quyền người dùng</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#6b7280" }}>Vai trò</th>
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#6b7280" }}>Mô tả</th>
                <th style={{ padding: "10px 16px", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#6b7280" }}>Số người dùng</th>
              </tr>
            </thead>
            <tbody>
              {[
                { role: "Super Admin", desc: "Toàn quyền hệ thống", count: 1 },
                { role: "HR Manager", desc: "Quản lý nhân sự, tuyển dụng", count: 2 },
                { role: "Accountant", desc: "Quản lý lương, hợp đồng", count: 3 },
                { role: "Dispatcher", desc: "Điều động xe, quản lý tài xế", count: 2 },
                { role: "Employee", desc: "Xem thông tin cá nhân", count: 15 },
              ].map((r) => (
                <tr key={r.role} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500 }}>{r.role}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{r.desc}</td>
                  <td style={{ padding: "12px 16px", fontSize: 14, textAlign: "center" }}>{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "system" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Thông tin hệ thống</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {[
              { label: "Phiên bản", value: "Nam Thắng HRM v1.0.0" },
              { label: "Backend", value: "NestJS + PostgreSQL" },
              { label: "Frontend", value: "Next.js 15" },
              { label: "Database", value: "PostgreSQL 18 - localhost:5432" },
              { label: "API Gateway", value: "http://localhost:4000" },
              { label: "Trạng thái", value: "🟢 Hoạt động" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ width: 160, fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{item.label}</span>
                <span style={{ fontSize: 14, color: "#111827" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
