-- 移除 avatar_url 欄位，統一使用 hero_avatar_url
-- 執行日期: 2025-12-31

-- 先將現有的 avatar_url 資料遷移到 hero_avatar_url（如果需要的話）
-- UPDATE users SET hero_avatar_url = avatar_url WHERE hero_avatar_url IS NULL AND avatar_url IS NOT NULL;

-- 移除 avatar_url 欄位
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
