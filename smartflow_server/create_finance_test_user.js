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

async function createFinanceTestUser() {
  try {
    const connection = await pool.getConnection();

    console.log('👤 Creating Finance test user...');

    // Check if test user already exists
    const [existingUsers] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['finance@test.com']
    );

    let userId;
    if (existingUsers.length > 0) {
      console.log('✅ Finance test user already exists');
      userId = existingUsers[0].id;
    } else {
      // Create test user
      const [result] = await connection.query(
        'INSERT INTO users (full_name, email, password_hash, status) VALUES (?, ?, ?, ?)',
        ['Finance User', 'finance@test.com', '$2b$10$test', 'active']
      );
      userId = result.insertId;
      console.log('✅ Finance test user created successfully!');
    }

    // Get department and role IDs
    const [departments] = await connection.query('SELECT id, name FROM departments WHERE name = ?', ['Finance']);
    const [roles] = await connection.query('SELECT id, name FROM roles WHERE name = ?', ['Finance User']);

    if (departments.length === 0 || roles.length === 0) {
      console.error('❌ Finance department or role not found');
      return;
    }

    const departmentId = departments[0].id;
    const roleId = roles[0].id;

    // Check if user-role assignment already exists
    const [existingAssignments] = await connection.query(
      'SELECT * FROM user_department_roles WHERE user_id = ? AND department_id = ? AND role_id = ?',
      [userId, departmentId, roleId]
    );

    if (existingAssignments.length > 0) {
      console.log('✅ Finance user role assignment already exists');
    } else {
      // Create user-role assignment
      await connection.query(
        'INSERT INTO user_department_roles (user_id, department_id, role_id, assigned_by, status) VALUES (?, ?, ?, ?, ?)',
        [userId, departmentId, roleId, 1, 'active']
      );

      console.log('✅ Finance user role assignment created successfully!');
    }

    // Also create a Marketing test user
    console.log('👤 Creating Marketing test user...');
    
    const [marketingUsers] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['marketing@test.com']
    );

    let marketingUserId;
    if (marketingUsers.length > 0) {
      console.log('✅ Marketing test user already exists');
      marketingUserId = marketingUsers[0].id;
    } else {
      // Create marketing test user
      const [result] = await connection.query(
        'INSERT INTO users (full_name, email, password_hash, status) VALUES (?, ?, ?, ?)',
        ['Marketing User', 'marketing@test.com', '$2b$10$test', 'active']
      );
      marketingUserId = result.insertId;
      console.log('✅ Marketing test user created successfully!');
    }

    // Get Marketing department and role IDs
    const [marketingDepts] = await connection.query('SELECT id, name FROM departments WHERE name = ?', ['Marketing']);
    const [marketingRoles] = await connection.query('SELECT id, name FROM roles WHERE name = ?', ['Marketing User']);

    if (marketingDepts.length === 0 || marketingRoles.length === 0) {
      console.log('⚠️ Marketing department or role not found, creating them...');
      
      // Create Marketing User role if it doesn't exist
      if (marketingRoles.length === 0) {
        await connection.query(
          'INSERT INTO roles (name, description) VALUES (?, ?)',
          ['Marketing User', 'Regular Marketing Department User']
        );
        console.log('✅ Created Marketing User role');
      }
    }

    // Get updated role ID
    const [updatedMarketingRoles] = await connection.query('SELECT id, name FROM roles WHERE name = ?', ['Marketing User']);
    const marketingRoleId = updatedMarketingRoles[0].id;

    // Check if marketing user-role assignment already exists
    const [existingMarketingAssignments] = await connection.query(
      'SELECT * FROM user_department_roles WHERE user_id = ? AND department_id = ? AND role_id = ?',
      [marketingUserId, marketingDepts[0].id, marketingRoleId]
    );

    if (existingMarketingAssignments.length > 0) {
      console.log('✅ Marketing user role assignment already exists');
    } else {
      // Create marketing user-role assignment
      await connection.query(
        'INSERT INTO user_department_roles (user_id, department_id, role_id, assigned_by, status) VALUES (?, ?, ?, ?, ?)',
        [marketingUserId, marketingDepts[0].id, marketingRoleId, 1, 'active']
      );

      console.log('✅ Marketing user role assignment created successfully!');
    }

    connection.release();
    console.log('🎉 Test users setup complete!');
    console.log('📧 Finance test user: finance@test.com');
    console.log('📧 Marketing test user: marketing@test.com');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await pool.end();
  }
}

createFinanceTestUser(); 