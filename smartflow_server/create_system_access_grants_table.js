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
    console.log('🔧 Creating system_access_grants table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS system_access_grants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        system_id INT NOT NULL,
        granted_from_request_id INT NOT NULL,
        granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        granted_by INT,
        status ENUM('active', 'revoked', 'expired', 'scheduled_for_revocation') DEFAULT 'active',
        revoked_at TIMESTAMP NULL,
        revoked_by INT NULL,
        revocation_reason TEXT,
        effective_from DATE,
        effective_until DATE,
        is_permanent BOOLEAN DEFAULT FALSE,
        scheduled_revocation_date TIMESTAMP NULL,
        revocation_notification_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_status (user_id, status),
        INDEX idx_system_status (system_id, status),
        INDEX idx_granted_at (granted_at),
        INDEX idx_effective_dates (effective_from, effective_until),
        INDEX idx_scheduled_revocation (scheduled_revocation_date),
        INDEX idx_notification_sent (revocation_notification_sent),
        CONSTRAINT fk_sag_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_sag_system FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE CASCADE,
        CONSTRAINT fk_sag_request FOREIGN KEY (granted_from_request_id) REFERENCES system_access_requests(id),
        CONSTRAINT fk_sag_granted_by FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
        CONSTRAINT fk_sag_revoked_by FOREIGN KEY (revoked_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ system_access_grants table ready.');
  } catch (e) {
    console.error('❌ Error creating system_access_grants table:', e.message);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

createTable(); 