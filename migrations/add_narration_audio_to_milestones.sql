-- Thêm cột narration_audio vào bảng milestones
ALTER TABLE milestones ADD COLUMN narration_audio LONGTEXT AFTER quiz;

-- Hoặc nếu bảng đã có cột này, bỏ qua lỗi:
-- ALTER TABLE milestones ADD COLUMN IF NOT EXISTS narration_audio LONGTEXT AFTER quiz;
