-- ============================================================================
-- NAM THẮNG HRM - POSTGRESQL DATABASE SCHEMA
-- Hệ thống quản lý nhân sự Nam Thắng
-- Version: 1.0
-- Created: 2026-06-18
-- ============================================================================

-- Bật extension cần thiết
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUM TYPES - Các kiểu dữ liệu liệt kê
-- ============================================================================

-- Loại tổ chức
CREATE TYPE organization_type AS ENUM ('headquarters', 'branch', 'representative_office');

-- Trạng thái chung
CREATE TYPE general_status AS ENUM ('active', 'inactive');

-- Giới tính
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');

-- Trạng thái ứng viên
CREATE TYPE candidate_status AS ENUM ('new', 'screening', 'interview', 'evaluation', 'offer', 'hired', 'rejected');

-- Loại giấy tờ ứng viên
CREATE TYPE candidate_document_type AS ENUM ('cccd_front', 'cccd_back', 'gplx', 'cv', 'health_cert', 'portrait', 'full_body', 'video');

-- Kết quả phỏng vấn
CREATE TYPE interview_result AS ENUM ('pass', 'fail', 'pending');

-- Trạng thái nhân viên
CREATE TYPE employee_status AS ENUM ('probation', 'active', 'resigned', 'terminated');

-- Tình trạng hôn nhân
CREATE TYPE marital_status_type AS ENUM ('single', 'married', 'divorced', 'widowed');

-- Trình độ học vấn
CREATE TYPE education_level_type AS ENUM ('primary', 'secondary', 'high_school', 'college', 'university', 'master', 'phd');

-- Loại khen thưởng/kỷ luật
CREATE TYPE reward_discipline_type AS ENUM ('reward', 'discipline');

-- Loại hợp đồng
CREATE TYPE contract_type AS ENUM ('probation', 'fixed_term', 'indefinite');

-- Trạng thái hợp đồng
CREATE TYPE contract_status AS ENUM ('active', 'expired', 'terminated');

-- Phương thức chấm công
CREATE TYPE checkin_method AS ENUM ('gps', 'wifi', 'qr', 'face');

-- Trạng thái chấm công
CREATE TYPE attendance_status AS ENUM ('normal', 'late', 'early_leave', 'absent', 'leave');

-- Loại nghỉ phép
CREATE TYPE leave_type AS ENUM ('annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid');

-- Trạng thái phê duyệt
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Trạng thái kỳ lương
CREATE TYPE payroll_status AS ENUM ('draft', 'calculated', 'confirmed', 'paid');

-- Trạng thái tạm ứng
CREATE TYPE advance_status AS ENUM ('pending', 'approved', 'rejected', 'deducted');

-- Trạng thái kỳ KPI
CREATE TYPE kpi_period_status AS ENUM ('active', 'closed');

-- Xếp loại KPI
CREATE TYPE kpi_grade AS ENUM ('excellent', 'good', 'pass', 'fail');

-- Danh mục tài sản
CREATE TYPE asset_category AS ENUM ('laptop', 'phone', 'car', 'uniform', 'equipment', 'furniture', 'other');

-- Trạng thái tài sản
CREATE TYPE asset_status AS ENUM ('available', 'in_use', 'maintenance', 'disposed');

-- Trạng thái giao nhận tài sản
CREATE TYPE assignment_status AS ENUM ('assigned', 'returned');

-- Hạng giấy phép lái xe
CREATE TYPE license_class AS ENUM ('A1', 'A2', 'B1', 'B2', 'C', 'D', 'E', 'FC');

-- Trạng thái giấy phép
CREATE TYPE license_status AS ENUM ('valid', 'expiring', 'expired');

-- Loại xe
CREATE TYPE vehicle_type AS ENUM ('truck', 'container', 'tanker', 'trailer', 'pickup', 'van');

-- Trạng thái xe
CREATE TYPE vehicle_status AS ENUM ('active', 'maintenance', 'decommissioned');

-- Trạng thái lệnh điều động
CREATE TYPE dispatch_status AS ENUM ('pending', 'in_transit', 'completed', 'cancelled');

-- Mức độ hư hại tai nạn
CREATE TYPE damage_level AS ENUM ('minor', 'moderate', 'severe');

-- Danh mục biểu mẫu
CREATE TYPE document_category AS ENUM ('contract', 'decision', 'handover', 'commitment', 'other');

-- Trạng thái văn bản
CREATE TYPE document_status AS ENUM ('draft', 'signed', 'archived');

-- Trạng thái tin tuyển dụng
CREATE TYPE job_posting_status AS ENUM ('draft', 'active', 'closed');

-- Loại thông báo
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'error');

-- Trạng thái onboarding task
CREATE TYPE onboarding_task_status AS ENUM ('pending', 'completed');

-- ============================================================================
-- FUNCTION: Tự động cập nhật updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MODULE: CORE/SYSTEM - Hệ thống cơ bản
-- ============================================================================

-- Bảng: organizations - Tổ chức/Chi nhánh
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,                    -- Tên tổ chức
    code VARCHAR(50) NOT NULL UNIQUE,              -- Mã tổ chức
    address TEXT,                                   -- Địa chỉ
    phone VARCHAR(20),                             -- Số điện thoại
    email VARCHAR(255),                            -- Email
    parent_id UUID REFERENCES organizations(id),   -- Tổ chức cha (cấu trúc cây)
    type organization_type NOT NULL DEFAULT 'branch', -- Loại: trụ sở chính/chi nhánh
    status general_status NOT NULL DEFAULT 'active',  -- Trạng thái
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE organizations IS 'Tổ chức/Chi nhánh trong hệ thống';
COMMENT ON COLUMN organizations.code IS 'Mã tổ chức duy nhất, ví dụ: HQ, KG, CM';
COMMENT ON COLUMN organizations.parent_id IS 'Tham chiếu đến tổ chức cha để tạo cấu trúc phân cấp';

CREATE INDEX idx_organizations_parent_id ON organizations(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_code ON organizations(code) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_status ON organizations(status) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: departments - Phòng ban
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id), -- Thuộc tổ chức nào
    name VARCHAR(255) NOT NULL,                    -- Tên phòng ban
    code VARCHAR(50) NOT NULL,                     -- Mã phòng ban
    parent_id UUID REFERENCES departments(id),     -- Phòng ban cha
    manager_id UUID,                               -- Trưởng phòng (FK đến employees, thêm sau)
    status general_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(organization_id, code)
);

COMMENT ON TABLE departments IS 'Phòng ban trong tổ chức';
COMMENT ON COLUMN departments.manager_id IS 'ID trưởng phòng - FK sẽ được thêm sau khi tạo bảng employees';

CREATE INDEX idx_departments_organization_id ON departments(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_departments_parent_id ON departments(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_departments_code ON departments(code) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: positions - Chức vụ
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id), -- Thuộc phòng ban (nullable = chức vụ chung)
    name VARCHAR(255) NOT NULL,                    -- Tên chức vụ
    code VARCHAR(50) NOT NULL UNIQUE,              -- Mã chức vụ
    level INTEGER DEFAULT 1,                       -- Cấp bậc (1=thấp nhất)
    description TEXT,                              -- Mô tả công việc
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE positions IS 'Chức vụ/Vị trí công việc';
COMMENT ON COLUMN positions.level IS 'Cấp bậc chức vụ: 1=nhân viên, 2=tổ trưởng, 3=trưởng phòng, 4=giám đốc';

CREATE INDEX idx_positions_department_id ON positions(department_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_positions_code ON positions(code) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_positions_updated_at
    BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: roles - Vai trò (RBAC)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,                    -- Tên vai trò
    code VARCHAR(50) NOT NULL UNIQUE,              -- Mã vai trò
    description TEXT,                              -- Mô tả
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE roles IS 'Vai trò trong hệ thống phân quyền RBAC';

CREATE TRIGGER trg_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: permissions - Quyền hạn
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id),    -- Thuộc vai trò nào
    module VARCHAR(100) NOT NULL,                   -- Module (recruitment, employee, payroll...)
    action VARCHAR(50) NOT NULL,                    -- Hành động (create/read/update/delete)
    resource VARCHAR(100),                          -- Tài nguyên cụ thể
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_permission_action CHECK (action IN ('create', 'read', 'update', 'delete', 'export', 'approve'))
);

COMMENT ON TABLE permissions IS 'Bảng quyền hạn chi tiết theo vai trò';
COMMENT ON COLUMN permissions.module IS 'Tên module: recruitment, employee, contract, attendance, payroll, kpi, asset, driver, document';
COMMENT ON COLUMN permissions.action IS 'Loại hành động: create, read, update, delete, export, approve';

CREATE INDEX idx_permissions_role_id ON permissions(role_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_permissions_module_action ON permissions(module, action) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_permissions_updated_at
    BEFORE UPDATE ON permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MODULE 3: EMPLOYEE MANAGEMENT - Quản lý nhân sự
-- ============================================================================

-- Bảng: employees - Nhân viên
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,              -- Mã nhân viên (NT-DRV-KG-0001)
    candidate_id UUID,                             -- Liên kết từ tuyển dụng (nullable)
    full_name VARCHAR(255) NOT NULL,               -- Họ và tên
    date_of_birth DATE,                            -- Ngày sinh
    gender gender_type,                            -- Giới tính
    id_card_number VARCHAR(20),                    -- Số CCCD/CMND
    id_card_date DATE,                             -- Ngày cấp
    id_card_place VARCHAR(255),                    -- Nơi cấp
    permanent_address TEXT,                        -- Địa chỉ thường trú
    current_address TEXT,                          -- Địa chỉ hiện tại
    email VARCHAR(255),                            -- Email
    phone VARCHAR(20),                             -- Số điện thoại
    department_id UUID REFERENCES departments(id), -- Phòng ban
    position_id UUID REFERENCES positions(id),     -- Chức vụ
    organization_id UUID NOT NULL REFERENCES organizations(id), -- Chi nhánh
    hire_date DATE NOT NULL,                       -- Ngày vào làm
    status employee_status NOT NULL DEFAULT 'probation', -- Trạng thái
    avatar_path VARCHAR(500),                      -- Ảnh đại diện
    ethnicity VARCHAR(50),                         -- Dân tộc
    religion VARCHAR(50),                          -- Tôn giáo
    marital_status marital_status_type,            -- Tình trạng hôn nhân
    education_level education_level_type,          -- Trình độ học vấn
    bank_account VARCHAR(30),                      -- Số tài khoản ngân hàng
    bank_name VARCHAR(100),                        -- Tên ngân hàng
    tax_code VARCHAR(20),                          -- Mã số thuế cá nhân
    social_insurance_number VARCHAR(20),           -- Số sổ BHXH
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE employees IS 'Bảng thông tin nhân viên chính';
COMMENT ON COLUMN employees.code IS 'Mã nhân viên theo quy tắc: NT-{DEPT}-{BRANCH}-{SEQ}, ví dụ: NT-DRV-KG-0001';
COMMENT ON COLUMN employees.candidate_id IS 'Liên kết với ứng viên nếu nhân viên được tuyển qua hệ thống';

CREATE INDEX idx_employees_code ON employees(code) WHERE deleted_at IS NULL;
CREATE INDEX idx_employees_department_id ON employees(department_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_employees_position_id ON employees(position_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_employees_organization_id ON employees(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_employees_status ON employees(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_employees_full_name ON employees(full_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_employees_id_card_number ON employees(id_card_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_employees_hire_date ON employees(hire_date) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Thêm FK cho departments.manager_id -> employees.id
ALTER TABLE departments ADD CONSTRAINT fk_departments_manager
    FOREIGN KEY (manager_id) REFERENCES employees(id);

-- Bảng: users - Tài khoản đăng nhập
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id),     -- Liên kết nhân viên
    username VARCHAR(100) NOT NULL UNIQUE,          -- Tên đăng nhập
    password_hash VARCHAR(255) NOT NULL,            -- Mật khẩu đã hash
    role_id UUID REFERENCES roles(id),             -- Vai trò
    status general_status NOT NULL DEFAULT 'active', -- Trạng thái
    last_login TIMESTAMPTZ,                        -- Lần đăng nhập cuối
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE users IS 'Tài khoản đăng nhập hệ thống';
COMMENT ON COLUMN users.password_hash IS 'Mật khẩu được hash bằng bcrypt';

CREATE INDEX idx_users_employee_id ON users(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role_id ON users(role_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: employee_family - Thông tin gia đình
CREATE TABLE employee_family (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id), -- Nhân viên
    full_name VARCHAR(255) NOT NULL,               -- Họ tên người thân
    relationship VARCHAR(50) NOT NULL,             -- Quan hệ (cha/mẹ/vợ/chồng/con)
    date_of_birth DATE,                            -- Ngày sinh
    occupation VARCHAR(255),                       -- Nghề nghiệp
    phone VARCHAR(20),                             -- Số điện thoại
    is_dependent BOOLEAN DEFAULT FALSE,            -- Là người phụ thuộc (giảm trừ thuế)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE employee_family IS 'Thông tin gia đình nhân viên';
COMMENT ON COLUMN employee_family.is_dependent IS 'Đánh dấu người phụ thuộc để tính giảm trừ thuế TNCN';

CREATE INDEX idx_employee_family_employee_id ON employee_family(employee_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_employee_family_updated_at
    BEFORE UPDATE ON employee_family
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: employee_education - Trình độ học vấn
CREATE TABLE employee_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    school_name VARCHAR(255) NOT NULL,             -- Tên trường
    major VARCHAR(255),                            -- Chuyên ngành
    degree VARCHAR(100),                           -- Bằng cấp
    start_date DATE,                               -- Ngày bắt đầu
    end_date DATE,                                 -- Ngày kết thúc
    gpa DECIMAL(3,2),                              -- Điểm trung bình
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE employee_education IS 'Trình độ học vấn và bằng cấp của nhân viên';

CREATE INDEX idx_employee_education_employee_id ON employee_education(employee_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_employee_education_updated_at
    BEFORE UPDATE ON employee_education
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: employee_work_history - Lịch sử công tác
CREATE TABLE employee_work_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    company_name VARCHAR(255) NOT NULL,            -- Tên công ty
    position VARCHAR(255),                         -- Chức vụ
    start_date DATE,                               -- Ngày bắt đầu
    end_date DATE,                                 -- Ngày kết thúc
    reason_leaving TEXT,                           -- Lý do nghỉ
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE employee_work_history IS 'Lịch sử làm việc tại các công ty trước';

CREATE INDEX idx_employee_work_history_employee_id ON employee_work_history(employee_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_employee_work_history_updated_at
    BEFORE UPDATE ON employee_work_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: employee_transfers - Điều chuyển nhân sự
CREATE TABLE employee_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    from_department_id UUID REFERENCES departments(id), -- Phòng ban cũ
    to_department_id UUID REFERENCES departments(id),   -- Phòng ban mới
    from_position_id UUID REFERENCES positions(id),     -- Chức vụ cũ
    to_position_id UUID REFERENCES positions(id),       -- Chức vụ mới
    effective_date DATE NOT NULL,                   -- Ngày hiệu lực
    decision_number VARCHAR(50),                    -- Số quyết định
    reason TEXT,                                    -- Lý do điều chuyển
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE employee_transfers IS 'Lịch sử điều chuyển, thăng chức nhân viên';

CREATE INDEX idx_employee_transfers_employee_id ON employee_transfers(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_employee_transfers_effective_date ON employee_transfers(effective_date) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_employee_transfers_updated_at
    BEFORE UPDATE ON employee_transfers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: rewards_disciplines - Khen thưởng / Kỷ luật
CREATE TABLE rewards_disciplines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    type reward_discipline_type NOT NULL,           -- Loại: khen thưởng/kỷ luật
    title VARCHAR(255) NOT NULL,                   -- Tiêu đề
    description TEXT,                              -- Nội dung chi tiết
    decision_number VARCHAR(50),                   -- Số quyết định
    effective_date DATE NOT NULL,                   -- Ngày hiệu lực
    amount DECIMAL(15,2) DEFAULT 0,                -- Số tiền thưởng/phạt
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE rewards_disciplines IS 'Khen thưởng và kỷ luật nhân viên';

CREATE INDEX idx_rewards_disciplines_employee_id ON rewards_disciplines(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_rewards_disciplines_type ON rewards_disciplines(type) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_rewards_disciplines_updated_at
    BEFORE UPDATE ON rewards_disciplines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MODULE 1: RECRUITMENT - Tuyển dụng
-- ============================================================================

-- Bảng: job_postings - Tin tuyển dụng
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,                   -- Tiêu đề tin tuyển dụng
    position_id UUID REFERENCES positions(id),     -- Vị trí tuyển
    organization_id UUID NOT NULL REFERENCES organizations(id), -- Chi nhánh
    quantity INTEGER NOT NULL DEFAULT 1,           -- Số lượng cần tuyển
    requirements TEXT,                             -- Yêu cầu
    salary_range_min DECIMAL(15,2),                -- Mức lương tối thiểu
    salary_range_max DECIMAL(15,2),                -- Mức lương tối đa
    status job_posting_status NOT NULL DEFAULT 'draft', -- Trạng thái
    deadline DATE,                                 -- Hạn nộp hồ sơ
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_salary_range CHECK (salary_range_max >= salary_range_min)
);

COMMENT ON TABLE job_postings IS 'Tin tuyển dụng';
COMMENT ON COLUMN job_postings.quantity IS 'Số lượng nhân sự cần tuyển cho vị trí này';

CREATE INDEX idx_job_postings_position_id ON job_postings(position_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_job_postings_organization_id ON job_postings(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_job_postings_status ON job_postings(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_job_postings_deadline ON job_postings(deadline) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_job_postings_updated_at
    BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: candidates - Ứng viên
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,              -- Mã ứng viên (UV-2026-000001)
    full_name VARCHAR(255) NOT NULL,               -- Họ và tên
    date_of_birth DATE,                            -- Ngày sinh
    gender gender_type,                            -- Giới tính
    id_card_number VARCHAR(20),                    -- Số CCCD
    id_card_date DATE,                             -- Ngày cấp CCCD
    id_card_place VARCHAR(255),                    -- Nơi cấp CCCD
    permanent_address TEXT,                        -- Địa chỉ thường trú
    current_address TEXT,                          -- Địa chỉ hiện tại
    email VARCHAR(255),                            -- Email
    phone VARCHAR(20),                             -- Số điện thoại
    position_applied VARCHAR(255),                 -- Vị trí ứng tuyển
    experience_years INTEGER DEFAULT 0,            -- Số năm kinh nghiệm
    last_company VARCHAR(255),                     -- Công ty gần nhất
    work_period VARCHAR(100),                      -- Thời gian làm việc
    expected_salary DECIMAL(15,2),                 -- Mức lương mong muốn
    license_class license_class,                   -- Hạng GPLX (nếu là tài xế)
    license_number VARCHAR(20),                    -- Số GPLX
    status candidate_status NOT NULL DEFAULT 'new', -- Trạng thái
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Ngày nộp hồ sơ
    qr_code VARCHAR(500),                          -- Mã QR để tra cứu
    job_posting_id UUID REFERENCES job_postings(id), -- Tin tuyển dụng liên quan
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE candidates IS 'Ứng viên tuyển dụng';
COMMENT ON COLUMN candidates.code IS 'Mã ứng viên tự sinh: UV-{NĂM}-{SỐ THỨ TỰ 6 chữ số}';
COMMENT ON COLUMN candidates.qr_code IS 'Đường dẫn hoặc dữ liệu QR code để ứng viên tra cứu trạng thái';

CREATE INDEX idx_candidates_code ON candidates(code) WHERE deleted_at IS NULL;
CREATE INDEX idx_candidates_status ON candidates(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_candidates_phone ON candidates(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_candidates_applied_date ON candidates(applied_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_candidates_job_posting_id ON candidates(job_posting_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_candidates_updated_at
    BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Thêm FK cho employees.candidate_id
ALTER TABLE employees ADD CONSTRAINT fk_employees_candidate
    FOREIGN KEY (candidate_id) REFERENCES candidates(id);

-- Bảng: candidate_documents - Giấy tờ ứng viên
CREATE TABLE candidate_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id), -- Ứng viên
    document_type candidate_document_type NOT NULL, -- Loại giấy tờ
    file_path VARCHAR(500) NOT NULL,               -- Đường dẫn file
    file_name VARCHAR(255) NOT NULL,               -- Tên file gốc
    file_size BIGINT,                              -- Kích thước (bytes)
    mime_type VARCHAR(100),                         -- Loại MIME
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE candidate_documents IS 'Giấy tờ và hồ sơ đính kèm của ứng viên';

CREATE INDEX idx_candidate_documents_candidate_id ON candidate_documents(candidate_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_candidate_documents_updated_at
    BEFORE UPDATE ON candidate_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: interviews - Lịch phỏng vấn
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id), -- Ứng viên
    interviewer_id UUID REFERENCES employees(id),  -- Người phỏng vấn
    scheduled_at TIMESTAMPTZ NOT NULL,             -- Thời gian phỏng vấn
    location VARCHAR(255),                         -- Địa điểm
    notes TEXT,                                    -- Ghi chú
    result interview_result DEFAULT 'pending',     -- Kết quả
    rating INTEGER CHECK (rating >= 1 AND rating <= 10), -- Đánh giá (1-10)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE interviews IS 'Lịch phỏng vấn ứng viên';

CREATE INDEX idx_interviews_candidate_id ON interviews(candidate_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_interviews_interviewer_id ON interviews(interviewer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_interviews_scheduled_at ON interviews(scheduled_at) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_interviews_updated_at
    BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: recruitment_evaluations - Đánh giá tuyển dụng
CREATE TABLE recruitment_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    evaluator_id UUID REFERENCES employees(id),    -- Người đánh giá
    criteria VARCHAR(255) NOT NULL,                -- Tiêu chí đánh giá
    score DECIMAL(4,2) CHECK (score >= 0 AND score <= 10), -- Điểm (0-10)
    comments TEXT,                                 -- Nhận xét
    recommendation VARCHAR(50),                    -- Đề xuất (hire/reject/consider)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE recruitment_evaluations IS 'Đánh giá ứng viên sau phỏng vấn';

CREATE INDEX idx_recruitment_evaluations_candidate_id ON recruitment_evaluations(candidate_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_recruitment_evaluations_updated_at
    BEFORE UPDATE ON recruitment_evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MODULE 2: ONBOARDING - Nhận việc
-- ============================================================================

-- Bảng: onboarding_tasks - Checklist nhận việc
CREATE TABLE onboarding_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id), -- Nhân viên mới
    task_name VARCHAR(255) NOT NULL,               -- Tên công việc
    description TEXT,                              -- Mô tả chi tiết
    assigned_to UUID REFERENCES employees(id),     -- Người phụ trách
    due_date DATE,                                 -- Hạn hoàn thành
    status onboarding_task_status NOT NULL DEFAULT 'pending', -- Trạng thái
    completed_at TIMESTAMPTZ,                      -- Thời điểm hoàn thành
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE onboarding_tasks IS 'Danh sách công việc cần làm khi nhân viên mới nhận việc';

CREATE INDEX idx_onboarding_tasks_employee_id ON onboarding_tasks(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_onboarding_tasks_assigned_to ON onboarding_tasks(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_onboarding_tasks_status ON onboarding_tasks(status) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_onboarding_tasks_updated_at
    BEFORE UPDATE ON onboarding_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MODULE 4: CONTRACT MANAGEMENT - Quản lý hợp đồng
-- ============================================================================

-- Bảng: contract_templates - Mẫu hợp đồng
CREATE TABLE contract_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,                    -- Tên mẫu
    type contract_type NOT NULL,                   -- Loại hợp đồng
    content_template TEXT,                         -- Nội dung mẫu với {{placeholder}}
    file_path VARCHAR(500),                        -- Đường dẫn file mẫu
    version INTEGER DEFAULT 1,                     -- Phiên bản
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE contract_templates IS 'Mẫu hợp đồng lao động';
COMMENT ON COLUMN contract_templates.content_template IS 'Nội dung mẫu sử dụng cú pháp {{ten_nhan_vien}}, {{ngay_bat_dau}}...';

CREATE TRIGGER trg_contract_templates_updated_at
    BEFORE UPDATE ON contract_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: contracts - Hợp đồng lao động
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,              -- Mã hợp đồng (HD-2026-001)
    employee_id UUID NOT NULL REFERENCES employees(id), -- Nhân viên
    contract_type contract_type NOT NULL,           -- Loại hợp đồng
    start_date DATE NOT NULL,                      -- Ngày bắt đầu
    end_date DATE,                                 -- Ngày kết thúc (NULL = vô thời hạn)
    base_salary DECIMAL(15,2) NOT NULL,            -- Lương cơ bản
    allowances JSONB DEFAULT '{}',                 -- Phụ cấp (JSON: transport, phone, meal...)
    working_hours DECIMAL(4,1) DEFAULT 8.0,        -- Giờ làm việc/ngày
    sign_date DATE,                                -- Ngày ký
    status contract_status NOT NULL DEFAULT 'active', -- Trạng thái
    template_id UUID REFERENCES contract_templates(id), -- Mẫu hợp đồng
    generated_file_path VARCHAR(500),              -- File hợp đồng đã tạo
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_contract_dates CHECK (end_date IS NULL OR end_date > start_date)
);

COMMENT ON TABLE contracts IS 'Hợp đồng lao động';
COMMENT ON COLUMN contracts.code IS 'Mã hợp đồng tự sinh: HD-{NĂM}-{SỐ THỨ TỰ}';
COMMENT ON COLUMN contracts.allowances IS 'Phụ cấp dạng JSON, ví dụ: {"transport": 500000, "phone": 200000, "meal": 730000}';

CREATE INDEX idx_contracts_employee_id ON contracts(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contracts_status ON contracts(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_contracts_end_date ON contracts(end_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_contracts_contract_type ON contracts(contract_type) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_contracts_updated_at
    BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MODULE 5: ATTENDANCE - Chấm công
-- ============================================================================

-- Bảng: attendance_configs - Cấu hình ca làm việc
CREATE TABLE attendance_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id), -- Chi nhánh
    name VARCHAR(100) NOT NULL,                    -- Tên ca (Ca sáng, Ca chiều...)
    shift_start TIME NOT NULL,                     -- Giờ bắt đầu ca
    shift_end TIME NOT NULL,                       -- Giờ kết thúc ca
    late_threshold_minutes INTEGER DEFAULT 15,     -- Số phút trễ cho phép
    break_start TIME,                              -- Giờ bắt đầu nghỉ trưa
    break_end TIME,                                -- Giờ kết thúc nghỉ trưa
    working_days INTEGER[] DEFAULT '{2,3,4,5,6}',  -- Ngày làm việc (2=Thứ 2, 7=Thứ 7)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE attendance_configs IS 'Cấu hình ca làm việc theo chi nhánh';
COMMENT ON COLUMN attendance_configs.working_days IS 'Mảng số ngày làm việc: 1=CN, 2=T2, 3=T3...7=T7';
COMMENT ON COLUMN attendance_configs.late_threshold_minutes IS 'Số phút đi muộn được chấp nhận trước khi tính trễ';

CREATE INDEX idx_attendance_configs_organization_id ON attendance_configs(organization_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_attendance_configs_updated_at
    BEFORE UPDATE ON attendance_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: attendance_records - Bản ghi chấm công
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    date DATE NOT NULL,                            -- Ngày chấm công
    check_in TIMESTAMPTZ,                          -- Giờ vào
    check_out TIMESTAMPTZ,                         -- Giờ ra
    check_in_method checkin_method,                -- Phương thức vào
    check_out_method checkin_method,               -- Phương thức ra
    check_in_latitude DECIMAL(10,7),               -- Vĩ độ check-in
    check_in_longitude DECIMAL(10,7),              -- Kinh độ check-in
    check_out_latitude DECIMAL(10,7),              -- Vĩ độ check-out
    check_out_longitude DECIMAL(10,7),             -- Kinh độ check-out
    status attendance_status NOT NULL DEFAULT 'normal', -- Trạng thái
    ot_hours DECIMAL(4,1) DEFAULT 0,               -- Số giờ tăng ca
    notes TEXT,                                    -- Ghi chú
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_attendance_employee_date UNIQUE (employee_id, date)
);

COMMENT ON TABLE attendance_records IS 'Bản ghi chấm công hàng ngày';
COMMENT ON COLUMN attendance_records.ot_hours IS 'Số giờ làm thêm (overtime) trong ngày';

CREATE INDEX idx_attendance_records_employee_id ON attendance_records(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_attendance_records_date ON attendance_records(date) WHERE deleted_at IS NULL;
CREATE INDEX idx_attendance_records_status ON attendance_records(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_attendance_records_employee_date ON attendance_records(employee_id, date) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_attendance_records_updated_at
    BEFORE UPDATE ON attendance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: leave_requests - Đơn xin nghỉ phép
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    leave_type leave_type NOT NULL,                -- Loại nghỉ phép
    start_date DATE NOT NULL,                      -- Ngày bắt đầu nghỉ
    end_date DATE NOT NULL,                        -- Ngày kết thúc nghỉ
    days_count DECIMAL(4,1) NOT NULL,              -- Số ngày nghỉ
    reason TEXT,                                   -- Lý do
    status approval_status NOT NULL DEFAULT 'pending', -- Trạng thái duyệt
    approved_by UUID REFERENCES employees(id),     -- Người duyệt
    approved_at TIMESTAMPTZ,                       -- Thời điểm duyệt
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_leave_days CHECK (days_count > 0)
);

COMMENT ON TABLE leave_requests IS 'Đơn xin nghỉ phép';
COMMENT ON COLUMN leave_requests.days_count IS 'Số ngày nghỉ, có thể là 0.5 cho nửa ngày';

CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_leave_requests_status ON leave_requests(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_leave_requests_start_date ON leave_requests(start_date) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_leave_requests_updated_at
    BEFORE UPDATE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MODULE 6: PAYROLL - Tiền lương
-- ============================================================================

-- Bảng: payroll_periods - Kỳ lương
CREATE TABLE payroll_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12), -- Tháng
    year INTEGER NOT NULL CHECK (year >= 2020),     -- Năm
    status payroll_status NOT NULL DEFAULT 'draft', -- Trạng thái
    calculated_at TIMESTAMPTZ,                     -- Thời điểm tính lương
    confirmed_by UUID REFERENCES employees(id),    -- Người xác nhận
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_payroll_period UNIQUE (month, year)
);

COMMENT ON TABLE payroll_periods IS 'Kỳ lương theo tháng';

CREATE INDEX idx_payroll_periods_year_month ON payroll_periods(year, month) WHERE deleted_at IS NULL;
CREATE INDEX idx_payroll_periods_status ON payroll_periods(status) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_payroll_periods_updated_at
    BEFORE UPDATE ON payroll_periods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: payroll_records - Bảng lương chi tiết
CREATE TABLE payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_period_id UUID NOT NULL REFERENCES payroll_periods(id), -- Kỳ lương
    employee_id UUID NOT NULL REFERENCES employees(id),             -- Nhân viên
    base_salary DECIMAL(15,2) NOT NULL DEFAULT 0,  -- Lương cơ bản
    allowances JSONB DEFAULT '{}',                 -- Phụ cấp chi tiết
    ot_amount DECIMAL(15,2) DEFAULT 0,             -- Tiền tăng ca
    bonus DECIMAL(15,2) DEFAULT 0,                 -- Thưởng
    social_insurance DECIMAL(15,2) DEFAULT 0,      -- BHXH (8%)
    health_insurance DECIMAL(15,2) DEFAULT 0,      -- BHYT (1.5%)
    unemployment_insurance DECIMAL(15,2) DEFAULT 0, -- BHTN (1%)
    personal_income_tax DECIMAL(15,2) DEFAULT 0,   -- Thuế TNCN
    other_deductions DECIMAL(15,2) DEFAULT 0,      -- Khấu trừ khác
    advance_deducted DECIMAL(15,2) DEFAULT 0,      -- Trừ tạm ứng
    commission DECIMAL(15,2) DEFAULT 0,            -- Hoa hồng
    net_salary DECIMAL(15,2) NOT NULL DEFAULT 0,   -- Lương thực nhận
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_payroll_record UNIQUE (payroll_period_id, employee_id)
);

COMMENT ON TABLE payroll_records IS 'Bảng lương chi tiết từng nhân viên theo kỳ';
COMMENT ON COLUMN payroll_records.allowances IS 'Chi tiết phụ cấp: {"transport": 500000, "phone": 200000, "meal": 730000, "housing": 1000000}';
COMMENT ON COLUMN payroll_records.social_insurance IS 'Bảo hiểm xã hội: 8% lương đóng BHXH';
COMMENT ON COLUMN payroll_records.health_insurance IS 'Bảo hiểm y tế: 1.5% lương đóng BHXH';
COMMENT ON COLUMN payroll_records.unemployment_insurance IS 'Bảo hiểm thất nghiệp: 1% lương đóng BHXH';

CREATE INDEX idx_payroll_records_period_id ON payroll_records(payroll_period_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_payroll_records_employee_id ON payroll_records(employee_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_payroll_records_updated_at
    BEFORE UPDATE ON payroll_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: salary_advances - Tạm ứng lương
CREATE TABLE salary_advances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    amount DECIMAL(15,2) NOT NULL,                 -- Số tiền tạm ứng
    request_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Ngày yêu cầu
    reason TEXT,                                   -- Lý do tạm ứng
    status advance_status NOT NULL DEFAULT 'pending', -- Trạng thái
    approved_by UUID REFERENCES employees(id),     -- Người duyệt
    approved_at TIMESTAMPTZ,                       -- Thời điểm duyệt
    deducted_in_period_id UUID REFERENCES payroll_periods(id), -- Khấu trừ trong kỳ nào
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_advance_amount CHECK (amount > 0)
);

COMMENT ON TABLE salary_advances IS 'Đơn tạm ứng lương';

CREATE INDEX idx_salary_advances_employee_id ON salary_advances(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_salary_advances_status ON salary_advances(status) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_salary_advances_updated_at
    BEFORE UPDATE ON salary_advances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: commissions - Hoa hồng (tài xế)
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id), -- Tài xế
    period_id UUID NOT NULL REFERENCES payroll_periods(id), -- Kỳ lương
    total_trips INTEGER DEFAULT 0,                 -- Tổng số chuyến
    total_km DECIMAL(10,2) DEFAULT 0,              -- Tổng km
    rate_per_trip DECIMAL(15,2) DEFAULT 0,         -- Mức hoa hồng/chuyến
    total_commission DECIMAL(15,2) DEFAULT 0,      -- Tổng hoa hồng
    bonus DECIMAL(15,2) DEFAULT 0,                 -- Thưởng thêm
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE commissions IS 'Hoa hồng tài xế theo kỳ lương';
COMMENT ON COLUMN commissions.rate_per_trip IS 'Mức hoa hồng tính trên mỗi chuyến hàng';

CREATE INDEX idx_commissions_employee_id ON commissions(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_commissions_period_id ON commissions(period_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_commissions_updated_at
    BEFORE UPDATE ON commissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MODULE 7: KPI - Đánh giá hiệu suất
-- ============================================================================

-- Bảng: kpi_periods - Kỳ đánh giá
CREATE TABLE kpi_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,                    -- Tên kỳ (VD: "Q2/2026")
    start_date DATE NOT NULL,                      -- Ngày bắt đầu
    end_date DATE NOT NULL,                        -- Ngày kết thúc
    status kpi_period_status NOT NULL DEFAULT 'active', -- Trạng thái
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_kpi_period_dates CHECK (end_date > start_date)
);

COMMENT ON TABLE kpi_periods IS 'Kỳ đánh giá KPI (quý/năm)';

CREATE INDEX idx_kpi_periods_status ON kpi_periods(status) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_kpi_periods_updated_at
    BEFORE UPDATE ON kpi_periods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: kpi_templates - Mẫu KPI theo chức vụ
CREATE TABLE kpi_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID REFERENCES positions(id),     -- Chức vụ áp dụng
    criteria_name VARCHAR(255) NOT NULL,           -- Tên tiêu chí
    weight DECIMAL(5,2) NOT NULL,                  -- Trọng số (%)
    target_description TEXT,                       -- Mô tả mục tiêu
    measurement_method TEXT,                       -- Phương pháp đo lường
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_kpi_weight CHECK (weight > 0 AND weight <= 100)
);

COMMENT ON TABLE kpi_templates IS 'Mẫu KPI theo vị trí/chức vụ';
COMMENT ON COLUMN kpi_templates.weight IS 'Trọng số tiêu chí (%), tổng các tiêu chí của 1 vị trí = 100%';

CREATE INDEX idx_kpi_templates_position_id ON kpi_templates(position_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_kpi_templates_updated_at
    BEFORE UPDATE ON kpi_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: kpi_evaluations - Kết quả KPI
CREATE TABLE kpi_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_period_id UUID NOT NULL REFERENCES kpi_periods(id), -- Kỳ đánh giá
    employee_id UUID NOT NULL REFERENCES employees(id),     -- Nhân viên
    evaluator_id UUID REFERENCES employees(id),    -- Người đánh giá
    total_score DECIMAL(5,2),                      -- Tổng điểm
    grade kpi_grade,                               -- Xếp loại
    comments TEXT,                                 -- Nhận xét chung
    evaluated_at TIMESTAMPTZ,                      -- Thời điểm đánh giá
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_kpi_evaluation UNIQUE (kpi_period_id, employee_id)
);

COMMENT ON TABLE kpi_evaluations IS 'Kết quả đánh giá KPI tổng hợp';

CREATE INDEX idx_kpi_evaluations_period_id ON kpi_evaluations(kpi_period_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_kpi_evaluations_employee_id ON kpi_evaluations(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_kpi_evaluations_grade ON kpi_evaluations(grade) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_kpi_evaluations_updated_at
    BEFORE UPDATE ON kpi_evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: kpi_evaluation_details - Chi tiết từng tiêu chí KPI
CREATE TABLE kpi_evaluation_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_evaluation_id UUID NOT NULL REFERENCES kpi_evaluations(id), -- Kết quả KPI
    kpi_template_id UUID NOT NULL REFERENCES kpi_templates(id),     -- Tiêu chí
    target_value DECIMAL(10,2),                    -- Giá trị mục tiêu
    actual_value DECIMAL(10,2),                    -- Giá trị thực tế
    score DECIMAL(5,2),                            -- Điểm đạt được
    notes TEXT,                                    -- Ghi chú
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE kpi_evaluation_details IS 'Chi tiết điểm từng tiêu chí KPI';

CREATE INDEX idx_kpi_evaluation_details_evaluation_id ON kpi_evaluation_details(kpi_evaluation_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_kpi_evaluation_details_updated_at
    BEFORE UPDATE ON kpi_evaluation_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MODULE 8: ASSET MANAGEMENT - Quản lý tài sản
-- ============================================================================

-- Bảng: assets - Tài sản
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,              -- Mã tài sản
    name VARCHAR(255) NOT NULL,                    -- Tên tài sản
    category asset_category NOT NULL,              -- Danh mục
    brand VARCHAR(100),                            -- Thương hiệu
    model VARCHAR(100),                            -- Model
    serial_number VARCHAR(100),                    -- Số serial
    purchase_date DATE,                            -- Ngày mua
    purchase_price DECIMAL(15,2),                  -- Giá mua
    current_value DECIMAL(15,2),                   -- Giá trị hiện tại
    status asset_status NOT NULL DEFAULT 'available', -- Trạng thái
    organization_id UUID REFERENCES organizations(id), -- Thuộc chi nhánh
    notes TEXT,                                    -- Ghi chú
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE assets IS 'Quản lý tài sản công ty';
COMMENT ON COLUMN assets.current_value IS 'Giá trị còn lại sau khấu hao';

CREATE INDEX idx_assets_code ON assets(code) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_category ON assets(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_status ON assets(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_organization_id ON assets(organization_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: asset_assignments - Giao nhận tài sản
CREATE TABLE asset_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id),  -- Tài sản
    employee_id UUID NOT NULL REFERENCES employees(id), -- Nhân viên
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Ngày giao
    returned_date DATE,                            -- Ngày trả
    condition_on_assign VARCHAR(255),              -- Tình trạng khi giao
    condition_on_return VARCHAR(255),              -- Tình trạng khi trả
    handover_document_path VARCHAR(500),           -- Biên bản bàn giao
    status assignment_status NOT NULL DEFAULT 'assigned', -- Trạng thái
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE asset_assignments IS 'Lịch sử giao nhận tài sản cho nhân viên';

CREATE INDEX idx_asset_assignments_asset_id ON asset_assignments(asset_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_asset_assignments_employee_id ON asset_assignments(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_asset_assignments_status ON asset_assignments(status) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_asset_assignments_updated_at
    BEFORE UPDATE ON asset_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MODULE 9: DRIVER MANAGEMENT - Quản lý tài xế
-- ============================================================================

-- Bảng: driver_licenses - Giấy phép lái xe
CREATE TABLE driver_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id), -- Tài xế
    license_number VARCHAR(20) NOT NULL,           -- Số GPLX
    license_class license_class NOT NULL,          -- Hạng GPLX
    issue_date DATE NOT NULL,                      -- Ngày cấp
    expiry_date DATE NOT NULL,                     -- Ngày hết hạn
    issuing_authority VARCHAR(255),                -- Cơ quan cấp
    status license_status NOT NULL DEFAULT 'valid', -- Trạng thái
    renewal_date DATE,                             -- Ngày gia hạn
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE driver_licenses IS 'Giấy phép lái xe của tài xế';
COMMENT ON COLUMN driver_licenses.license_class IS 'Hạng GPLX: B1, B2, C, D, E, FC';

CREATE INDEX idx_driver_licenses_employee_id ON driver_licenses(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_driver_licenses_expiry_date ON driver_licenses(expiry_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_driver_licenses_status ON driver_licenses(status) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_driver_licenses_updated_at
    BEFORE UPDATE ON driver_licenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: vehicles - Xe
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate_number VARCHAR(20) NOT NULL UNIQUE,      -- Biển số xe
    type vehicle_type NOT NULL,                    -- Loại xe
    brand VARCHAR(100),                            -- Hãng xe
    model VARCHAR(100),                            -- Model
    tonnage DECIMAL(8,2),                          -- Tải trọng (tấn)
    manufacture_year INTEGER,                      -- Năm sản xuất
    registration_date DATE,                        -- Ngày đăng ký
    insurance_expiry DATE,                         -- Ngày hết hạn bảo hiểm
    status vehicle_status NOT NULL DEFAULT 'active', -- Trạng thái
    organization_id UUID REFERENCES organizations(id), -- Thuộc chi nhánh
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE vehicles IS 'Danh sách phương tiện vận tải';
COMMENT ON COLUMN vehicles.tonnage IS 'Tải trọng cho phép (đơn vị: tấn)';

CREATE INDEX idx_vehicles_plate_number ON vehicles(plate_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_vehicles_type ON vehicles(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_vehicles_status ON vehicles(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_vehicles_organization_id ON vehicles(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_vehicles_insurance_expiry ON vehicles(insurance_expiry) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: vehicle_assignments - Phân công xe
CREATE TABLE vehicle_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id), -- Xe
    driver_id UUID NOT NULL REFERENCES employees(id), -- Tài xế
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Ngày phân công
    released_date DATE,                            -- Ngày kết thúc
    status assignment_status NOT NULL DEFAULT 'assigned', -- Trạng thái
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE vehicle_assignments IS 'Phân công xe cho tài xế';

CREATE INDEX idx_vehicle_assignments_vehicle_id ON vehicle_assignments(vehicle_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_vehicle_assignments_driver_id ON vehicle_assignments(driver_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_vehicle_assignments_status ON vehicle_assignments(status) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_vehicle_assignments_updated_at
    BEFORE UPDATE ON vehicle_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: dispatch_orders - Lệnh điều động
CREATE TABLE dispatch_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,              -- Mã lệnh điều động
    driver_id UUID NOT NULL REFERENCES employees(id), -- Tài xế
    vehicle_id UUID NOT NULL REFERENCES vehicles(id), -- Xe
    origin VARCHAR(255) NOT NULL,                  -- Điểm xuất phát
    destination VARCHAR(255) NOT NULL,             -- Điểm đến
    cargo_type VARCHAR(255),                       -- Loại hàng
    cargo_weight DECIMAL(10,2),                    -- Trọng lượng hàng (tấn)
    departure_time TIMESTAMPTZ,                    -- Giờ xuất phát
    arrival_time TIMESTAMPTZ,                      -- Giờ đến
    status dispatch_status NOT NULL DEFAULT 'pending', -- Trạng thái
    notes TEXT,                                    -- Ghi chú
    created_by UUID REFERENCES employees(id),      -- Người tạo lệnh
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE dispatch_orders IS 'Lệnh điều động xe và tài xế';

CREATE INDEX idx_dispatch_orders_code ON dispatch_orders(code) WHERE deleted_at IS NULL;
CREATE INDEX idx_dispatch_orders_driver_id ON dispatch_orders(driver_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_dispatch_orders_vehicle_id ON dispatch_orders(vehicle_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_dispatch_orders_status ON dispatch_orders(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_dispatch_orders_departure_time ON dispatch_orders(departure_time) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_dispatch_orders_updated_at
    BEFORE UPDATE ON dispatch_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: driver_violations - Vi phạm giao thông
CREATE TABLE driver_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id), -- Tài xế
    violation_date DATE NOT NULL,                   -- Ngày vi phạm
    violation_type VARCHAR(255) NOT NULL,           -- Loại vi phạm
    description TEXT,                              -- Mô tả chi tiết
    fine_amount DECIMAL(15,2) DEFAULT 0,           -- Số tiền phạt
    location VARCHAR(255),                         -- Địa điểm vi phạm
    decision_number VARCHAR(50),                   -- Số quyết định xử phạt
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE driver_violations IS 'Vi phạm giao thông của tài xế';

CREATE INDEX idx_driver_violations_employee_id ON driver_violations(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_driver_violations_violation_date ON driver_violations(violation_date) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_driver_violations_updated_at
    BEFORE UPDATE ON driver_violations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: driver_accidents - Tai nạn
CREATE TABLE driver_accidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id), -- Tài xế
    vehicle_id UUID REFERENCES vehicles(id),       -- Xe liên quan
    accident_date DATE NOT NULL,                   -- Ngày tai nạn
    location VARCHAR(255),                         -- Địa điểm
    description TEXT,                              -- Mô tả sự cố
    damage_level damage_level NOT NULL DEFAULT 'minor', -- Mức độ thiệt hại
    injury_description TEXT,                       -- Mô tả thương tích
    insurance_claim BOOLEAN DEFAULT FALSE,         -- Có yêu cầu bảo hiểm không
    cost DECIMAL(15,2) DEFAULT 0,                  -- Chi phí khắc phục
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE driver_accidents IS 'Lịch sử tai nạn giao thông';

CREATE INDEX idx_driver_accidents_employee_id ON driver_accidents(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_driver_accidents_vehicle_id ON driver_accidents(vehicle_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_driver_accidents_accident_date ON driver_accidents(accident_date) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_driver_accidents_updated_at
    BEFORE UPDATE ON driver_accidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MODULE 10: DOCUMENT MANAGEMENT - Quản lý biểu mẫu
-- ============================================================================

-- Bảng: document_templates - Biểu mẫu
CREATE TABLE document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,                    -- Tên biểu mẫu
    category document_category NOT NULL,           -- Danh mục
    description TEXT,                              -- Mô tả
    file_path VARCHAR(500),                        -- Đường dẫn file mẫu
    content_template TEXT,                         -- Nội dung mẫu với {{placeholder}}
    version INTEGER DEFAULT 1,                     -- Phiên bản
    status general_status NOT NULL DEFAULT 'active', -- Trạng thái
    created_by UUID REFERENCES employees(id),      -- Người tạo
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE document_templates IS 'Danh mục biểu mẫu/mẫu văn bản';
COMMENT ON COLUMN document_templates.content_template IS 'Nội dung mẫu với placeholder: {{ho_ten}}, {{ma_nv}}, {{phong_ban}}...';

CREATE INDEX idx_document_templates_category ON document_templates(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_document_templates_status ON document_templates(status) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_document_templates_updated_at
    BEFORE UPDATE ON document_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng: generated_documents - Văn bản đã tạo
CREATE TABLE generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES document_templates(id), -- Mẫu gốc
    employee_id UUID REFERENCES employees(id),     -- Nhân viên liên quan
    generated_data JSONB DEFAULT '{}',             -- Dữ liệu đã điền vào placeholder
    file_path VARCHAR(500),                        -- Đường dẫn file đã tạo
    status document_status NOT NULL DEFAULT 'draft', -- Trạng thái
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Thời điểm tạo
    signed_at TIMESTAMPTZ,                         -- Thời điểm ký
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE generated_documents IS 'Văn bản/biểu mẫu đã được tạo từ mẫu';

CREATE INDEX idx_generated_documents_template_id ON generated_documents(template_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_generated_documents_employee_id ON generated_documents(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_generated_documents_status ON generated_documents(status) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_generated_documents_updated_at
    BEFORE UPDATE ON generated_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- NOTIFICATIONS - Thông báo
-- ============================================================================

-- Bảng: notifications - Thông báo
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),    -- Người nhận
    title VARCHAR(255) NOT NULL,                   -- Tiêu đề
    message TEXT,                                  -- Nội dung
    type notification_type NOT NULL DEFAULT 'info', -- Loại thông báo
    is_read BOOLEAN NOT NULL DEFAULT FALSE,        -- Đã đọc chưa
    link VARCHAR(500),                             -- Liên kết đến trang liên quan
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'Thông báo hệ thống gửi đến người dùng';

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================================================
-- AUDIT - Nhật ký hệ thống
-- ============================================================================

-- Bảng: audit_logs - Nhật ký hệ thống
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),             -- Người thực hiện
    action VARCHAR(50) NOT NULL,                   -- Hành động (create/update/delete/login/logout)
    table_name VARCHAR(100),                       -- Bảng bị tác động
    record_id UUID,                                -- ID bản ghi bị tác động
    old_values JSONB,                              -- Giá trị cũ
    new_values JSONB,                              -- Giá trị mới
    ip_address INET,                               -- Địa chỉ IP
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE audit_logs IS 'Nhật ký ghi lại mọi thao tác trên hệ thống';
COMMENT ON COLUMN audit_logs.old_values IS 'Giá trị trước khi thay đổi (JSON)';
COMMENT ON COLUMN audit_logs.new_values IS 'Giá trị sau khi thay đổi (JSON)';

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================================================
-- FUNCTIONS - Hàm tự động sinh mã
-- ============================================================================

-- Function: Tự động sinh mã ứng viên (UV-{YEAR}-{SEQUENCE})
CREATE OR REPLACE FUNCTION generate_candidate_code()
RETURNS TRIGGER AS $$
DECLARE
    current_year TEXT;
    next_seq INTEGER;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(code FROM 9) AS INTEGER)
    ), 0) + 1
    INTO next_seq
    FROM candidates
    WHERE code LIKE 'UV-' || current_year || '-%';

    NEW.code := 'UV-' || current_year || '-' || LPAD(next_seq::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_candidate_code
    BEFORE INSERT ON candidates
    FOR EACH ROW
    WHEN (NEW.code IS NULL OR NEW.code = '')
    EXECUTE FUNCTION generate_candidate_code();

-- Function: Tự động sinh mã hợp đồng (HD-{YEAR}-{SEQUENCE})
CREATE OR REPLACE FUNCTION generate_contract_code()
RETURNS TRIGGER AS $$
DECLARE
    current_year TEXT;
    next_seq INTEGER;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(code FROM 9) AS INTEGER)
    ), 0) + 1
    INTO next_seq
    FROM contracts
    WHERE code LIKE 'HD-' || current_year || '-%';

    NEW.code := 'HD-' || current_year || '-' || LPAD(next_seq::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_contract_code
    BEFORE INSERT ON contracts
    FOR EACH ROW
    WHEN (NEW.code IS NULL OR NEW.code = '')
    EXECUTE FUNCTION generate_contract_code();

-- Function: Tự động sinh mã nhân viên (NT-{DEPT_CODE}-{ORG_CODE}-{SEQUENCE})
CREATE OR REPLACE FUNCTION generate_employee_code()
RETURNS TRIGGER AS $$
DECLARE
    dept_code TEXT;
    org_code TEXT;
    next_seq INTEGER;
    prefix TEXT;
BEGIN
    -- Lấy mã phòng ban
    SELECT COALESCE(d.code, 'GEN') INTO dept_code
    FROM departments d WHERE d.id = NEW.department_id;

    -- Lấy mã chi nhánh
    SELECT COALESCE(o.code, 'HQ') INTO org_code
    FROM organizations o WHERE o.id = NEW.organization_id;

    prefix := 'NT-' || COALESCE(dept_code, 'GEN') || '-' || COALESCE(org_code, 'HQ');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(code FROM LENGTH(prefix) + 2) AS INTEGER)
    ), 0) + 1
    INTO next_seq
    FROM employees
    WHERE code LIKE prefix || '-%';

    NEW.code := prefix || '-' || LPAD(next_seq::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_employee_code
    BEFORE INSERT ON employees
    FOR EACH ROW
    WHEN (NEW.code IS NULL OR NEW.code = '')
    EXECUTE FUNCTION generate_employee_code();

-- ============================================================================
-- VIEWS - Các view báo cáo
-- ============================================================================

-- View: Thông tin tổng hợp nhân viên
CREATE OR REPLACE VIEW v_employee_summary AS
SELECT
    e.id,
    e.code AS employee_code,
    e.full_name,
    e.date_of_birth,
    e.gender,
    e.phone,
    e.email,
    e.hire_date,
    e.status,
    d.name AS department_name,
    d.code AS department_code,
    p.name AS position_name,
    p.level AS position_level,
    o.name AS organization_name,
    o.code AS organization_code,
    c.base_salary AS current_salary,
    c.contract_type AS current_contract_type,
    c.end_date AS contract_end_date
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id AND d.deleted_at IS NULL
LEFT JOIN positions p ON e.position_id = p.id AND p.deleted_at IS NULL
LEFT JOIN organizations o ON e.organization_id = o.id AND o.deleted_at IS NULL
LEFT JOIN LATERAL (
    SELECT base_salary, contract_type, end_date
    FROM contracts
    WHERE employee_id = e.id AND status = 'active' AND deleted_at IS NULL
    ORDER BY start_date DESC
    LIMIT 1
) c ON TRUE
WHERE e.deleted_at IS NULL;

COMMENT ON VIEW v_employee_summary IS 'View tổng hợp thông tin nhân viên kèm phòng ban, chức vụ, chi nhánh và hợp đồng hiện tại';

-- View: Tổng hợp bảng lương theo kỳ
CREATE OR REPLACE VIEW v_payroll_summary AS
SELECT
    pp.id AS period_id,
    pp.month,
    pp.year,
    pp.status AS period_status,
    COUNT(pr.id) AS total_employees,
    SUM(pr.base_salary) AS total_base_salary,
    SUM(pr.ot_amount) AS total_ot,
    SUM(pr.bonus) AS total_bonus,
    SUM(pr.commission) AS total_commission,
    SUM(pr.social_insurance + pr.health_insurance + pr.unemployment_insurance) AS total_insurance,
    SUM(pr.personal_income_tax) AS total_tax,
    SUM(pr.net_salary) AS total_net_salary
FROM payroll_periods pp
LEFT JOIN payroll_records pr ON pp.id = pr.payroll_period_id AND pr.deleted_at IS NULL
WHERE pp.deleted_at IS NULL
GROUP BY pp.id, pp.month, pp.year, pp.status;

COMMENT ON VIEW v_payroll_summary IS 'View tổng hợp chi phí lương theo kỳ';

-- View: Giấy phép lái xe sắp hết hạn (30 ngày)
CREATE OR REPLACE VIEW v_driver_license_expiring AS
SELECT
    dl.id AS license_id,
    e.code AS employee_code,
    e.full_name,
    e.phone,
    dl.license_number,
    dl.license_class,
    dl.expiry_date,
    dl.expiry_date - CURRENT_DATE AS days_until_expiry,
    o.name AS organization_name
FROM driver_licenses dl
JOIN employees e ON dl.employee_id = e.id AND e.deleted_at IS NULL
LEFT JOIN organizations o ON e.organization_id = o.id
WHERE dl.deleted_at IS NULL
    AND dl.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY dl.expiry_date ASC;

COMMENT ON VIEW v_driver_license_expiring IS 'View GPLX sắp hết hạn trong 30 ngày tới';

-- View: Hợp đồng sắp hết hạn (30 ngày)
CREATE OR REPLACE VIEW v_contract_expiring AS
SELECT
    c.id AS contract_id,
    c.code AS contract_code,
    e.code AS employee_code,
    e.full_name,
    e.phone,
    c.contract_type,
    c.start_date,
    c.end_date,
    c.end_date - CURRENT_DATE AS days_until_expiry,
    d.name AS department_name,
    o.name AS organization_name
FROM contracts c
JOIN employees e ON c.employee_id = e.id AND e.deleted_at IS NULL
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN organizations o ON e.organization_id = o.id
WHERE c.deleted_at IS NULL
    AND c.status = 'active'
    AND c.end_date IS NOT NULL
    AND c.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY c.end_date ASC;

COMMENT ON VIEW v_contract_expiring IS 'View hợp đồng sắp hết hạn trong 30 ngày tới';

-- View: Tổng hợp chấm công theo tháng
CREATE OR REPLACE VIEW v_attendance_monthly AS
SELECT
    e.id AS employee_id,
    e.code AS employee_code,
    e.full_name,
    EXTRACT(MONTH FROM ar.date)::INTEGER AS month,
    EXTRACT(YEAR FROM ar.date)::INTEGER AS year,
    COUNT(*) FILTER (WHERE ar.status = 'normal') AS normal_days,
    COUNT(*) FILTER (WHERE ar.status = 'late') AS late_days,
    COUNT(*) FILTER (WHERE ar.status = 'early_leave') AS early_leave_days,
    COUNT(*) FILTER (WHERE ar.status = 'absent') AS absent_days,
    COUNT(*) FILTER (WHERE ar.status = 'leave') AS leave_days,
    COUNT(*) AS total_records,
    COALESCE(SUM(ar.ot_hours), 0) AS total_ot_hours
FROM employees e
JOIN attendance_records ar ON e.id = ar.employee_id AND ar.deleted_at IS NULL
WHERE e.deleted_at IS NULL
GROUP BY e.id, e.code, e.full_name,
         EXTRACT(MONTH FROM ar.date), EXTRACT(YEAR FROM ar.date);

COMMENT ON VIEW v_attendance_monthly IS 'View tổng hợp chấm công theo tháng của từng nhân viên';

-- ============================================================================
-- SEED DATA - Dữ liệu khởi tạo
-- ============================================================================

-- Vai trò mặc định
INSERT INTO roles (id, name, code, description) VALUES
    (gen_random_uuid(), 'Quản trị hệ thống', 'ADMIN', 'Toàn quyền truy cập và quản lý hệ thống'),
    (gen_random_uuid(), 'Giám đốc', 'DIRECTOR', 'Xem báo cáo, phê duyệt các yêu cầu'),
    (gen_random_uuid(), 'Trưởng phòng nhân sự', 'HR_MANAGER', 'Quản lý toàn bộ module nhân sự'),
    (gen_random_uuid(), 'Nhân viên nhân sự', 'HR_STAFF', 'Thao tác nghiệp vụ nhân sự'),
    (gen_random_uuid(), 'Trưởng phòng', 'DEPT_MANAGER', 'Quản lý nhân viên trong phòng ban'),
    (gen_random_uuid(), 'Kế toán trưởng', 'CHIEF_ACCOUNTANT', 'Quản lý lương, bảo hiểm, thuế'),
    (gen_random_uuid(), 'Kế toán', 'ACCOUNTANT', 'Thao tác nghiệp vụ kế toán, lương'),
    (gen_random_uuid(), 'Điều phối viên', 'DISPATCHER', 'Quản lý điều xe, lệnh điều động'),
    (gen_random_uuid(), 'Nhân viên', 'EMPLOYEE', 'Xem thông tin cá nhân, chấm công, nghỉ phép'),
    (gen_random_uuid(), 'Tài xế', 'DRIVER', 'Xem lệnh điều động, chấm công, hoa hồng');

-- Tổ chức mặc định
INSERT INTO organizations (id, name, code, address, type, status) VALUES
    (gen_random_uuid(), 'Nam Thắng - Trụ sở chính', 'HQ', 'TP. Hồ Chí Minh', 'headquarters', 'active'),
    (gen_random_uuid(), 'Chi nhánh Kiên Giang', 'KG', 'Kiên Giang', 'branch', 'active'),
    (gen_random_uuid(), 'Chi nhánh Cà Mau', 'CM', 'Cà Mau', 'branch', 'active'),
    (gen_random_uuid(), 'Chi nhánh Cần Thơ', 'CT', 'Cần Thơ', 'branch', 'active'),
    (gen_random_uuid(), 'Chi nhánh Long An', 'LA', 'Long An', 'branch', 'active');

-- Cập nhật parent_id cho chi nhánh (trỏ về trụ sở chính)
UPDATE organizations SET parent_id = (SELECT id FROM organizations WHERE code = 'HQ')
WHERE code != 'HQ';

-- Phòng ban mặc định
INSERT INTO departments (id, organization_id, name, code, status)
SELECT
    gen_random_uuid(),
    (SELECT id FROM organizations WHERE code = 'HQ'),
    dept_name,
    dept_code,
    'active'
FROM (VALUES
    ('Ban Giám đốc', 'BGD'),
    ('Phòng Nhân sự', 'NS'),
    ('Phòng Kế toán', 'KT'),
    ('Phòng Điều vận', 'DV'),
    ('Phòng Kinh doanh', 'KD'),
    ('Phòng IT', 'IT'),
    ('Đội xe', 'DRV'),
    ('Phòng Hành chính', 'HC')
) AS t(dept_name, dept_code);

-- Chức vụ mặc định
INSERT INTO positions (id, name, code, level, description)
SELECT gen_random_uuid(), pos_name, pos_code, pos_level, pos_desc
FROM (VALUES
    ('Giám đốc', 'GD', 5, 'Giám đốc công ty'),
    ('Phó Giám đốc', 'PGD', 4, 'Phó Giám đốc'),
    ('Trưởng phòng', 'TP', 3, 'Trưởng phòng ban'),
    ('Phó phòng', 'PP', 3, 'Phó phòng ban'),
    ('Tổ trưởng', 'TTR', 2, 'Tổ trưởng/Nhóm trưởng'),
    ('Nhân viên', 'NV', 1, 'Nhân viên'),
    ('Tài xế', 'TX', 1, 'Tài xế vận tải'),
    ('Phụ xe', 'PX', 1, 'Phụ xe'),
    ('Kế toán viên', 'KTV', 1, 'Kế toán viên'),
    ('Nhân viên điều vận', 'NVDV', 1, 'Nhân viên điều phối vận tải'),
    ('Thực tập sinh', 'TTS', 0, 'Thực tập sinh')
) AS t(pos_name, pos_code, pos_level, pos_desc);

-- Cấu hình ca làm việc mặc định
INSERT INTO attendance_configs (id, organization_id, name, shift_start, shift_end, late_threshold_minutes, break_start, break_end, working_days)
SELECT
    gen_random_uuid(),
    (SELECT id FROM organizations WHERE code = 'HQ'),
    config_name,
    config_start,
    config_end,
    config_late,
    config_break_start,
    config_break_end,
    config_days
FROM (VALUES
    ('Ca hành chính', '08:00'::TIME, '17:00'::TIME, 15, '12:00'::TIME, '13:00'::TIME, '{2,3,4,5,6}'::INTEGER[]),
    ('Ca sáng', '06:00'::TIME, '14:00'::TIME, 10, NULL::TIME, NULL::TIME, '{2,3,4,5,6,7}'::INTEGER[]),
    ('Ca chiều', '14:00'::TIME, '22:00'::TIME, 10, NULL::TIME, NULL::TIME, '{2,3,4,5,6,7}'::INTEGER[]),
    ('Ca tài xế', '05:00'::TIME, '17:00'::TIME, 30, '11:00'::TIME, '12:00'::TIME, '{2,3,4,5,6,7}'::INTEGER[])
) AS t(config_name, config_start, config_end, config_late, config_break_start, config_break_end, config_days);

-- Mẫu KPI cho tài xế
INSERT INTO kpi_templates (id, position_id, criteria_name, weight, target_description, measurement_method)
SELECT
    gen_random_uuid(),
    (SELECT id FROM positions WHERE code = 'TX'),
    criteria,
    w,
    target_desc,
    measure
FROM (VALUES
    ('Số chuyến hoàn thành', 30.00, 'Hoàn thành tối thiểu 20 chuyến/tháng', 'Đếm số lệnh điều động hoàn thành'),
    ('Tỷ lệ giao hàng đúng hẹn', 25.00, 'Đạt tỷ lệ >= 95%', 'Số chuyến đúng giờ / Tổng chuyến'),
    ('Vi phạm giao thông', 20.00, 'Không có vi phạm nào', 'Số vi phạm trong kỳ = 0'),
    ('Bảo quản xe', 15.00, 'Xe luôn sạch sẽ, bảo dưỡng đúng hạn', 'Kiểm tra định kỳ'),
    ('Tiết kiệm nhiên liệu', 10.00, 'Tiêu hao nhiên liệu <= định mức', 'So sánh thực tế vs định mức')
) AS t(criteria, w, target_desc, measure);

-- Biểu mẫu mặc định
INSERT INTO document_templates (id, name, category, description, version, status)
SELECT gen_random_uuid(), tmpl_name, tmpl_cat, tmpl_desc, 1, 'active'
FROM (VALUES
    ('Hợp đồng lao động thử việc', 'contract'::document_category, 'Mẫu HĐLĐ cho nhân viên thử việc'),
    ('Hợp đồng lao động có thời hạn', 'contract'::document_category, 'Mẫu HĐLĐ có thời hạn 1-3 năm'),
    ('Hợp đồng lao động không thời hạn', 'contract'::document_category, 'Mẫu HĐLĐ không xác định thời hạn'),
    ('Quyết định bổ nhiệm', 'decision'::document_category, 'Mẫu QĐ bổ nhiệm chức vụ'),
    ('Quyết định điều chuyển', 'decision'::document_category, 'Mẫu QĐ điều chuyển nhân sự'),
    ('Quyết định khen thưởng', 'decision'::document_category, 'Mẫu QĐ khen thưởng'),
    ('Quyết định kỷ luật', 'decision'::document_category, 'Mẫu QĐ kỷ luật'),
    ('Quyết định chấm dứt HĐLĐ', 'decision'::document_category, 'Mẫu QĐ chấm dứt hợp đồng'),
    ('Biên bản bàn giao tài sản', 'handover'::document_category, 'Mẫu BB bàn giao tài sản/thiết bị'),
    ('Biên bản bàn giao công việc', 'handover'::document_category, 'Mẫu BB bàn giao công việc khi nghỉ việc'),
    ('Cam kết bảo mật thông tin', 'commitment'::document_category, 'Mẫu cam kết bảo mật thông tin công ty'),
    ('Cam kết an toàn giao thông', 'commitment'::document_category, 'Mẫu cam kết chấp hành luật ATGT (tài xế)')
) AS t(tmpl_name, tmpl_cat, tmpl_desc);

-- ============================================================================
-- HOÀN THÀNH - Schema đã sẵn sàng
-- ============================================================================
-- Tổng cộng: 43 bảng, 5 views, 3 functions tự sinh mã, triggers updated_at
-- Modules: Core(6) + Recruitment(5) + Onboarding(1) + Employee(6) + Contract(2)
--          + Attendance(3) + Payroll(4) + KPI(4) + Asset(2) + Driver(6)
--          + Document(2) + Notifications(1) + Audit(1)
-- ============================================================================
