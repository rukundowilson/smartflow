-- Remove IT hod department and update related data
-- This script handles the migration from IT hod department to IT HOD role within IT Department

START TRANSACTION;

-- First, get the IT hod department ID
SET @it_hod_dept_id = (SELECT id FROM departments WHERE name = 'IT hod' OR name = 'IT HOD' LIMIT 1);

-- Get the IT Department ID
SET @it_dept_id = (SELECT id FROM departments WHERE name = 'IT Department' OR name = 'it department' LIMIT 1);

-- Check if IT hod department exists
SELECT IF(@it_hod_dept_id IS NOT NULL, 'IT hod department found', 'IT hod department not found') as status;

-- If IT hod department exists, update all references
IF @it_hod_dept_id IS NOT NULL THEN

    -- Update user_department_roles
    UPDATE user_department_roles 
    SET department_id = @it_dept_id 
    WHERE department_id = @it_hod_dept_id;
    
    SELECT CONCAT('Updated ', ROW_COUNT(), ' user department role assignments') as result;

    -- Update access_requests
    UPDATE access_requests 
    SET department_id = @it_dept_id 
    WHERE department_id = @it_hod_dept_id;
    
    SELECT CONCAT('Updated ', ROW_COUNT(), ' access requests') as result;

    -- Update system_access_requests
    UPDATE system_access_requests 
    SET department_id = @it_dept_id 
    WHERE department_id = @it_hod_dept_id;
    
    SELECT CONCAT('Updated ', ROW_COUNT(), ' system access requests') as result;

    -- Update tickets
    UPDATE tickets 
    SET department_id = @it_dept_id 
    WHERE department_id = @it_hod_dept_id;
    
    SELECT CONCAT('Updated ', ROW_COUNT(), ' tickets') as result;

    -- Finally, delete the IT hod department
    DELETE FROM departments WHERE id = @it_hod_dept_id;
    
    SELECT CONCAT('Removed IT hod department (ID: ', @it_hod_dept_id, ')') as result;

ELSE
    SELECT 'IT hod department not found - no action needed' as result;
END IF;

COMMIT;

-- Verify the changes
SELECT 'Verification:' as info;
SELECT 'Remaining departments:' as info;
SELECT id, name FROM departments ORDER BY id;

SELECT 'User department roles:' as info;
SELECT udr.id, u.full_name, d.name as department, r.name as role
FROM user_department_roles udr
JOIN users u ON udr.user_id = u.id
JOIN departments d ON udr.department_id = d.id
JOIN roles r ON udr.role_id = r.id
WHERE d.name = 'IT Department'
ORDER BY u.full_name; 