"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DateSelect } from "@/components/ui/date-select";
import { MonthSelect } from "@/components/ui/month-select";
import {
  Truck,
  User,
  Briefcase,
  Upload,
  Camera,
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

// Loại xe khả dụng theo vị trí ứng tuyển
const VEHICLE_BY_POSITION: Record<string, string[]> = {
  "Tài xế xe 5 chỗ": ["VF5", "VF6"],
  "Tài xế xe 7 chỗ": ["Limo Green"],
  "Tài xế xe bus": ["Xe bus"],
};

// API qua nginx proxy (/api-proxy/ -> gateway). Chạy được cả trên production lẫn khi truy cập qua domain.
const API_BASE = "/api-proxy/api/v1";

export default function UngTuyenPage() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [checks, setChecks] = useState([false, false, false, false]);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const router = useRouter();

  // Giữ File thật để upload (KHÔNG lưu vào formData/localStorage)
  const filesRef = useRef<Record<string, File>>({});
  const setFile = (name: string, file: File) => {
    filesRef.current[name] = file;
  };

  const DRAFT_KEY = "nthrm_ung_tuyen_draft";

  // Khôi phục bản nháp khi vào lại (chạy ngầm, không thông báo)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.formData) setFormData(draft.formData);
        if (typeof draft.step === "number") setStep(draft.step);
      }
    } catch {
      // bỏ qua nếu localStorage lỗi
    }
    setDraftLoaded(true);
  }, []);

  // Tự động lưu nháp mỗi khi dữ liệu hoặc bước thay đổi
  useEffect(() => {
    if (!draftLoaded) return; // chỉ lưu sau khi đã khôi phục xong
    try {
      const hasData = Object.values(formData).some((v) => v && v.trim());
      if (hasData) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData, step }));
      }
    } catch {
      // bỏ qua
    }
  }, [formData, step, draftLoaded]);

  const updateField = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    // Validate từng bước
    if (step === 0) {
      const required = ["hoTen", "ngaySinh", "gioiTinh", "cccd", "ngayCap", "noiCap", "diaChi", "sdt"];
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
      const required = ["viTri", "loaiXe", "hangGPLX", "kinhNghiem", "khuVuc"];
      const missing = required.filter((f) => !formData[f]?.trim());
      if (missing.length > 0) {
        alert("Vui lòng điền đầy đủ các trường bắt buộc (*)");
        return;
      }
    }
    if (step === 2) {
      const requiredFiles: [string, string][] = [
        ["fileCccdTruoc", "Ảnh CCCD mặt trước"],
        ["fileCccdSau", "Ảnh CCCD mặt sau"],
        ["fileGplxTruoc", "GPLX mặt trước"],
        ["fileGplxSau", "GPLX mặt sau"],
        ["fileSoYeuLyLich", "Sơ yếu lý lịch"],
        ["fileGiayKhamSK", "Giấy khám sức khỏe"],
      ];
      const missingFiles = requiredFiles.filter(([f]) => !filesRef.current[f]);
      if (missingFiles.length > 0) {
        alert("Vui lòng tải lên đầy đủ giấy tờ bắt buộc:\n- " + missingFiles.map(([, l]) => l).join("\n- "));
        return;
      }
    }
    // Step 3 (hình ảnh) - không bắt buộc validate file ở client
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
        position_applied: [formData.viTri, formData.loaiXe].filter(Boolean).join(" - "),
        license_class: (formData.hangGPLX || "").split(" - ")[0] || "",
        experience_years: experienceYears,
        last_company: formData.congTy || "",
        work_period: workPeriod,
        work_area: formData.khuVuc || "",
      };

      const res = await fetch(`${API_BASE}/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Có lỗi xảy ra khi nộp hồ sơ.");
      }

      const candidateId = json.data?.id || "";
      const code = json.data?.code || "";

      // Upload giấy tờ/ảnh (nếu có)
      const files = filesRef.current;
      const fileEntries = Object.entries(files);
      if (candidateId && fileEntries.length > 0) {
        // Map tên field -> document_type enum của backend
        const typeMap: Record<string, string> = {
          fileCccdTruoc: "cccd_front",
          fileCccdSau: "cccd_back",
          fileGplxTruoc: "gplx",
          fileGplxSau: "gplx",
          fileSoYeuLyLich: "cv",
          fileGiayKhamSK: "health_cert",
          filePortrait: "portrait",
          fileFullBody: "full_body",
        };
        const fd = new FormData();
        for (const [name, file] of fileEntries) {
          fd.append("files", file);
          fd.append("types", typeMap[name] || "cv");
        }
        const uploadRes = await fetch(`${API_BASE}/candidates/${candidateId}/documents`, {
          method: "POST",
          body: fd,
        });
        if (!uploadRes.ok) {
          throw new Error("Nộp thông tin thành công nhưng tải giấy tờ thất bại. Vui lòng liên hệ để bổ sung.");
        }
      }

      // Xoá nháp sau khi nộp thành công toàn bộ
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        // bỏ qua
      }

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
        {step === 2 && <Step3 onFile={setFile} />}
        {step === 3 && <Step4 onFile={setFile} />}
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
      <div className="field-group">
        <label>Ngày sinh <span className="req">*</span></label>
        <DateSelect value={data.ngaySinh || ""} onChange={(v) => onChange("ngaySinh", v)} fromYear={1960} toYear={new Date().getFullYear() - 16} />
      </div>
      <div className="field-group">
        <label>Giới tính <span className="req">*</span></label>
        <div className="gender-toggle">
          <button type="button" className={`gender-btn ${data.gioiTinh === "Nam" ? "selected" : ""}`} onClick={() => onChange("gioiTinh", "Nam")}>Nam</button>
          <button type="button" className={`gender-btn ${data.gioiTinh === "Nữ" ? "selected" : ""}`} onClick={() => onChange("gioiTinh", "Nữ")}>Nữ</button>
        </div>
      </div>
      <div className="field-group">
        <label>Số CCCD / CMND <span className="req">*</span></label>
        <input type="text" placeholder="012345678901" maxLength={12} value={data.cccd || ""} onChange={(e) => onChange("cccd", e.target.value)} />
      </div>
      <div className="field-group">
        <label>Ngày cấp <span className="req">*</span></label>
        <DateSelect value={data.ngayCap || ""} onChange={(v) => onChange("ngayCap", v)} fromYear={2016} toYear={new Date().getFullYear()} />
      </div>
      <div className="field-group">
        <label>Nơi cấp <span className="req">*</span></label>
        <input type="text" placeholder="Cục CS QLHC..." value={data.noiCap || ""} onChange={(e) => onChange("noiCap", e.target.value)} />
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
        <label>Email</label>
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
      <div className="field-row">
        <div className="field-group">
          <label>Vị trí ứng tuyển <span className="req">*</span></label>
          <select
            value={data.viTri || ""}
            onChange={(e) => {
              onChange("viTri", e.target.value);
              // Đổi vị trí thì reset loại xe (danh sách loại xe phụ thuộc vị trí)
              onChange("loaiXe", "");
            }}
          >
            <option value="">-- Chọn vị trí --</option>
            <option>Tài xế xe 5 chỗ</option>
            <option>Tài xế xe 7 chỗ</option>
            <option>Tài xế xe bus</option>
          </select>
        </div>
        <div className="field-group">
          <label>Loại xe <span className="req">*</span></label>
          <select
            value={data.loaiXe || ""}
            onChange={(e) => onChange("loaiXe", e.target.value)}
            disabled={!data.viTri}
          >
            <option value="">{data.viTri ? "-- Chọn loại xe --" : "-- Chọn vị trí trước --"}</option>
            {(VEHICLE_BY_POSITION[data.viTri || ""] || []).map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
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
          <MonthSelect value={data.tuThang || ""} onChange={(v) => onChange("tuThang", v)} fromYear={1990} />
        </div>
        <div className="field-group">
          <label>Đến tháng/năm</label>
          <MonthSelect value={data.denThang || ""} onChange={(v) => onChange("denThang", v)} fromYear={1990} />
        </div>
      </div>
      <div className="field-group">
        <label>Khu vực làm việc mong muốn <span className="req">*</span></label>
        <select value={data.khuVuc || ""} onChange={(e) => onChange("khuVuc", e.target.value)}>
          <option value="">-- Chọn khu vực --</option>
          <option>Rạch Giá</option>
          <option>Phú Quốc</option>
          <option>An Giang</option>
          <option>Cần Thơ</option>
          <option>Sóc Trăng</option>
          <option>Cà Mau</option>
        </select>
      </div>
    </div>
  );
}

/* ============ STEP 3: Upload giấy tờ ============ */
function UploadBox({ icon, label, sub, accept, name, onFile }: { icon: React.ReactNode; label: string; sub: string; accept?: string; name?: string; onFile?: (name: string, file: File) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const inputId = `upload-${label.replace(/\s/g, '-')}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (name && onFile) onFile(name, f);
    }
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

function Step3({ onFile }: { onFile: (name: string, file: File) => void }) {
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
        <UploadBox icon={<Upload size={24} />} label="Chọn ảnh CCCD mặt trước" sub="JPG, PNG - Tối đa 5MB" name="fileCccdTruoc" onFile={onFile} />
      </div>
      <div className="field-group">
        <label>CCCD mặt sau <span className="req">*</span></label>
        <UploadBox icon={<Upload size={24} />} label="Chọn ảnh CCCD mặt sau" sub="JPG, PNG - Tối đa 5MB" name="fileCccdSau" onFile={onFile} />
      </div>
      <div className="field-group">
        <label>Giấy phép lái xe (GPLX) <span className="req">*</span></label>
        <div className="upload-grid">
          <UploadBox icon={<Upload size={24} />} label="GPLX mặt trước" sub="Tối đa 5MB" name="fileGplxTruoc" onFile={onFile} />
          <UploadBox icon={<Upload size={24} />} label="GPLX mặt sau" sub="Tối đa 5MB" name="fileGplxSau" onFile={onFile} />
        </div>
      </div>
      <div className="field-group">
        <label>Sơ yếu lý lịch <span className="req">*</span></label>
        <UploadBox icon={<Upload size={24} />} label="Tải sơ yếu lý lịch" sub="PDF, DOC, JPG - Tối đa 10MB" accept="application/pdf,.doc,.docx,image/jpeg,image/png" name="fileSoYeuLyLich" onFile={onFile} />
      </div>
      <div className="field-group">
        <label>Giấy khám sức khỏe <span className="req">*</span></label>
        <UploadBox icon={<Upload size={24} />} label="Tải giấy khám sức khỏe" sub="PDF, JPG - Tối đa 10MB" accept="application/pdf,image/jpeg,image/png" name="fileGiayKhamSK" onFile={onFile} />
      </div>
    </div>
  );
}

/* ============ STEP 4: Hình ảnh ============ */
function Step4({ onFile }: { onFile: (name: string, file: File) => void }) {
  return (
    <div className="form-body">
      <div className="form-title">
        <Camera size={18} /> Hình ảnh
      </div>
      <div className="tip-box">
        <Info size={16} />
        <p>Ảnh chân dung nên chụp nền trắng/sáng, nhìn thẳng.</p>
      </div>
      <div className="field-group">
        <label>Ảnh chân dung <span className="req">*</span></label>
        <UploadBox icon={<Camera size={24} />} label="Chọn ảnh chân dung" sub="JPG, PNG - Tối đa 5MB - Nên nền trắng" accept="image/jpeg,image/png" name="filePortrait" onFile={onFile} />
      </div>
      <div className="field-group">
        <label>Ảnh toàn thân <span className="req">*</span></label>
        <UploadBox icon={<Camera size={24} />} label="Chọn ảnh toàn thân" sub="JPG, PNG - Tối đa 5MB" accept="image/jpeg,image/png" name="fileFullBody" onFile={onFile} />
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
