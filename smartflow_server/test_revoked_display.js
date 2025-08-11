import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function testRevokedDisplay() {
  const connection = await pool.getConnection();
  try {
    console.log('🧪 Testing Revoked Grants Display...');
    
    // Get all users
    const [users] = await connection.query('SELECT id, email, full_name FROM users LIMIT 5');
    
    console.log('\n👥 Testing with users:');
    users.forEach(user => {
      console.log(`- User ${user.id}: ${user.email} (${user.full_name})`);
    });
    
    // Test the revoked grants query for each user
    for (const user of users) {
      console.log(`\n📋 Testing revoked grants for user ${user.id} (${user.email}):`);
      
      const [revokedGrants] = await connection.query(
        `SELECT 
          sag.id, sag.user_id, sag.system_id, sag.revoked_at, sag.revoked_by,
          sag.revocation_reason, sag.granted_at, sag.granted_by,
          sag.effective_from, sag.effective_until, sag.is_permanent,
          u.full_name AS user_name, u.email AS user_email,
          s.name AS system_name, s.description AS system_description,
          rb.full_name AS revoked_by_name,
          gb.full_name AS granted_by_name
         FROM system_access_grants sag
         JOIN users u ON sag.user_id = u.id
         JOIN systems s ON sag.system_id = s.id
         LEFT JOIN users rb ON sag.revoked_by = rb.id
         LEFT JOIN users gb ON sag.granted_by = gb.id
         WHERE sag.user_id = ? AND sag.status = 'revoked'
         ORDER BY sag.revoked_at DESC`,
        [user.id]
      );
      
      if (revokedGrants.length === 0) {
        console.log(`  ❌ No revoked grants found for user ${user.id}`);
      } else {
        console.log(`  ✅ Found ${revokedGrants.length} revoked grants:`);
        revokedGrants.forEach(grant => {
          console.log(`    - Grant ${grant.id}: ${grant.system_name} (Revoked: ${grant.revoked_at})`);
          console.log(`      Reason: ${grant.revocation_reason || 'No reason provided'}`);
          console.log(`      Revoked by: ${grant.revoked_by_name || 'Unknown'}`);
        });
      }
    }
    
    // Test the API endpoint simulation
    console.log('\n🌐 Testing API endpoint simulation...');
    const testUserId = users[0]?.id || 1;
    
    const [apiTest] = await connection.query(
      `SELECT 
        sag.id, sag.user_id, sag.system_id, sag.revoked_at, sag.revoked_by,
        sag.revocation_reason, sag.granted_at, sag.granted_by,
        sag.effective_from, sag.effective_until, sag.is_permanent,
        u.full_name AS user_name, u.email AS user_email,
        s.name AS system_name, s.description AS system_description,
        rb.full_name AS revoked_by_name,
        gb.full_name AS granted_by_name
       FROM system_access_grants sag
       JOIN users u ON sag.user_id = u.id
       JOIN systems s ON sag.system_id = s.id
       LEFT JOIN users rb ON sag.revoked_by = rb.id
       LEFT JOIN users gb ON sag.granted_by = gb.id
       WHERE sag.user_id = ? AND sag.status = 'revoked'
       ORDER BY sag.revoked_at DESC`,
      [testUserId]
    );
    
    console.log(`\n📊 API Response for user ${testUserId}:`);
    console.log(JSON.stringify({ success: true, grants: apiTest }, null, 2));
    
    console.log('\n🎉 Revoked grants display test completed!');
    
  } catch (error) {
    console.error('Error testing revoked display:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

testRevokedDisplay(); 