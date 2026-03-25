-- Insert new SUPER user for AccessParks Circuits Application
-- Database: circuits
-- Email: super@accessparks.com
-- Password: password123 (BCrypt hash)
-- This record can be executed in MySQL Workbench

INSERT INTO users (email, password, first_name, last_name, role, enabled, created_at, updated_at) 
VALUES ('super@accessparks.com', '$2a$10$slYQmyNdGzqy5LHjHJ2cYuP5tZ.tXVnEMJfE6lc1KfY4eFxMvNqFO', 'Super', 'User', 'SUPER', 1, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000);

-- Verify the user was created
SELECT id, email, first_name, last_name, role, enabled FROM users WHERE email = 'super@accessparks.com';
