"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api-proxy/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || "Đăng nhập thất bại");
        return;
      }

      // Lưu token
      localStorage.setItem("namthang_hrm_token", json.data.token);
      localStorage.setItem("namthang_hrm_user", JSON.stringify(json.data.user));
      document.cookie = `namthang_hrm_token=${json.data.token}; path=/; max-age=${60*60*24}`;

      // Redirect to dashboard
      window.location.href = "/";
    } catch (err) {
      setError("Không thể kết nối đến server. Kiểm tra lại API Gateway.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <span style={styles.logoText}>Nam Thắng</span>
          <span style={styles.badge}>HRM</span>
        </div>
        <h2 style={styles.title}>Đăng nhập hệ thống</h2>
        <p style={styles.subtitle}>Nhập thông tin tài khoản để truy cập</p>

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Tên đăng nhập</label>
            <input
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.button,
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f7fa",
    padding: 20,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "40px 32px",
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 800,
    color: "#0057FF",
  },
  badge: {
    background: "#0057FF",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    textAlign: "center" as const,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center" as const,
    marginBottom: 24,
  },
  error: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    padding: "12px 14px",
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    fontSize: 14,
    color: "#111827",
    background: "#fafafa",
    outline: "none",
    transition: "border-color 0.2s",
  },
  button: {
    padding: "14px 20px",
    background: "#0057FF",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    marginTop: 8,
    boxShadow: "0 4px 12px rgba(0,87,255,0.3)",
    transition: "all 0.2s",
  },
};
