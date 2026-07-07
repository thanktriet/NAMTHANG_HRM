import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin, Phone } from "lucide-react";

export default function HomePage() {
  return (
    <section className="landing-fullscreen">
      {/* Background overlay pattern */}
      <div className="landing-bg" />

      {/* Content */}
      <div className="landing-content">
        {/* Logo */}
        <div className="landing-logo">
          <Image src="/logo-NT.png" alt="Nam Thắng Group" width={120} height={80} style={{ objectFit: "contain" }} />
        </div>

        {/* Main headline */}
        <div className="landing-headline">
          <h1>Tuyển dụng<br/>Lái xe</h1>
          <p>Gia nhập đội ngũ 1500+ tài xế chuyên nghiệp. Thu nhập 15-25 triệu/tháng.</p>
        </div>

        {/* CTA Buttons */}
        <div className="landing-cta">
          <Link href="/ung-tuyen" className="cta-main">
            Ứng tuyển ngay <ChevronRight size={18} />
          </Link>
          <Link href="/tra-cuu" className="cta-sub">
            Tra cứu hồ sơ
          </Link>
        </div>

        {/* Bottom info */}
        <div className="landing-footer">
          <div className="landing-footer-item">
            <Phone size={14} />
            <span>0938 267 888</span>
          </div>
          <div className="landing-footer-item">
            <MapPin size={14} />
            <span>Toàn quốc</span>
          </div>
        </div>
      </div>
    </section>
  );
}
