-- 1. Add email_verified column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- 2. Ensure the role column can store our new Roles (SUPER_ADMIN, etc)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 3. Seed the Super Admin User
-- Using user provided email: ayushdot123@gmail.com
INSERT INTO users (email, name, role, email_verified) 
VALUES ('ayushdot123@gmail.com', 'Super Admin', 'SUPER_ADMIN', TRUE)
ON CONFLICT (email) 
DO UPDATE SET role = 'SUPER_ADMIN', email_verified = TRUE;
