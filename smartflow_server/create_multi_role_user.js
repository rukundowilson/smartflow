import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smartflow',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function createMultiRoleUser() {
  try {
    const connection = await pool.getConnection();
    
    console.log('🔄 Creating multi-role user...');
    
    // Create a new user with multiple roles
    const [userResult] = await connection.query(
      'INSERT INTO users (full_name, email, password_hash, status) VALUES (?, ?, ?, ?)',
      ['Multi Role User', 'multiuser@company.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active']
    );
    
    const userId = userResult.insertId;
    console.log(`✅ Created user with ID: ${userId}`);
    
    // Assign multiple roles to this user
    const roleAssignments = [
      { department_id: 1, role_id: 8, role_name: 'Line Manager' }, // IT Department - Line Manager
      { department_id: 1, role_id: 9, role_name: 'HOD' }, // IT Department - HOD
      { department_id: 1, role_id: 10, role_name: 'IT Manager' }, // IT Department - IT Manager
      { department_id: 2, role_id: 3, role_name: 'User' } // HR Department - User
    ];
    
    for (const assignment of roleAssignments) {
      await connection.query(
        'INSERT INTO user_department_roles (user_id, department_id, role_id, assigned_by, status) VALUES (?, ?, ?, ?, ?)',
        [userId, assignment.department_id, assignment.role_id, 1, 'active']
      );
      console.log(`✅ Assigned ${assignment.role_name} role`);
    }
    
    console.log('🎉 Multi-role user created successfully!');
    console.log('Email: multiuser@company.com');
    console.log('Password: password');
    console.log('Roles: Line Manager, HOD, IT Manager, User');
    
    connection.release();
  } catch (error) {
    console.error('❌ Error creating multi-role user:', error);
  } finally {
    await pool.end();
  }
}

createMultiRoleUser(); 