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

async function removeITHodDepartment() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connected to database successfully');
    
    // Start transaction
    await connection.beginTransaction();
    
    console.log('🔍 Checking for IT hod department...');
    
    // First, check if the department exists
    const [departments] = await connection.execute(
      'SELECT id, name FROM departments WHERE name = ? OR name = ?',
      ['IT hod', 'IT HOD']
    );
    
    if (departments.length === 0) {
      console.log('ℹ️  IT hod department not found in database');
      return;
    }
    
    const itHodDepartment = departments[0];
    console.log(`📋 Found IT hod department: ID ${itHodDepartment.id}, Name: ${itHodDepartment.name}`);
    
    // Check for users assigned to this department
    const [users] = await connection.execute(
      'SELECT COUNT(*) as count FROM user_department_roles WHERE department_id = ?',
      [itHodDepartment.id]
    );
    
    const userCount = users[0].count;
    console.log(`👥 Found ${userCount} user assignments to IT hod department`);
    
    if (userCount > 0) {
      console.log('⚠️  Warning: Users are assigned to IT hod department');
      console.log('🔄 Updating user assignments to IT Department...');
      
      // Get IT Department ID
      const [itDept] = await connection.execute(
        'SELECT id FROM departments WHERE name = ? OR name = ?',
        ['IT Department', 'it department']
      );
      
      if (itDept.length === 0) {
        throw new Error('IT Department not found. Cannot reassign users.');
      }
      
      const itDepartmentId = itDept[0].id;
      console.log(`🏢 IT Department ID: ${itDepartmentId}`);
      
      // Update user_department_roles to assign users to IT Department instead
      const [updateResult] = await connection.execute(
        'UPDATE user_department_roles SET department_id = ? WHERE department_id = ?',
        [itDepartmentId, itHodDepartment.id]
      );
      
      console.log(`✅ Updated ${updateResult.affectedRows} user assignments to IT Department`);
    }
    
    // Check for any other references to this department
    console.log('🔍 Checking for other references to IT hod department...');
    
    // Check access_requests table
    const [accessRequests] = await connection.execute(
      'SELECT COUNT(*) as count FROM access_requests WHERE department_id = ?',
      [itHodDepartment.id]
    );
    
    if (accessRequests[0].count > 0) {
      console.log(`⚠️  Found ${accessRequests[0].count} access requests for IT hod department`);
      console.log('🔄 Updating access requests to IT Department...');
      
      const [itDept] = await connection.execute(
        'SELECT id FROM departments WHERE name = ? OR name = ?',
        ['IT Department', 'it department']
      );
      
      if (itDept.length > 0) {
        const [updateResult] = await connection.execute(
          'UPDATE access_requests SET department_id = ? WHERE department_id = ?',
          [itDept[0].id, itHodDepartment.id]
        );
        console.log(`✅ Updated ${updateResult.affectedRows} access requests`);
      }
    }
    
    // Check system_access_requests table
    const [systemRequests] = await connection.execute(
      'SELECT COUNT(*) as count FROM system_access_requests WHERE department_id = ?',
      [itHodDepartment.id]
    );
    
    if (systemRequests[0].count > 0) {
      console.log(`⚠️  Found ${systemRequests[0].count} system access requests for IT hod department`);
      console.log('🔄 Updating system access requests to IT Department...');
      
      const [itDept] = await connection.execute(
        'SELECT id FROM departments WHERE name = ? OR name = ?',
        ['IT Department', 'it department']
      );
      
      if (itDept.length > 0) {
        const [updateResult] = await connection.execute(
          'UPDATE system_access_requests SET department_id = ? WHERE department_id = ?',
          [itDept[0].id, itHodDepartment.id]
        );
        console.log(`✅ Updated ${updateResult.affectedRows} system access requests`);
      }
    }
    
    // Check tickets table
    const [tickets] = await connection.execute(
      'SELECT COUNT(*) as count FROM tickets WHERE department_id = ?',
      [itHodDepartment.id]
    );
    
    if (tickets[0].count > 0) {
      console.log(`⚠️  Found ${tickets[0].count} tickets for IT hod department`);
      console.log('🔄 Updating tickets to IT Department...');
      
      const [itDept] = await connection.execute(
        'SELECT id FROM departments WHERE name = ? OR name = ?',
        ['IT Department', 'it department']
      );
      
      if (itDept.length > 0) {
        const [updateResult] = await connection.execute(
          'UPDATE tickets SET department_id = ? WHERE department_id = ?',
          [itDept[0].id, itHodDepartment.id]
        );
        console.log(`✅ Updated ${updateResult.affectedRows} tickets`);
      }
    }
    
    // Now delete the IT hod department
    console.log('🗑️  Removing IT hod department...');
    const [deleteResult] = await connection.execute(
      'DELETE FROM departments WHERE id = ?',
      [itHodDepartment.id]
    );
    
    if (deleteResult.affectedRows > 0) {
      console.log('✅ Successfully removed IT hod department');
    } else {
      console.log('❌ Failed to remove IT hod department');
    }
    
    // Commit transaction
    await connection.commit();
    console.log('✅ Transaction committed successfully');
    
    console.log('\n📊 Summary:');
    console.log(`- Removed IT hod department (ID: ${itHodDepartment.id})`);
    console.log(`- Updated ${userCount} user assignments to IT Department`);
    console.log(`- Updated ${accessRequests[0].count} access requests`);
    console.log(`- Updated ${systemRequests[0].count} system access requests`);
    console.log(`- Updated ${tickets[0].count} tickets`);
    
    console.log('\n🎉 IT hod department removal completed successfully!');
    console.log('💡 Remember: IT HOD is now properly handled as a role within IT Department');
    
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
removeITHodDepartment(); 