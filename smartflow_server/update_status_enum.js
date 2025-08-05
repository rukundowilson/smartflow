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

async function updateStatusEnum() {
  try {
    const connection = await pool.getConnection();
    
    console.log('🔄 Updating access_requests status ENUM...');
    
    // Update the status ENUM to include new values
    await connection.query(`
      ALTER TABLE access_requests 
      MODIFY COLUMN status ENUM(
        'pending_manager_approval', 
        'pending_hod', 
        'pending_it_manager', 
        'ready_for_assignment', 
        'granted', 
        'rejected'
      ) DEFAULT 'pending_manager_approval'
    `);
    
    console.log('✅ Status ENUM updated successfully!');
    console.log('New status values:');
    console.log('- pending_manager_approval (Line Manager)');
    console.log('- pending_hod (HOD)');
    console.log('- pending_it_manager (IT Manager)');
    console.log('- ready_for_assignment (Ready for IT assignment)');
    console.log('- granted (Fully approved)');
    console.log('- rejected (Rejected)');
    
    connection.release();
  } catch (error) {
    console.error('❌ Error updating status ENUM:', error);
  } finally {
    await pool.end();
  }
}

updateStatusEnum(); 