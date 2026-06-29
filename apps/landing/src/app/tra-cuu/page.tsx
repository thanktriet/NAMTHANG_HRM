"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Check, ChevronLeft, Clock, X, Loader2 } from "lucide-react";

interface TimelineStep {
  title: string;
  date?: string;
  status: "done" | "active" | "pending" | "failed";
}

const STATUS_ORDER = ["new", "screening", "interview", "evaluation", "offer", "hired"];
const STATUS_LABELS: Record<string, string> = {
  new: "Đã nhận hồ sơ",
  screening: "Đang đánh giá",
  interview: "Mời phỏng vấn",
  evaluation: "Chờ nhận việc",
  offer: "Chờ nhận việc",
  hired: "Đã nhận việc",
  rejected: "Không phù hợp",
};

function buildTimeline(status: string, updatedAt?: string): TimelineStep[] {
  const steps = [
    { key: "new", title: "Đã nhận hồ sơ" },
    { key: "screening", title: "Đang đánh giá" },
    { key: "interview", title: "Mời phỏng vấn" },
    { key: "evaluation", title: "Chờ nhận việc" },
    { key: "hired", title: "Đã nhận việc" },
  ];

  if (status === "rejected") {
    // Find where in the progression the rejection happened
    const currentIdx = STATUS_ORDER.indexOf(status);
    // For rejected, mark steps up to current point as done, last as failed
    return steps.map((step, i) => {
      if (i < steps.length - 1) {
        const stepIdx = STATUS_ORDER.indexOf(step.key);
        if (stepIdx < STATUS_ORDER.indexOf("rejected") || stepIdx <= 1) {
          return { title: step.title, status: "done" as const };
        }
        return { title: step.title, status: "pending" as const };
      }
      return { title: "Không phù hợp", status: "failed" as const };
    });
  }

  const currentIdx = STATUS_ORDER.indexOf(status);
  // Map "offer" to same step as "evaluation"
  const effectiveIdx = status === "offer" ? STATUS_ORDER.indexOf("evaluation") : currentIdx;

  return steps.map((step, i) => {
    const stepIdx = STATUS_ORDER.indexOf(step.key);
    // For "evaluation"/"offer", they map to index 3 in the 5-step display
    let displayIdx = i;

    if (displayIdx < getActiveDisplayIdx(status)) {
      return { title: step.title, status: "done" as const };
    } else if (displayIdx === getActiveDisplayIdx(status)) {
      return { title: step.title, date: updatedAt, status: "active" as const };
    }
    return { title: step.title, status: "pending" as const };
  });
}

function getActiveDisplayIdx(status: string): number {
  switch (status) {
    case "new": return 0;
    case "screening": return 1;
    case "interview": return 2;
    case "evaluation":
    case "offer": return 3;
    case "hired": return 4;
    default: return 0;
  }
}

export default function TraCuuPage() {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    name: string;
    code: string;
    position: string;
    status: string;
    dateSubmitted: string;
    steps: TimelineStep[];
  } | null>(null);

  const handleSearch = async () => {
    if (!code && !phone) {
      setSearched(true);
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);
    setResult(null);

    try {
      const params = new URLSearchParams();
      if (code) params.set("code", code);
      if (phone) params.set("phone", phone);

      const res = await fetch(`http://localhost:4000/api/v1/candidates/lookup?${params.toString()}`);

      if (res.status === 404) {
        setResult(null);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error("Có lỗi xảy ra khi tra cứu.");
      }

      const json = await res.json();
      const data = json.data;

      const createdDate = data.created_at
        ? new Date(data.created_at).toLocaleDateString("vi-VN")
        : "";

      const updatedDate = data.updated_at
        ? new Date(data.updated_at).toLocaleDateString("vi-VN")
        : "";

      setResult({
        name: data.full_name || "",
        code: data.code || "",
        position: data.position_applied || "",
        status: data.status || "new",
        dateSubmitted: createdDate,
        steps: buildTimeline(data.status || "new", updatedDate),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra.";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "rejected") return "Không phù hợp";
    return "Đang xử lý";
  };

  const getStatusPillClass = (status: string) => {
    if (status === "rejected") return "pill-red";
    if (status === "hired") return "pill-green";
    return "pill-blue";
  };

  return (
    <>
      {/* Header */}
      <div className="search-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 8 }}>
          <Link href="/" style={{ color: "#fff" }}>
            <ChevronLeft size={20} />
          </Link>
          <h2 style={{ margin: 0 }}>Tra cứu hồ sơ</h2>
        </div>
        <p>Nhập mã ứng tuyển và số điện thoại để kiểm tra trạng thái</p>
      </div>

      {/* Search Form */}
      <div className="search-body">
        <div className="field-group">
          <label>Mã ứng tuyển <span className="req">*</span></label>
          <input
            type="text"
            placeholder="UV-2026-000123"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div className="field-group">
          <label>Số điện thoại <span className="req">*</span></label>
          <input
            type="tel"
            placeholder="0987 654 321"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={handleSearch} disabled={loading} style={{ width: "100%" }}>
          {loading ? <Loader2 size={16} className="spinner" /> : <Search size={16} />}
          {loading ? "Đang tra cứu..." : "Tra cứu ngay"}
        </button>

        {/* Error */}
        {error && (
          <div style={{ textAlign: "center", padding: "20px", color: "#dc2626" }}>
            <p style={{ fontSize: 14, fontWeight: 600 }}>{error}</p>
          </div>
        )}

        {/* Result */}
        {searched && !loading && result && (
          <div className="result-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div className="candidate-name">{result.name}</div>
                <div className="candidate-meta">{result.code} | {result.position}</div>
              </div>
              <span className={`status-pill ${getStatusPillClass(result.status)}`}>
                <Clock size={10} /> {getStatusLabel(result.status)}
              </span>
            </div>

            <div style={{ background: "#f9fafb", borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <span style={{ fontSize: 11, color: "#9ca3af", display: "block" }}>Vị trí</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{result.position}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: "#9ca3af", display: "block" }}>Ngày nộp</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{result.dateSubmitted}</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 14 }}>
              Trạng thái hồ sơ
            </div>

            <div className="timeline">
              {result.steps.map((step, i) => (
                <div key={i} className={`timeline-item ${step.status === "active" ? "active-item" : ""}`}>
                  <div className={`timeline-dot ${step.status === "done" ? "done" : step.status === "active" ? "active" : step.status === "failed" ? "failed" : ""}`}>
                    {step.status === "done" && <Check size={10} />}
                    {step.status === "failed" && <X size={10} />}
                  </div>
                  <h4 style={step.status === "pending" ? { color: "#9ca3af" } : step.status === "failed" ? { color: "#dc2626" } : {}}>
                    {step.title}
                    {step.status === "active" && (
                      <span className="status-pill pill-blue" style={{ marginLeft: 6, fontSize: 10 }}>Hiện tại</span>
                    )}
                  </h4>
                  {step.date && <p>{step.date}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {searched && !loading && !result && !error && (
          <div style={{ textAlign: "center", padding: "32px 20px" }}>
            <Search size={40} color="#d1d5db" style={{ margin: "0 auto 12px", display: "block" }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Không tìm thấy hồ sơ</p>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>Kiểm tra lại mã ứng tuyển và số điện thoại</p>
          </div>
        )}
      </div>
    </>
  );
}
