import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function updateNotificationTypes() {
  const connection = await pool.getConnection();
  try {
    console.log('🔧 Updating notification types enum...');
    
    // Add access_revocation to the enum
    await connection.query(`
      ALTER TABLE notifications 
      MODIFY COLUMN type ENUM('ticket','requisition','access_request','access_revocation','registration','system') NOT NULL
    `);
    
    console.log('✅ Successfully added access_revocation to notification types');
    
    // Verify the change
    const [columns] = await connection.query('DESCRIBE notifications');
    const typeColumn = columns.find(col => col.Field === 'type');
    console.log('📋 Updated type column:', typeColumn.Type);
    
  } catch (error) {
    console.error('❌ Error updating notification types:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

updateNotificationTypes(); 