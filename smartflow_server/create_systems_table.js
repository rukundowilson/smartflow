import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'smartflow',
  waitForConnections: true,
  connectionLimit: 5,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4'
});

async function createSystemsTable() {
  try {
    const connection = await pool.getConnection();
    
    console.log('🔧 Creating systems table...');

    // Create systems table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS systems (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Systems table created successfully!');

    // Check if systems table is empty
    const [existingSystems] = await connection.query('SELECT COUNT(*) as count FROM systems');
    
    if (existingSystems[0].count === 0) {
      console.log('📝 Adding default systems...');
      
      // Add default systems
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

      console.log('✅ Default systems added successfully!');
    } else {
      console.log('ℹ️ Systems table already has data, skipping...');
    }

    connection.release();
    console.log('🎉 Systems table setup completed!');
    
  } catch (error) {
    console.error('❌ Error creating systems table:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createSystemsTable(); 