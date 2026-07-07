-- Thêm cột khu vực làm việc cho ứng viên (dùng cho phân quyền theo khu vực
-- và map sang tổ chức/mã nhân viên khi convert-to-employee)
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS work_area VARCHAR(255);
