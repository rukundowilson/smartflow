import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'smartflow',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function clearAndSetupDatabase() {
  try {
    const connection = await pool.getConnection();

    console.log('🗑️ Clearing database...');

    // Clear all data using TRUNCATE to avoid foreign key constraints
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE request_approvals');
    await connection.query('TRUNCATE TABLE access_requests');
    await connection.query('TRUNCATE TABLE registration_applications');
    await connection.query('TRUNCATE TABLE user_department_roles');
    await connection.query('TRUNCATE TABLE tickets');
    await connection.query('TRUNCATE TABLE comments');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('TRUNCATE TABLE roles');
    await connection.query('TRUNCATE TABLE systems');
    await connection.query('TRUNCATE TABLE departments');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ Database cleared successfully!');

    console.log('🏢 Creating departments...');

    // Create departments
    const departments = [
      { name: 'IT Department', description: 'Information Technology Department' },
      { name: 'HR Department', description: 'Human Resources Department' },
      { name: 'Finance Department', description: 'Finance and Accounting Department' },
      { name: 'Marketing Department', description: 'Marketing and Sales Department' }
    ];

    for (const dept of departments) {
      await connection.query(
        'INSERT INTO departments (name, description) VALUES (?, ?)',
        [dept.name, dept.description]
      );
    }

    console.log('✅ Departments created successfully!');

    console.log('👥 Creating roles...');

    // Create roles
    const roles = [
      // IT Department Roles
      { name: 'IT Manager', description: 'IT Department Manager - Third level approver' },
      { name: 'HOD', description: 'Head of Department - Second level approver' },
      { name: 'Line Manager', description: 'Line Manager - First level approver' },
      { name: 'IT Support', description: 'IT Support Technician' },
      { name: 'Developer', description: 'Software Developer' },
      { name: 'User', description: 'Regular IT Department User' },

      // HR Department Roles
      { name: 'HR Manager', description: 'HR Department Manager' },
      { name: 'HR Officer', description: 'HR Officer' },
      { name: 'Recruiter', description: 'HR Recruiter' },
      { name: 'HR User', description: 'Regular HR Department User' },

      // Finance Department Roles
      { name: 'Finance Manager', description: 'Finance Department Manager' },
      { name: 'Accountant', description: 'Accountant' },
      { name: 'Finance User', description: 'Regular Finance Department User' },

      // Marketing Department Roles
      { name: 'Marketing Manager', description: 'Marketing Department Manager' },
      { name: 'Marketing Specialist', description: 'Marketing Specialist' },
      { name: 'Marketing User', description: 'Regular Marketing Department User' }
    ];

    for (const role of roles) {
      await connection.query(
        'INSERT INTO roles (name, description) VALUES (?, ?)',
        [role.name, role.description]
      );
    }

    console.log('✅ Roles created successfully!');

    console.log('💻 Creating systems...');

    // Create systems
    const systems = [
      { name: 'ticketing', description: 'Ticket Management System' },
      { name: 'crm', description: 'Customer Relationship Management' },
      { name: 'payroll', description: 'Payroll Processing System' },
      { name: 'admin', description: 'Admin Portal' },
      { name: 'inventory', description: 'Inventory Management System' },
      { name: 'accounting', description: 'Accounting System' }
    ];

    for (const system of systems) {
      await connection.query(
        'INSERT INTO systems (name, description) VALUES (?, ?)',
        [system.name, system.description]
      );
    }

    console.log('✅ Systems created successfully!');

    console.log('👤 Creating test users...');

    // Create test users
    const users = [
      { full_name: 'John Line Manager', email: 'linemanager@company.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', status: 'active' },
      { full_name: 'Sarah HOD', email: 'hod@company.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', status: 'active' },
      { full_name: 'Mike IT Manager', email: 'itmanager@company.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', status: 'active' },
      { full_name: 'Lisa HR Manager', email: 'hrmanager@company.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', status: 'active' },
      { full_name: 'David Finance Manager', email: 'financemanager@company.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', status: 'active' },
      { full_name: 'Emma Marketing Manager', email: 'marketingmanager@company.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', status: 'active' },
      { full_name: 'Alex IT Support', email: 'itsupport@company.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', status: 'active' },
      { full_name: 'Test User', email: 'testuser@company.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', status: 'active' },
      { full_name: 'Multi Role User', email: 'multiuser@company.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', status: 'active' }
    ];

    for (const user of users) {
      await connection.query(
        'INSERT INTO users (full_name, email, password_hash, status) VALUES (?, ?, ?, ?)',
        [user.full_name, user.email, user.password, user.status]
      );
    }

    console.log('✅ Users created successfully!');

    console.log('🔗 Assigning roles to users...');

    // Get department and role IDs
    const [departmentRows] = await connection.query('SELECT id, name FROM departments');
    const [roleRows] = await connection.query('SELECT id, name FROM roles');
    const [userRows] = await connection.query('SELECT id, full_name FROM users');

    // Create a map for easy lookup
    const deptMap = {};
    const roleMap = {};
    const userMap = {};

    departmentRows.forEach(dept => deptMap[dept.name] = dept.id);
    roleRows.forEach(role => roleMap[role.name] = role.id);
    userRows.forEach(user => userMap[user.full_name] = user.id);

    // Assign roles to users
    const roleAssignments = [
      // IT Department Assignments
      { user: 'John Line Manager', department: 'IT Department', role: 'Line Manager' },
      { user: 'Sarah HOD', department: 'IT Department', role: 'HOD' },
      { user: 'Mike IT Manager', department: 'IT Department', role: 'IT Manager' },
      { user: 'Alex IT Support', department: 'IT Department', role: 'IT Support' },
      { user: 'Test User', department: 'IT Department', role: 'User' },

      // HR Department Assignments
      { user: 'Lisa HR Manager', department: 'HR Department', role: 'HR Manager' },

      // Finance Department Assignments
      { user: 'David Finance Manager', department: 'Finance Department', role: 'Finance Manager' },

      // Marketing Department Assignments
      { user: 'Emma Marketing Manager', department: 'Marketing Department', role: 'Marketing Manager' },

      // Multi-role user (has multiple roles)
      { user: 'Multi Role User', department: 'IT Department', role: 'Line Manager' },
      { user: 'Multi Role User', department: 'IT Department', role: 'HOD' },
      { user: 'Multi Role User', department: 'IT Department', role: 'IT Manager' },
      { user: 'Multi Role User', department: 'HR Department', role: 'HR User' }
    ];

    for (const assignment of roleAssignments) {
      await connection.query(
        'INSERT INTO user_department_roles (user_id, department_id, role_id, assigned_by, status) VALUES (?, ?, ?, ?, ?)',
        [userMap[assignment.user], deptMap[assignment.department], roleMap[assignment.role], 1, 'active']
      );
    }

    console.log('✅ Role assignments completed successfully!');

    console.log('📋 Creating registration applications...');

    // Create some pending registration applications
    const pendingUsers = [
      { full_name: 'New User 1', email: 'newuser1@company.com', department_id: deptMap['IT Department'] },
      { full_name: 'New User 2', email: 'newuser2@company.com', department_id: deptMap['HR Department'] }
    ];

    for (const user of pendingUsers) {
      // Create user with pending status
      const [userResult] = await connection.query(
        'INSERT INTO users (full_name, email, password_hash, status) VALUES (?, ?, ?, ?)',
        [user.full_name, user.email, '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pending']
      );

      // Assign default role
      await connection.query(
        'INSERT INTO user_department_roles (user_id, department_id, role_id, assigned_by, status) VALUES (?, ?, ?, ?, ?)',
        [userResult.insertId, user.department_id, roleMap['User'], 1, 'active']
      );

      // Create registration application
      await connection.query(
        'INSERT INTO registration_applications (user_id, submitted_by) VALUES (?, ?)',
        [userResult.insertId, user.full_name]
      );
    }

    console.log('✅ Registration applications created successfully!');

    connection.release();

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- 4 Departments created');
    console.log('- 16 Roles created');
    console.log('- 6 Systems created');
    console.log('- 11 Users created');
    console.log('- Multiple role assignments');
    console.log('- 2 Pending registration applications');
    
    console.log('\n🔑 Test Accounts:');
    console.log('Email: linemanager@company.com | Password: password | Role: Line Manager');
    console.log('Email: hod@company.com | Password: password | Role: HOD');
    console.log('Email: itmanager@company.com | Password: password | Role: IT Manager');
    console.log('Email: testuser@company.com | Password: password | Role: User');
    console.log('Email: multiuser@company.com | Password: password | Roles: Line Manager, HOD, IT Manager, HR User');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

clearAndSetupDatabase(); 