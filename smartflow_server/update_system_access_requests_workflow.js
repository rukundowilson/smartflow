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

async function safeAlter(conn, sql) {
  try { await conn.query(sql); } catch (e) { /* ignore */ }
}

async function migrate() {
  const conn = await pool.getConnection();
  try {
    console.log('🔧 Updating system_access_requests workflow schema...');

    // 1) Expand enum to include both old and new values to avoid truncation
    await conn.query(`
      ALTER TABLE system_access_requests
      MODIFY COLUMN status ENUM(
        'pending', 'approved', 'rejected',
        'request_pending',
        'line_manager_pending',
        'hod_pending',
        'it_hod_pending',
        'it_manager_pending',
        'it_support_review',
        'granted'
      ) NOT NULL DEFAULT 'request_pending'
    `);

    // 2) Map old statuses to new values
    await conn.query(`UPDATE system_access_requests SET status = 'request_pending' WHERE status = 'pending'`);
    await conn.query(`UPDATE system_access_requests SET status = 'granted' WHERE status = 'approved'`);
    // 'rejected' stays as 'rejected'

    // 3) Optionally narrow enum (keep old values in case other rows are inserted elsewhere)
    // Skipped narrowing to avoid potential failures across environments

    // 4) Add stage audit columns and indexes individually (ignore if exist)
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD COLUMN line_manager_id INT NULL`);
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD COLUMN line_manager_at DATETIME NULL`);
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD COLUMN hod_id INT NULL`);
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD COLUMN hod_at DATETIME NULL`);
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD COLUMN it_hod_id INT NULL`);
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD COLUMN it_hod_at DATETIME NULL`);
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD COLUMN it_manager_id INT NULL`);
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD COLUMN it_manager_at DATETIME NULL`);
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD COLUMN it_support_id INT NULL`);
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD COLUMN it_support_at DATETIME NULL`);

    await safeAlter(conn, `ALTER TABLE system_access_requests ADD INDEX idx_lm_id (line_manager_id)`);
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD INDEX idx_hod_id (hod_id)`);
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD INDEX idx_it_hod_id (it_hod_id)`);
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD INDEX idx_it_manager_id (it_manager_id)`);
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD INDEX idx_it_support_id (it_support_id)`);

    // 5) Add foreign keys (ignore if exist)
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD CONSTRAINT fk_sar_lm_user FOREIGN KEY (line_manager_id) REFERENCES users(id) ON DELETE SET NULL`);
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD CONSTRAINT fk_sar_hod_user FOREIGN KEY (hod_id) REFERENCES users(id) ON DELETE SET NULL`);
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD CONSTRAINT fk_sar_it_hod_user FOREIGN KEY (it_hod_id) REFERENCES users(id) ON DELETE SET NULL`);
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD CONSTRAINT fk_sar_it_manager_user FOREIGN KEY (it_manager_id) REFERENCES users(id) ON DELETE SET NULL`);
    await safeAlter(conn, `ALTER TABLE system_access_requests ADD CONSTRAINT fk_sar_it_support_user FOREIGN KEY (it_support_id) REFERENCES users(id) ON DELETE SET NULL`);

    console.log('✅ Workflow schema updated.');
  } catch (e) {
    console.error('❌ Migration error:', e.message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

migrate(); 