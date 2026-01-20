ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

INSERT INTO users (email, name, role, email_verified) 
VALUES ('ayushdot123@gmail.com', 'Super Admin', 'SUPER_ADMIN', TRUE)
ON CONFLICT (email) 
DO UPDATE SET role = 'SUPER_ADMIN', email_verified = TRUE;
