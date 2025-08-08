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
});

async function createTable() {
  const connection = await pool.getConnection();
  try {
    console.log('🔧 Creating system_access_requests table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS system_access_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        system_id INT NOT NULL,
        justification TEXT NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NULL,
        is_permanent BOOLEAN DEFAULT FALSE,
        status ENUM('pending','approved','rejected') DEFAULT 'pending',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_system_id (system_id),
        CONSTRAINT fk_sar_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_sar_system FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ system_access_requests table ready.');
  } catch (e) {
    console.error('❌ Error creating system_access_requests table:', e.message);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

createTable(); 