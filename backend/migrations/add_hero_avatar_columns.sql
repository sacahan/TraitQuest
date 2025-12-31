-- 新增 hero_class_id 和 hero_avatar_url 欄位到 users 表
-- 執行日期: 2025-12-31

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS hero_class_id VARCHAR,
ADD COLUMN IF NOT EXISTS hero_avatar_url VARCHAR;

-- 建立索引以提升查詢效能（可選）
CREATE INDEX IF NOT EXISTS idx_users_hero_class_id ON users(hero_class_id);
