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

async function setupLineManager() {
  try {
    const connection = await pool.getConnection();

    console.log('👤 Setting up Line Manager for IT Department...');

    // Get user, department, and role IDs
    const [users] = await connection.query('SELECT id, full_name FROM users');
    const [departments] = await connection.query('SELECT id, name FROM departments');
    const [roles] = await connection.query('SELECT id, name FROM roles');

    console.log('Users:', users);
    console.log('Departments:', departments);
    console.log('Roles:', roles);

    // Find a user to assign as Line Manager
    const lineManagerUser = users.find(u => u.full_name === 'willy');
    const itDepartment = departments.find(d => d.name === 'IT Department');
    const lineManagerRole = roles.find(r => r.name === 'Line Manager');

    if (!lineManagerUser || !itDepartment || !lineManagerRole) {
      console.error('Required data not found');
      return;
    }

    // Check if this assignment already exists
    const [existingAssignments] = await connection.query(
      'SELECT * FROM user_department_roles WHERE user_id = ? AND department_id = ? AND role_id = ?',
      [lineManagerUser.id, itDepartment.id, lineManagerRole.id]
    );

    if (existingAssignments.length > 0) {
      console.log('✅ Line Manager assignment already exists');
    } else {
      // Create the assignment
      await connection.query(
        'INSERT INTO user_department_roles (user_id, department_id, role_id, assigned_by, status) VALUES (?, ?, ?, ?, ?)',
        [lineManagerUser.id, itDepartment.id, lineManagerRole.id, 1, 'active']
      );

      console.log('✅ Line Manager assignment created successfully!');
    }

    // Also assign to Marketing Department for testing
    const marketingDepartment = departments.find(d => d.name === 'Marketing');
    if (marketingDepartment) {
      const [existingMarketingAssignments] = await connection.query(
        'SELECT * FROM user_department_roles WHERE user_id = ? AND department_id = ? AND role_id = ?',
        [lineManagerUser.id, marketingDepartment.id, lineManagerRole.id]
      );

      if (existingMarketingAssignments.length === 0) {
        await connection.query(
          'INSERT INTO user_department_roles (user_id, department_id, role_id, assigned_by, status) VALUES (?, ?, ?, ?, ?)',
          [lineManagerUser.id, marketingDepartment.id, lineManagerRole.id, 1, 'active']
        );

        console.log('✅ Line Manager assignment to Marketing created successfully!');
      }
    }

    // Show current assignments
    const [assignments] = await connection.query(`
      SELECT 
        u.full_name,
        d.name as department_name,
        r.name as role_name
      FROM user_department_roles udr
      JOIN users u ON udr.user_id = u.id
      JOIN departments d ON udr.department_id = d.id
      JOIN roles r ON udr.role_id = r.id
      WHERE u.full_name = ?
    `, [lineManagerUser.full_name]);

    console.log('Current assignments for', lineManagerUser.full_name + ':', assignments);

    connection.release();
  } catch (error) {
    console.error('Error setting up Line Manager:', error);
  }
}

setupLineManager().then(() => {
  console.log('✅ Line Manager setup completed!');
  process.exit(0);
}).catch(console.error); 