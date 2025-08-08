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
    console.log('🔧 Updating comments.comment_type enum...');
    await conn.query(`
      ALTER TABLE comments
      MODIFY COLUMN comment_type ENUM('ticket','requisition','system_access_request') NOT NULL
    `);
    console.log('✅ comments.comment_type updated.');
  } catch (e) {
    console.error('❌ Failed to update comments enum:', e.message);
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