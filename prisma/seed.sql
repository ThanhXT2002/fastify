-- Insert test users with different roles
INSERT INTO "public"."users" (id, email, name, "avatarUrl", role, key, "createdAt") VALUES
('admin-uuid-1', 'admin@example.com', 'Admin User', null, 'ADMIN', 'admin-api-key-1', NOW()),
('editor-uuid-1', 'editor@example.com', 'Editor User', null, 'EDITOR', 'editor-api-key-1', NOW()),
('user-uuid-1', 'user@example.com', 'Regular User', null, 'USER', 'user-api-key-1', NOW());

-- Note: These are example data. In production:
-- 1. User IDs should match Supabase Auth user IDs
-- 2. API keys should be proper UUIDs
-- 3. Use proper password hashing
-- 4. Set up proper Supabase Auth users first
