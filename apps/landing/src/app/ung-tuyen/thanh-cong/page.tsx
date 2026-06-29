"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Copy, Search, Clock, ChevronRight } from "lucide-react";

export default function ThanhCongPage() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const applicationCode = searchParams.get("code") || "UV-2026-000123";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(applicationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = applicationCode;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="app-header">
        <div className="logo-icon">
          <Check size={18} color="#fff" />
        </div>
        <div>
          <h1>Nam Thắng HRM</h1>
          <p>Kết quả nộp hồ sơ</p>
        </div>
      </div>

      {/* Success Card */}
      <div className="success-card">
        <div className="success-icon">
          <Check size={36} color="#fff" />
        </div>
        <h2>Nộp hồ sơ thành công!</h2>
        <p>Cảm ơn bạn đã nộp hồ sơ ứng tuyển. Chúng tôi sẽ xem xét và liên hệ bạn sớm nhất có thể.</p>

        <div className="code-box">
          <p>Mã ứng tuyển của bạn</p>
          <div className="code">{applicationCode}</div>
          <p style={{ fontSize: 11, color: "#6b7280", marginTop: 6 }}>
            Lưu lại mã này để tra cứu trạng thái hồ sơ
          </p>
        </div>

        {/* Action buttons */}
        <div className="btn-row">
          <Link href="/tra-cuu" className="btn btn-outline">
            <Search size={16} /> Tra cứu hồ sơ
          </Link>
          <button className="btn btn-secondary" onClick={handleCopy} style={{ minWidth: "unset", flex: 1 }}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Đã chép" : "Sao chép mã"}
          </button>
        </div>

        {/* Next steps */}
        <div className="next-steps">
          <h4><Clock size={14} /> Bước tiếp theo</h4>
          <div className="next-step-item">
            <div className="next-step-num">1</div>
            <span>Hồ sơ được xem xét trong 3-5 ngày làm việc</span>
          </div>
          <div className="next-step-item">
            <div className="next-step-num">2</div>
            <span>Nhận thông báo qua SMS / Email</span>
          </div>
          <div className="next-step-item">
            <div className="next-step-num">3</div>
            <span>Phỏng vấn và ký hợp đồng</span>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="form-nav">
        <Link href="/" className="btn btn-primary" style={{ textDecoration: "none" }}>
          Quay về trang chủ <ChevronRight size={16} />
        </Link>
      </div>
    </>
  );
}
