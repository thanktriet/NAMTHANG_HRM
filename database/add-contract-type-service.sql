-- Thêm loại hợp đồng "dịch vụ" (service) vào enum contract_type.
-- HĐ dịch vụ: không đóng BHXH/BHYT/BHTN, khấu trừ thuế TNCN thẳng 10%.
-- Lưu ý: ALTER TYPE ... ADD VALUE không chạy được trong transaction block ở
-- một số phiên bản PostgreSQL cũ; chạy trực tiếp (không bọc BEGIN/COMMIT).
ALTER TYPE contract_type ADD VALUE IF NOT EXISTS 'service';
