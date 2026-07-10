-- Thêm cột deleted_at cho employee_documents để hỗ trợ xóa mềm (giữ lịch sử).
-- Bản ghi bị "xóa" chỉ set deleted_at = NOW(), không xóa hẳn khỏi DB.
ALTER TABLE employee_documents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
