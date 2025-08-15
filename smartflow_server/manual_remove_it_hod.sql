-- Manual SQL commands to remove IT hod department
-- Run these commands one by one in your MySQL client

-- 1. First, check what we're working with
SELECT 'Current departments:' as info;
SELECT id, name FROM departments ORDER BY id;

SELECT 'Users assigned to IT hod department:' as info;
SELECT udr.id, u.full_name, d.name as department, r.name as role
FROM user_department_roles udr
JOIN users u ON udr.user_id = u.id
JOIN departments d ON udr.department_id = d.id
JOIN roles r ON udr.role_id = r.id
WHERE d.name = 'IT hod' OR d.name = 'IT HOD';

-- 2. Update user assignments from IT hod to IT Department
UPDATE user_department_roles 
SET department_id = (SELECT id FROM departments WHERE name = 'IT Department' LIMIT 1)
WHERE department_id = (SELECT id FROM departments WHERE name = 'IT hod' OR name = 'IT HOD' LIMIT 1);

-- 3. Update access requests
UPDATE access_requests 
SET department_id = (SELECT id FROM departments WHERE name = 'IT Department' LIMIT 1)
WHERE department_id = (SELECT id FROM departments WHERE name = 'IT hod' OR name = 'IT HOD' LIMIT 1);

-- 4. Update system access requests
UPDATE system_access_requests 
SET department_id = (SELECT id FROM departments WHERE name = 'IT Department' LIMIT 1)
WHERE department_id = (SELECT id FROM departments WHERE name = 'IT hod' OR name = 'IT HOD' LIMIT 1);

-- 5. Update tickets
UPDATE tickets 
SET department_id = (SELECT id FROM departments WHERE name = 'IT Department' LIMIT 1)
WHERE department_id = (SELECT id FROM departments WHERE name = 'IT hod' OR name = 'IT HOD' LIMIT 1);

-- 6. Finally, delete the IT hod department
DELETE FROM departments WHERE name = 'IT hod' OR name = 'IT HOD';

-- 7. Verify the changes
SELECT 'Updated departments:' as info;
SELECT id, name FROM departments ORDER BY id;

SELECT 'IT Department users after update:' as info;
SELECT udr.id, u.full_name, d.name as department, r.name as role
FROM user_department_roles udr
JOIN users u ON udr.user_id = u.id
JOIN departments d ON udr.department_id = d.id
JOIN roles r ON udr.role_id = r.id
WHERE d.name = 'IT Department'
ORDER BY u.full_name; 