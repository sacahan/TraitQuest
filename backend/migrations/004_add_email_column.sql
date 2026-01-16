-- 004: 新增 email 欄位
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
