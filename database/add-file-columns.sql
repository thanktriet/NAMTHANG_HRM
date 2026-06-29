-- Thêm cột file cho khen thưởng/kỷ luật
ALTER TABLE rewards_disciplines ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE rewards_disciplines ADD COLUMN IF NOT EXISTS file_path VARCHAR(500);

-- Thêm cột file cho hợp đồng
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS file_path VARCHAR(500);
