-- Bảng lưu hồ sơ nhân viên (chỉ cho thêm, không cho xóa)
CREATE TABLE IF NOT EXISTS employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  document_type VARCHAR(50) NOT NULL, -- cccd, so_yeu_ly_lich, giay_kham_suc_khoe, bang_lai
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID,
  notes TEXT
);

CREATE INDEX idx_employee_documents_employee_id ON employee_documents(employee_id);
CREATE INDEX idx_employee_documents_type ON employee_documents(document_type);

COMMENT ON TABLE employee_documents IS 'Hồ sơ nhân viên - chỉ cho phép thêm, không cho xóa';
