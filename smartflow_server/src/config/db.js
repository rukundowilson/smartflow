// db.js or db.ts
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smartflow',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 3), // Keep under provider max_user_connections to avoid 1226
  queueLimit: 0,
  connectTimeout: 60000, // 60 seconds
  charset: 'utf8mb4'
});

export async function getConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (err) {
    console.error('❌ Failed to get DB connection:', err);
    throw err;
  }
}

export async function query(sql, params) {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (err) {
    console.error('❌ DB query failed:', err);
    throw err;
  }
}

export async function clearPool() {
  try {
    await pool.end();
    console.log('✅ Database connection pool cleared');
  } catch (err) {
    console.error('❌ Failed to clear connection pool:', err);
  }
}

export default pool;
