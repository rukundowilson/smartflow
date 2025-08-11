import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function createTestRevokedGrants() {
  const connection = await pool.getConnection();
  try {
    console.log('🔧 Creating test revoked grants...');
    
    // Get some existing granted requests
    const [grantedRequests] = await connection.query(
      `SELECT sar.id, sar.user_id, sar.system_id, sar.start_date, sar.end_date, sar.is_permanent
       FROM system_access_requests sar
       WHERE sar.status = 'granted'
       LIMIT 3`
    );
    
    if (grantedRequests.length === 0) {
      console.log('❌ No granted requests found. Please create some granted requests first.');
      return;
    }
    
    console.log(`✅ Found ${grantedRequests.length} granted requests to revoke`);
    
    // Get an IT user to act as the revoker
    const [itUsers] = await connection.query(
      `SELECT id, full_name FROM users WHERE email LIKE '%@%' LIMIT 1`
    );
    
    const revokerId = itUsers[0]?.id || 1;
    const revokerName = itUsers[0]?.full_name || 'IT Support';
    
    console.log(`👤 Using ${revokerName} (ID: ${revokerId}) as revoker`);
    
    // Create revoked grants for each granted request
    for (const request of grantedRequests) {
      console.log(`\n📋 Processing request ID: ${request.id}`);
      
      // Check if a grant already exists for this request
      const [existingGrants] = await connection.query(
        'SELECT id FROM system_access_grants WHERE granted_from_request_id = ?',
        [request.id]
      );
      
      if (existingGrants.length > 0) {
        console.log(`  ⚠️  Grant already exists for request ${request.id}, updating to revoked status`);
        
        // Update existing grant to revoked status
        await connection.query(
          `UPDATE system_access_grants 
           SET status = 'revoked', revoked_at = NOW(), revoked_by = ?, revocation_reason = ?
           WHERE granted_from_request_id = ?`,
          [revokerId, 'Test revocation for demonstration', request.id]
        );
      } else {
        console.log(`  ➕ Creating new revoked grant for request ${request.id}`);
        
        // Create a new revoked grant
        await connection.query(
          `INSERT INTO system_access_grants
           (user_id, system_id, granted_from_request_id, granted_by, effective_from, effective_until, is_permanent, status, revoked_at, revoked_by, revocation_reason)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'revoked', NOW(), ?, ?)`,
          [
            request.user_id,
            request.system_id,
            request.id,
            revokerId,
            request.start_date,
            request.end_date,
            request.is_permanent,
            revokerId,
            'Test revocation for demonstration'
          ]
        );
      }
      
      console.log(`  ✅ Request ${request.id} marked as revoked`);
    }
    
    // Verify the revoked grants
    console.log('\n🔍 Verifying revoked grants...');
    const [revokedGrants] = await connection.query(
      `SELECT 
        sag.id, sag.user_id, sag.system_id, sag.revoked_at, sag.revoked_by,
        sag.revocation_reason, sag.granted_from_request_id,
        u.full_name AS user_name, u.email AS user_email,
        s.name AS system_name,
        rb.full_name AS revoked_by_name
       FROM system_access_grants sag
       JOIN users u ON sag.user_id = u.id
       JOIN systems s ON sag.system_id = s.id
       LEFT JOIN users rb ON sag.revoked_by = rb.id
       WHERE sag.status = 'revoked'
       ORDER BY sag.revoked_at DESC`
    );
    
    console.log(`\n📊 Created ${revokedGrants.length} revoked grants:`);
    revokedGrants.forEach(grant => {
      console.log(`  - Grant ${grant.id}: ${grant.user_name} → ${grant.system_name}`);
      console.log(`    Request ID: ${grant.granted_from_request_id}, Revoked by: ${grant.revoked_by_name}`);
      console.log(`    Reason: ${grant.revocation_reason}`);
    });
    
    console.log('\n🎉 Test revoked grants created successfully!');
    
  } catch (error) {
    console.error('Error creating test revoked grants:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

createTestRevokedGrants(); 