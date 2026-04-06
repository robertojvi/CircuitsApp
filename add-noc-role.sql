-- SQL script to add NOC role support to the users table
-- Run this script in your MySQL database

USE circuits;

-- Check current role column definition
-- DESCRIBE users;

-- Option 1: If role column is VARCHAR, no changes needed (should already support NOC)
-- Option 2: If role column is ENUM, modify it to support NOC
-- Run one of the following depending on your actual column type:

-- If the column is ENUM, modify it:
ALTER TABLE users MODIFY COLUMN role ENUM('SUPER', 'ADMIN', 'USER', 'NOC') NOT NULL;

-- Or if you prefer VARCHAR (more flexible):
-- ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL;

-- Verify the change:
-- DESCRIBE users;
-- SELECT DISTINCT role FROM users;
