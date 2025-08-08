import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smartflow',
    waitForConnections: true,
    connectionLimit: 5,
  });

  const conn = await pool.getConnection();
  try {
    console.log('🔧 Creating notifications table if not exists...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('ticket','requisition','access_request','registration','system') NOT NULL,
        title VARCHAR(200) NOT NULL,
        message VARCHAR(500) NOT NULL,
        recipient_id INT NOT NULL,
        sender_id INT NULL,
        related_id INT NULL,
        related_type VARCHAR(100) NULL,
        status ENUM('unread','read') NOT NULL DEFAULT 'unread',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_recipient_status (recipient_id, status),
        INDEX idx_created (created_at DESC),
        CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ notifications table ready.');
  } catch (e) {
    console.error('❌ Failed to create notifications table:', e.message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

run().catch((e) => {
  console.error('❌ Migration error:', e);
  process.exit(1);
}); 