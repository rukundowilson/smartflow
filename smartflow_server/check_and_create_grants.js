import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
});

async function checkAndCreateGrants() {
  const connection = await pool.getConnection();
  try {
    console.log('🔍 Checking existing system access grants...');
    
    // Check existing grants
    const [existingGrants] = await connection.query('SELECT * FROM system_access_grants');
    console.log(`Found ${existingGrants.length} existing grants:`);
    
    if (existingGrants.length > 0) {
      existingGrants.forEach(grant => {
        console.log(`- Grant ID: ${grant.id}, User: ${grant.user_id}, System: ${grant.system_id}, Status: ${grant.status}`);
      });
    }

    // Check if we have users and systems to create grants for
    const [users] = await connection.query('SELECT id, full_name FROM users LIMIT 5');
    const [systems] = await connection.query('SELECT id, name FROM systems LIMIT 5');
    
    console.log(`\n📊 Available users: ${users.length}`);
    users.forEach(user => console.log(`  - User ID: ${user.id}, Name: ${user.full_name}`));
    
    console.log(`📊 Available systems: ${systems.length}`);
    systems.forEach(system => console.log(`  - System ID: ${system.id}, Name: ${system.name}`));

    if (users.length === 0 || systems.length === 0) {
      console.log('❌ Need users and systems to create grants');
      return;
    }

    // Use the first available user as both the grantee and granter
    const userId = users[0].id;
    const systemId = systems[0].id;

    // Create some test grants with different expiration times
    console.log('\n🔧 Creating test grants...');
    
    const testGrants = [
      {
        user_id: userId,
        system_id: systemId,
        granted_from_request_id: 1,
        granted_by: userId, // Use same user as granter
        effective_from: new Date(),
        effective_until: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        is_permanent: false,
        scheduled_revocation_date: new Date(Date.now() + 2 * 60 * 60 * 1000)
      },
      {
        user_id: userId,
        system_id: systemId,
        granted_from_request_id: 2,
        granted_by: userId,
        effective_from: new Date(),
        effective_until: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        is_permanent: false,
        scheduled_revocation_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        user_id: userId,
        system_id: systemId,
        granted_from_request_id: 3,
        granted_by: userId,
        effective_from: new Date(),
        effective_until: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours from now
        is_permanent: false,
        scheduled_revocation_date: new Date(Date.now() + 72 * 60 * 60 * 1000)
      },
      {
        user_id: userId,
        system_id: systemId,
        granted_from_request_id: 4,
        granted_by: userId,
        effective_from: new Date(),
        effective_until: null, // Permanent
        is_permanent: true,
        scheduled_revocation_date: null
      }
    ];

    for (const grant of testGrants) {
      try {
        await connection.query(
          `INSERT INTO system_access_grants 
           (user_id, system_id, granted_from_request_id, granted_by, effective_from, effective_until, is_permanent, scheduled_revocation_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            grant.user_id,
            grant.system_id,
            grant.granted_from_request_id,
            grant.granted_by,
            grant.effective_from,
            grant.effective_until,
            grant.is_permanent,
            grant.scheduled_revocation_date
          ]
        );
        console.log(`✅ Created grant for user ${grant.user_id}, expires: ${grant.effective_until || 'Never'}`);
      } catch (error) {
        console.log(`❌ Failed to create grant: ${error.message}`);
      }
    }

    // Check final count
    const [finalGrants] = await connection.query('SELECT * FROM system_access_grants');
    console.log(`\n📈 Total grants after creation: ${finalGrants.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    connection.release();
    await pool.end();
  }
}

checkAndCreateGrants(); 