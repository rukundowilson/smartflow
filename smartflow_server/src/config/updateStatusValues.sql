-- Update access_requests table to support new multi-level approval status values

-- First, let's check the current status values
SELECT DISTINCT status FROM access_requests;

-- Update existing requests to use new status values
UPDATE access_requests 
SET status = 'pending_line_manager' 
WHERE status = 'pending_manager_approval';

-- Add new status values to the ENUM if it exists, or modify the column
-- This depends on your database schema. If you're using MySQL with ENUM:
-- ALTER TABLE access_requests MODIFY COLUMN status ENUM('pending_line_manager', 'pending_hod', 'pending_it_manager', 'granted', 'rejected') NOT NULL DEFAULT 'pending_line_manager';

-- For now, we'll use VARCHAR which is more flexible
-- The column should already be VARCHAR, so we just need to ensure the new values are accepted

-- Verify the updates
SELECT id, status, user_name, system_name, role_name 
FROM access_requests 
ORDER BY submitted_at DESC 
LIMIT 10; 