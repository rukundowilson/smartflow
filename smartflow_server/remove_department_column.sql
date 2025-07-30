-- Remove department column from users table
-- This script removes the old department column since we now use the user_departments junction table

USE smartflow;

-- Remove the department column from users table
ALTER TABLE users DROP COLUMN department;

-- Verify the change
DESCRIBE users; 