"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  User,
  Briefcase,
  Upload,
  Camera,
  Video,
  Shield,
  Info,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const STEPS = ["Cá nhân", "Nghề nghiệp", "Giấy tờ", "Hình ảnh", "Cam kết"];

export default function UngTuyenPage() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [checks, setChecks] = useState([false, false, false, false]);
  const router = useRouter();

  const updateField = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    // Validate từng bước
    if (step === 0) {
      const required = ["hoTen", "ngaySinh", "gioiTinh", "cccd", "ngayCap", "noiCap", "diaChi", "email", "sdt"];
      const missing = required.filter((f) => !formData[f]?.trim());
      if (missing.length > 0) {
        alert("Vui lòng điền đầy đủ các trường bắt buộc (*)");
        return;
      }
      if (formData.sdt && !/^0\d{9}$/.test(formData.sdt.trim())) {
        alert("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)");
        return;
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        alert("Email không hợp lệ");
        return;
      }
      if (formData.cccd && !/^\d{12}$/.test(formData.cccd.trim())) {
        alert("Số CCCD phải có 12 chữ số");
        return;
      }
    }
    if (step === 1) {
      const required = ["viTri", "hangGPLX", "kinhNghiem", "luong"];
      const missing = required.filter((f) => !formData[f]?.trim());
      if (missing.length > 0) {
        alert("Vui lòng điền đầy đủ các trường bắt buộc (*)");
        return;
      }
    }
    // Step 2 (giấy tờ) và Step 3 (hình ảnh) - không bắt buộc validate file ở client
    // Step 4 (cam kết) - validate ở handleSubmit

    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!checks.every(Boolean)) {
      alert("Vui lòng tích vào tất cả các ô xác nhận trước khi nộp hồ sơ.");
      return;
    }
    setIsSubmitting(true);

    try {
      // Map gender
      const genderMap: Record<string, string> = { "Nam": "male", "Nữ": "female" };

      // Extract experience years as number
      const expText = formData.kinhNghiem || "";
      let experienceYears = 0;
      if (expText.includes("Trên 10")) experienceYears = 10;
      else if (expText.includes("5 - 10")) experienceYears = 5;
      else if (expText.includes("2 - 5")) experienceYears = 3;
      else if (expText.includes("1 - 2")) experienceYears = 1;
      else if (expText.includes("Dưới 1")) experienceYears = 0;

      // Format work_period from tuThang + denThang (e.g. "2020-01" → "01/2020")
      const formatMonth = (val: string) => {
        if (!val) return "";
        const [y, m] = val.split("-");
        return `${m}/${y}`;
      };
      const workPeriod = [formatMonth(formData.tuThang), formatMonth(formData.denThang)]
        .filter(Boolean)
        .join(" - ");

      // Extract salary number
      const salaryNum = (formData.luong || "").replace(/[^0-9]/g, "");

      const body = {
        full_name: formData.hoTen || "",
        date_of_birth: formData.ngaySinh || "",
        gender: genderMap[formData.gioiTinh] || "male",
        id_card_number: formData.cccd || "",
        id_card_date: formData.ngayCap || "",
        id_card_place: formData.noiCap || "",
        permanent_address: formData.diaChi || "",
        current_address: formData.diaChiHT || "",
        email: formData.email || "",
        phone: formData.sdt || "",
        position_applied: formData.viTri || "",
        license_class: (formData.hangGPLX || "").split(" - ")[0] || "",
        experience_years: experienceYears,
        last_company: formData.congTy || "",
        work_period: workPeriod,
        expected_salary: salaryNum,
      };

      const res = await fetch("http://localhost:4000/api/v1/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Có lỗi xảy ra khi nộp hồ sơ.");
      }

      const code = json.data?.code || "";
      router.push(`/ung-tuyen/thanh-cong?code=${encodeURIComponent(code)}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại.";
      alert(message);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="app-header">
        <Link href="/" className="logo-icon">
          <img src="/logo-NT.png" alt="NT" style={{ width: 28, height: 28, objectFit: "contain" }} />
        </Link>
        <div>
          <h1>Nam Thắng HRM</h1>
          <p>Form ứng tuyển lái xe</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        <div className="steps-dots">
          {STEPS.map((_, i) => (
            <span key={i} style={{ display: "contents" }}>
              <div className={`step-dot ${i < step ? "done" : i === step ? "active" : ""}`}>
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`step-line ${i < step ? "done" : ""}`} />
              )}
            </span>
          ))}
        </div>
        <div className="step-labels">
          {STEPS.map((label, i) => (
            <span key={i} className={i < step ? "done" : i === step ? "active" : ""}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Form Body */}
      <div className="step-panel" key={step}>
        {step === 0 && <Step1 data={formData} onChange={updateField} />}
        {step === 1 && <Step2 data={formData} onChange={updateField} />}
        {step === 2 && <Step3 />}
        {step === 3 && <Step4 />}
        {step === 4 && <Step5 checks={checks} setChecks={setChecks} />}
      </div>

      {/* Bottom Nav */}
      <div className="form-nav">
        {step > 0 && (
          <button className="btn btn-secondary" onClick={handlePrev}>
            <ChevronLeft size={16} /> Quay lại
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button className="btn btn-primary" onClick={handleNext}>
            Tiếp tục <ChevronRight size={16} />
          </button>
        ) : (
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={isSubmitting ? { opacity: 0.6 } : {}}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="spinner" /> Đang gửi...
              </>
            ) : (
              <>
                <Check size={16} /> Nộp hồ sơ
              </>
            )}
          </button>
        )}
      </div>
    </>
  );
}

/* ============ STEP 1: Thông tin cá nhân ============ */
function Step1({ data, onChange }: { data: Record<string, string>; onChange: (n: string, v: string) => void }) {
  return (
    <div className="form-body">
      <div className="form-title">
        <User size={18} /> Thông tin cá nhân
      </div>
      <div className="tip-box">
        <Info size={16} />
        <p>Vui lòng điền đầy đủ và chính xác theo giấy tờ tùy thân của bạn.</p>
      </div>
      <div className="field-group">
        <label>Họ và tên <span className="req">*</span></label>
        <input type="text" placeholder="Nguyễn Văn An" value={data.hoTen || ""} onChange={(e) => onChange("hoTen", e.target.value)} />
      </div>
      <div className="field-row">
        <div className="field-group">
          <label>Ngày sinh <span className="req">*</span></label>
          <input type="date" value={data.ngaySinh || ""} onChange={(e) => onChange("ngaySinh", e.target.value)} />
        </div>
        <div className="field-group">
          <label>Giới tính <span className="req">*</span></label>
          <div className="gender-toggle">
            <button type="button" className={`gender-btn ${data.gioiTinh === "Nam" ? "selected" : ""}`} onClick={() => onChange("gioiTinh", "Nam")}>Nam</button>
            <button type="button" className={`gender-btn ${data.gioiTinh === "Nữ" ? "selected" : ""}`} onClick={() => onChange("gioiTinh", "Nữ")}>Nữ</button>
          </div>
        </div>
      </div>
      <div className="field-group">
        <label>Số CCCD / CMND <span className="req">*</span></label>
        <input type="text" placeholder="012345678901" maxLength={12} value={data.cccd || ""} onChange={(e) => onChange("cccd", e.target.value)} />
      </div>
      <div className="field-row">
        <div className="field-group">
          <label>Ngày cấp <span className="req">*</span></label>
          <input type="date" value={data.ngayCap || ""} onChange={(e) => onChange("ngayCap", e.target.value)} />
        </div>
        <div className="field-group">
          <label>Nơi cấp <span className="req">*</span></label>
          <input type="text" placeholder="Cục CS QLHC..." value={data.noiCap || ""} onChange={(e) => onChange("noiCap", e.target.value)} />
        </div>
      </div>
      <div className="field-group">
        <label>Địa chỉ thường trú <span className="req">*</span></label>
        <input type="text" placeholder="Số nhà, đường, phường/xã, tỉnh/thành" value={data.diaChi || ""} onChange={(e) => onChange("diaChi", e.target.value)} />
      </div>
      <div className="field-group">
        <label>Địa chỉ hiện tại</label>
        <input type="text" placeholder="Để trống nếu giống thường trú" value={data.diaChiHT || ""} onChange={(e) => onChange("diaChiHT", e.target.value)} />
      </div>
      <div className="field-group">
        <label>Email <span className="req">*</span></label>
        <input type="email" placeholder="example@gmail.com" value={data.email || ""} onChange={(e) => onChange("email", e.target.value)} />
      </div>
      <div className="field-group">
        <label>Số điện thoại <span className="req">*</span></label>
        <input type="tel" placeholder="0987 654 321" maxLength={10} value={data.sdt || ""} onChange={(e) => onChange("sdt", e.target.value)} />
      </div>
    </div>
  );
}

/* ============ STEP 2: Nghề nghiệp ============ */
function Step2({ data, onChange }: { data: Record<string, string>; onChange: (n: string, v: string) => void }) {
  return (
    <div className="form-body">
      <div className="form-title">
        <Briefcase size={18} /> Thông tin nghề nghiệp
      </div>
      <div className="field-group">
        <label>Vị trí ứng tuyển <span className="req">*</span></label>
        <select value={data.viTri || ""} onChange={(e) => onChange("viTri", e.target.value)}>
          <option value="">-- Chọn vị trí --</option>
          <option>Lái xe tải hạng nặng (trên 10 tấn)</option>
          <option>Lái xe tải trung (5-10 tấn)</option>
          <option>Lái xe tải nhẹ (dưới 5 tấn)</option>
          <option>Lái xe container</option>
          <option>Lái xe đầu kéo</option>
          <option>Lái xe bồn</option>
        </select>
      </div>
      <div className="field-group">
        <label>Hạng GPLX hiện có <span className="req">*</span></label>
        <select value={data.hangGPLX || ""} onChange={(e) => onChange("hangGPLX", e.target.value)}>
          <option value="">-- Chọn hạng --</option>
          <option>B2 - Ô tô kinh doanh</option>
          <option>C - Xe tải dưới 11 tấn</option>
          <option>D - Xe khách dưới 30 chỗ</option>
          <option>E - Xe khách trên 30 chỗ</option>
          <option>FC - Kéo rơ moóc</option>
        </select>
      </div>
      <div className="field-group">
        <label>Kinh nghiệm lái xe <span className="req">*</span></label>
        <select value={data.kinhNghiem || ""} onChange={(e) => onChange("kinhNghiem", e.target.value)}>
          <option value="">-- Số năm kinh nghiệm --</option>
          <option>Chưa có kinh nghiệm</option>
          <option>Dưới 1 năm</option>
          <option>1 - 2 năm</option>
          <option>2 - 5 năm</option>
          <option>5 - 10 năm</option>
          <option>Trên 10 năm</option>
        </select>
      </div>
      <div className="field-group">
        <label>Công ty / Đơn vị gần nhất</label>
        <input type="text" placeholder="Tên công ty vận tải..." value={data.congTy || ""} onChange={(e) => onChange("congTy", e.target.value)} />
      </div>
      <div className="field-row">
        <div className="field-group">
          <label>Từ tháng/năm</label>
          <input type="month" value={data.tuThang || ""} onChange={(e) => onChange("tuThang", e.target.value)} />
        </div>
        <div className="field-group">
          <label>Đến tháng/năm</label>
          <input type="month" value={data.denThang || ""} onChange={(e) => onChange("denThang", e.target.value)} />
        </div>
      </div>
      <div className="field-group">
        <label>Lý do nghỉ việc</label>
        <select value={data.lyDoNghi || ""} onChange={(e) => onChange("lyDoNghi", e.target.value)}>
          <option value="">-- Chọn lý do --</option>
          <option>Mức lương không phù hợp</option>
          <option>Môi trường làm việc</option>
          <option>Cơ hội phát triển</option>
          <option>Hết hợp đồng</option>
          <option>Lý do cá nhân</option>
        </select>
      </div>
      <div className="field-group">
        <label>Mức lương mong muốn <span className="req">*</span></label>
        <input type="text" placeholder="12,000,000 VND" value={data.luong || ""} onChange={(e) => onChange("luong", e.target.value)} />
      </div>
      <div className="field-group">
        <label>Khu vực làm việc mong muốn</label>
        <select value={data.khuVuc || ""} onChange={(e) => onChange("khuVuc", e.target.value)}>
          <option value="">-- Chọn khu vực --</option>
          <option>Hà Nội</option>
          <option>TP. Hồ Chí Minh</option>
          <option>Đà Nẵng</option>
          <option>Toàn quốc</option>
          <option>Các tỉnh phía Bắc</option>
          <option>Các tỉnh phía Nam</option>
        </select>
      </div>
    </div>
  );
}

/* ============ STEP 3: Upload giấy tờ ============ */
function UploadBox({ icon, label, sub, accept }: { icon: React.ReactNode; label: string; sub: string; accept?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const inputId = `upload-${label.replace(/\s/g, '-')}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  return (
    <label htmlFor={inputId} className={`upload-box ${file ? "selected" : ""}`}>
      <input
        id={inputId}
        type="file"
        accept={accept || "image/jpeg,image/png"}
        onChange={handleChange}
        style={{ display: "none" }}
      />
      {file ? (
        <>
          <Check size={24} />
          <p style={{ color: "#10b981", fontWeight: 600 }}>{file.name}</p>
          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
        </>
      ) : (
        <>
          {icon}
          <p>{label}</p>
          <span>{sub}</span>
        </>
      )}
    </label>
  );
}

function Step3() {
  return (
    <div className="form-body">
      <div className="form-title">
        <Upload size={18} /> Upload giấy tờ
      </div>
      <div className="tip-box">
        <Info size={16} />
        <p>Ảnh chụp rõ nét, không bị mờ/cắt. Định dạng JPG, PNG. Tối đa 5MB/file.</p>
      </div>
      <div className="field-group">
        <label>CCCD mặt trước <span className="req">*</span></label>
        <UploadBox icon={<Upload size={24} />} label="Chọn ảnh CCCD mặt trước" sub="JPG, PNG - Tối đa 5MB" />
      </div>
      <div className="field-group">
        <label>CCCD mặt sau <span className="req">*</span></label>
        <UploadBox icon={<Upload size={24} />} label="Chọn ảnh CCCD mặt sau" sub="JPG, PNG - Tối đa 5MB" />
      </div>
      <div className="field-group">
        <label>Giấy phép lái xe (GPLX) <span className="req">*</span></label>
        <div className="upload-grid">
          <UploadBox icon={<Upload size={24} />} label="GPLX mặt trước" sub="Tối đa 5MB" />
          <UploadBox icon={<Upload size={24} />} label="GPLX mặt sau" sub="Tối đa 5MB" />
        </div>
      </div>
      <div className="field-group">
        <label>Sơ yếu lý lịch <span className="req">*</span></label>
        <UploadBox icon={<Upload size={24} />} label="Tải sơ yếu lý lịch" sub="PDF, DOC, JPG - Tối đa 10MB" accept="application/pdf,.doc,.docx,image/jpeg,image/png" />
      </div>
      <div className="field-group">
        <label>Giấy khám sức khỏe</label>
        <UploadBox icon={<Upload size={24} />} label="Giấy khám sức khỏe (nếu có)" sub="PDF, JPG - Tối đa 10MB" accept="application/pdf,image/jpeg,image/png" />
      </div>
    </div>
  );
}

/* ============ STEP 4: Hình ảnh & Video ============ */
function Step4() {
  return (
    <div className="form-body">
      <div className="form-title">
        <Camera size={18} /> Hình ảnh &amp; Video
      </div>
      <div className="tip-box">
        <Info size={16} />
        <p>Ảnh chân dung nên chụp nền trắng/sáng, nhìn thẳng. Video xác minh 10-15 giây.</p>
      </div>
      <div className="field-group">
        <label>Ảnh chân dung <span className="req">*</span></label>
        <UploadBox icon={<Camera size={24} />} label="Chọn ảnh chân dung" sub="JPG, PNG - Tối đa 5MB - Nên nền trắng" accept="image/jpeg,image/png" />
      </div>
      <div className="field-group">
        <label>Ảnh toàn thân <span className="req">*</span></label>
        <UploadBox icon={<Camera size={24} />} label="Chọn ảnh toàn thân" sub="JPG, PNG - Tối đa 5MB" accept="image/jpeg,image/png" />
      </div>
      <div className="field-group">
        <label>Video xác minh (10-15 giây) <span className="req">*</span></label>
        <UploadBox icon={<Video size={24} />} label="Quay/chọn video xác minh" sub="MP4, MOV - Tối đa 50MB - Đọc: Tên, ngày sinh, số CCCD" accept="video/mp4,video/quicktime,video/*" />
      </div>
    </div>
  );
}

/* ============ STEP 5: Cam kết ============ */
function Step5({ checks, setChecks }: { checks: boolean[]; setChecks: React.Dispatch<React.SetStateAction<boolean[]>> }) {
  const toggle = (i: number) => {
    setChecks((prev) => prev.map((c, idx) => (idx === i ? !c : c)));
  };

  const commitments = [
    "Tôi xác nhận tất cả thông tin và tài liệu cung cấp trong hồ sơ này là chính xác và trung thực. Tôi hiểu rằng việc cung cấp thông tin sai có thể dẫn đến từ chối hoặc chấm dứt hợp đồng lao động.",
    "Tôi đồng ý để Nam Thắng HRM sử dụng thông tin cá nhân của tôi cho mục đích tuyển dụng và quản lý nhân sự theo Chính sách bảo mật của công ty.",
    "Tôi cam kết sẽ tuân thủ nội quy, quy định của công ty Nam Thắng nếu được tuyển dụng, và sẽ không làm việc cho các công ty cạnh tranh trong thời gian làm việc.",
    "Tôi đã đọc và đồng ý với Điều khoản tuyển dụng của công ty Nam Thắng, bao gồm các quy định về thử việc, mức lương, chế độ bảo hiểm và các phúc lợi khác.",
  ];

  return (
    <div className="form-body">
      <div className="form-title">
        <Shield size={18} /> Cam kết và xác nhận
      </div>
      <div className="tip-box-warning">
        <AlertTriangle size={16} />
        <p>Vui lòng đọc kỹ và tích vào các ô xác nhận trước khi nộp hồ sơ.</p>
      </div>

      {commitments.map((text, i) => (
        <label key={i} className="checkbox-group" onClick={() => toggle(i)}>
          <input type="checkbox" checked={checks[i]} onChange={() => toggle(i)} onClick={(e) => e.stopPropagation()} />
          <p>{text}</p>
        </label>
      ))}

      <div className="time-box">
        <h5><Clock size={14} /> Thời gian xử lý</h5>
        <p>Hồ sơ của bạn sẽ được xem xét trong vòng <strong>3-5 ngày làm việc</strong>. Kết quả sẽ được thông báo qua số điện thoại và email đã đăng ký.</p>
      </div>
    </div>
  );
}
