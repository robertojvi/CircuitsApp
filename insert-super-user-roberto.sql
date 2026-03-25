-- Insert new SUPER user for AccessParks Circuits Application
-- Database: circuits
-- Email: roberto.iniguez@accessparks.com
-- Password: RoAnCa8157 (BCrypt hash)
-- This record can be executed in MySQL Workbench

USE circuits;

INSERT INTO users (email, password, first_name, last_name, role, enabled, created_at, updated_at) 
VALUES ('roberto.iniguez@accessparks.com', '$2b$10$qq8G.nbiubTDhPOy/ej73.FHmSIMnNRi3h7j/hdfhJ75CVAJkHWV.', 'Roberto', 'Iniguez', 'SUPER', 1, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000);

-- Verify the user was created
SELECT id, email, first_name, last_name, role, enabled FROM users WHERE email = 'roberto.iniguez@accessparks.com';
