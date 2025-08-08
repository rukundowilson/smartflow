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

async function createAuditLogsTable() {
  const connection = await pool.getConnection();
  try {
    console.log('🔧 Creating audit_logs table...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id INT NULL,
        actor_user_id INT NULL,
        details JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_entity_type_id (entity_type, entity_id),
        INDEX idx_action (action),
        INDEX idx_actor_user_id (actor_user_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ audit_logs table is ready.');
  } catch (err) {
    console.error('❌ Error creating audit_logs table:', err.message);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

createAuditLogsTable(); 