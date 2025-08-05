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

async function createTestRequests() {
  try {
    const connection = await pool.getConnection();

    console.log('📋 Creating test access requests...');

    // Get user, department, and role IDs
    const [users] = await connection.query('SELECT id, full_name FROM users');
    const [departments] = await connection.query('SELECT id, name FROM departments');
    const [roles] = await connection.query('SELECT id, name FROM roles');

    console.log('Users:', users);
    console.log('Departments:', departments);
    console.log('Roles:', roles);

    // Find a user and IT Department
    const testUser = users.find(u => u.full_name === 'taja');
    const itDepartment = departments.find(d => d.name === 'IT Department');
    const userRole = roles.find(r => r.name === 'User');

    if (!testUser || !itDepartment || !userRole) {
      console.error('Required test data not found');
      console.log('Available users:', users.map(u => u.full_name));
      console.log('Available departments:', departments.map(d => d.name));
      console.log('Available roles:', roles.map(r => r.name));
      return;
    }

    // Create a test access request
    const [result] = await connection.query(
      `INSERT INTO access_requests 
       (user_id, department_id, role_id, justification, start_date, end_date, is_permanent, status, submitted_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        testUser.id,
        itDepartment.id,
        userRole.id,
        'Need access for development work',
        '2024-01-01',
        '2024-12-31',
        false,
        'pending_manager_approval'
      ]
    );

    console.log('✅ Test access request created successfully!');
    console.log('Request ID:', result.insertId);

    // Create another request for a different department
    const marketingDepartment = departments.find(d => d.name === 'Marketing');
    const marketingUserRole = roles.find(r => r.name === 'User');

    if (marketingDepartment && marketingUserRole) {
      const [result2] = await connection.query(
        `INSERT INTO access_requests 
         (user_id, department_id, role_id, justification, start_date, end_date, is_permanent, status, submitted_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          testUser.id,
          marketingDepartment.id,
          marketingUserRole.id,
          'Need access for marketing campaigns',
          '2024-01-01',
          '2024-12-31',
          false,
          'pending_manager_approval'
        ]
      );

      console.log('✅ Second test access request created successfully!');
      console.log('Request ID:', result2.insertId);
    }

    connection.release();
  } catch (error) {
    console.error('Error creating test requests:', error);
  }
}

createTestRequests().then(() => {
  console.log('✅ Test data creation completed!');
  process.exit(0);
}).catch(console.error); 