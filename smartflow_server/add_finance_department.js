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

async function addFinanceDepartment() {
  try {
    const connection = await pool.getConnection();

    console.log('💰 Adding Finance Department...');

    // Check if Finance department already exists
    const [existingDepts] = await connection.query(
      'SELECT * FROM departments WHERE name = ?',
      ['Finance']
    );

    if (existingDepts.length > 0) {
      console.log('✅ Finance Department already exists');
    } else {
      // Add Finance department
      await connection.query(
        'INSERT INTO departments (name, description) VALUES (?, ?)',
        ['Finance', 'Finance and Accounting Department']
      );

      console.log('✅ Finance Department created successfully!');
    }

    // Also check if we need to add Finance roles
    const [existingRoles] = await connection.query(
      'SELECT * FROM roles WHERE name IN (?, ?, ?)',
      ['Finance Manager', 'Accountant', 'Finance User']
    );

    if (existingRoles.length < 3) {
      console.log('👥 Adding Finance roles...');
      
      const financeRoles = [
        { name: 'Finance Manager', description: 'Finance Department Manager' },
        { name: 'Accountant', description: 'Accountant' },
        { name: 'Finance User', description: 'Regular Finance Department User' }
      ];

      for (const role of financeRoles) {
        const [roleExists] = await connection.query(
          'SELECT * FROM roles WHERE name = ?',
          [role.name]
        );

        if (roleExists.length === 0) {
          await connection.query(
            'INSERT INTO roles (name, description) VALUES (?, ?)',
            [role.name, role.description]
          );
          console.log(`✅ Added role: ${role.name}`);
        }
      }
    } else {
      console.log('✅ Finance roles already exist');
    }

    connection.release();
    console.log('🎉 Finance Department setup complete!');

  } catch (error) {
    console.error('❌ Error adding Finance Department:', error);
  } finally {
    await pool.end();
  }
}

addFinanceDepartment(); 