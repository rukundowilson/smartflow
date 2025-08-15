import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smartflow_db',
  port: process.env.DB_PORT || 3306
};

async function updateITHodToHod() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connected to database successfully');
    
    // Start transaction
    await connection.beginTransaction();
    
    console.log('🔍 Checking for IT HOD role...');
    
    // First, check if IT HOD role exists
    const [itHodRole] = await connection.execute(
      'SELECT id, name FROM roles WHERE name = ? OR name = ?',
      ['IT HOD', 'IT hod']
    );
    
    if (itHodRole.length === 0) {
      console.log('ℹ️  IT HOD role not found in database');
      return;
    }
    
    const itHodRoleId = itHodRole[0].id;
    console.log(`📋 Found IT HOD role: ID ${itHodRoleId}, Name: ${itHodRole[0].name}`);
    
    // Get HOD role ID
    const [hodRole] = await connection.execute(
      'SELECT id FROM roles WHERE name = ?',
      ['HOD']
    );
    
    if (hodRole.length === 0) {
      throw new Error('HOD role not found. Cannot update assignments.');
    }
    
    const hodRoleId = hodRole[0].id;
    console.log(`📋 HOD role ID: ${hodRoleId}`);
    
    // Get IT Department ID
    const [itDept] = await connection.execute(
      'SELECT id FROM departments WHERE name = ? OR name = ?',
      ['IT Department', 'it department']
    );
    
    if (itDept.length === 0) {
      throw new Error('IT Department not found. Cannot update assignments.');
    }
    
    const itDepartmentId = itDept[0].id;
    console.log(`🏢 IT Department ID: ${itDepartmentId}`);
    
    // Check for users assigned to IT HOD role
    const [users] = await connection.execute(
      'SELECT COUNT(*) as count FROM user_department_roles WHERE role_id = ?',
      [itHodRoleId]
    );
    
    const userCount = users[0].count;
    console.log(`👥 Found ${userCount} user assignments to IT HOD role`);
    
    if (userCount > 0) {
      console.log('🔄 Updating user assignments from IT HOD to HOD in IT Department...');
      
      // Update user_department_roles to change IT HOD to HOD and ensure IT Department
      const [updateResult] = await connection.execute(
        'UPDATE user_department_roles SET role_id = ?, department_id = ? WHERE role_id = ?',
        [hodRoleId, itDepartmentId, itHodRoleId]
      );
      
      console.log(`✅ Updated ${updateResult.affectedRows} user assignments from IT HOD to HOD`);
    }
    
    // Check for any other references to IT HOD role
    console.log('🔍 Checking for other references to IT HOD role...');
    
    // Check access_requests table
    const [accessRequests] = await connection.execute(
      'SELECT COUNT(*) as count FROM access_requests WHERE role_id = ?',
      [itHodRoleId]
    );
    
    if (accessRequests[0].count > 0) {
      console.log(`⚠️  Found ${accessRequests[0].count} access requests for IT HOD role`);
      console.log('🔄 Updating access requests to HOD role...');
      
      const [updateResult] = await connection.execute(
        'UPDATE access_requests SET role_id = ? WHERE role_id = ?',
        [hodRoleId, itHodRoleId]
      );
      console.log(`✅ Updated ${updateResult.affectedRows} access requests`);
    }
    
    // Check system_access_requests table
    const [systemRequests] = await connection.execute(
      'SELECT COUNT(*) as count FROM system_access_requests WHERE role_id = ?',
      [itHodRoleId]
    );
    
    if (systemRequests[0].count > 0) {
      console.log(`⚠️  Found ${systemRequests[0].count} system access requests for IT HOD role`);
      console.log('🔄 Updating system access requests to HOD role...');
      
      const [updateResult] = await connection.execute(
        'UPDATE system_access_requests SET role_id = ? WHERE role_id = ?',
        [hodRoleId, itHodRoleId]
      );
      console.log(`✅ Updated ${updateResult.affectedRows} system access requests`);
    }
    
    // Now delete the IT HOD role
    console.log('🗑️  Removing IT HOD role...');
    const [deleteResult] = await connection.execute(
      'DELETE FROM roles WHERE id = ?',
      [itHodRoleId]
    );
    
    if (deleteResult.affectedRows > 0) {
      console.log('✅ Successfully removed IT HOD role');
    } else {
      console.log('❌ Failed to remove IT HOD role');
    }
    
    // Commit transaction
    await connection.commit();
    console.log('✅ Transaction committed successfully');
    
    console.log('\n📊 Summary:');
    console.log(`- Removed IT HOD role (ID: ${itHodRoleId})`);
    console.log(`- Updated ${userCount} user assignments to HOD role in IT Department`);
    console.log(`- Updated ${accessRequests[0].count} access requests`);
    console.log(`- Updated ${systemRequests[0].count} system access requests`);
    
    console.log('\n🎉 IT HOD to HOD migration completed successfully!');
    console.log('💡 Now HOD role in IT Department will access the IT HOD dashboard');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (connection) {
      try {
        await connection.rollback();
        console.log('🔄 Transaction rolled back');
      } catch (rollbackError) {
        console.error('❌ Rollback failed:', rollbackError.message);
      }
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the script
updateITHodToHod(); 