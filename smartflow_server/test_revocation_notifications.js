import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { sendAccessRevokedEmail } from './src/services/emailService.js';
import { sendNotificationToUsers } from './src/controllers/notificationController.js';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function testRevocationNotifications() {
  const connection = await pool.getConnection();
  try {
    console.log('🧪 Testing Access Revocation Notifications...');
    
    // Check if user is in /others/ department
    async function isUserInOthersDepartment(userId) {
      const [rows] = await connection.query(
        `SELECT udr.department_id, d.name as department_name
         FROM user_department_roles udr
         JOIN departments d ON udr.department_id = d.id
         WHERE udr.user_id = ? AND udr.status = 'active'`,
        [userId]
      );
      
      const othersDepartments = rows.filter(row => 
        !['IT Department', 'Human Resources', 'Superadmin', 'IT hod'].includes(row.department_name)
      );
      
      return othersDepartments.length > 0;
    }

    // Get all users and their departments
    console.log('\n👥 Checking users and their departments:');
    const [users] = await connection.query(`
      SELECT u.id, u.email, u.full_name, d.name as department_name
      FROM users u
      LEFT JOIN user_department_roles udr ON u.id = udr.user_id AND udr.status = 'active'
      LEFT JOIN departments d ON udr.department_id = d.id
      ORDER BY u.id
    `);

    users.forEach(user => {
      const isOthers = !['IT Department', 'Human Resources', 'Superadmin', 'IT hod'].includes(user.department_name);
      console.log(`- User ${user.id}: ${user.email} (${user.department_name || 'No department'}) ${isOthers ? '→ /others/' : ''}`);
    });

    // Find a user in /others/ department
    const othersUser = users.find(user => 
      !['IT Department', 'Human Resources', 'Superadmin', 'IT hod'].includes(user.department_name)
    );

    if (!othersUser) {
      console.log('\n❌ No users found in /others/ department');
      return;
    }

    console.log(`\n✅ Found /others/ user: ${othersUser.email} (${othersUser.department_name})`);

    // Test email notification
    console.log('\n📧 Testing email notification...');
    try {
      await sendAccessRevokedEmail({
        to: othersUser.email,
        systemName: 'Test System',
        reason: 'Testing notification system'
      });
      console.log('✅ Email notification sent successfully');
    } catch (error) {
      console.log('❌ Email notification failed:', error.message);
    }

    // Test in-app notification
    console.log('\n🔔 Testing in-app notification...');
    try {
      await sendNotificationToUsers([othersUser.id], {
        type: 'access_revocation',
        title: '🔒 System Access Revoked (Test)',
        message: `Your access to Test System has been revoked. Reason: Testing notification system. Please contact IT support if you need access again.`,
        sender_id: 1,
        related_type: 'system_access_grant'
      });
      console.log('✅ In-app notification sent successfully');
    } catch (error) {
      console.log('❌ In-app notification failed:', error.message);
    }

    console.log('\n🎉 Notification testing completed!');

  } catch (error) {
    console.error('Error testing notifications:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

testRevocationNotifications(); 