import db from '../config/db.js';

class RoleController {
  // Get all roles
  async getAllRoles(req, res) {
    try {
      const [roles] = await db.query(`
        SELECT id, name, description, created_at 
        FROM roles 
        ORDER BY created_at DESC
      `);
      
      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch roles',
        error: error.message
      });
    }
  }

  // Get role by ID
  async getRoleById(req, res) {
    try {
      const { id } = req.params;
      
      const [roles] = await db.query(`
        SELECT id, name, description, created_at 
        FROM roles 
        WHERE id = ?
      `, [id]);
      
      if (roles.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }
      
      res.json({
        success: true,
        data: roles[0]
      });
    } catch (error) {
      console.error('Error fetching role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch role',
        error: error.message
      });
    }
  }

  // Create new role
  async createRole(req, res) {
    try {
      const { name, description, department_id } = req.body;
      
      // Validate required fields
      if (!name || !description) {
        return res.status(400).json({
          success: false,
          message: 'Name and description are required'
        });
      }
      
      // Check if role name already exists
      const [existingRoles] = await db.query(`
        SELECT id FROM roles WHERE name = ?
      `, [name]);
      
      if (existingRoles.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Role name already exists'
        });
      }
      
      // Insert new role
      const [result] = await db.query(`
        INSERT INTO roles (name, description) 
        VALUES (?, ?)
      `, [name, description]);
      
      // Get the created role
      const [newRole] = await db.query(`
        SELECT id, name, description, created_at 
        FROM roles 
        WHERE id = ?
      `, [result.insertId]);
      
      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: newRole[0]
      });
    } catch (error) {
      console.error('Error creating role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create role',
        error: error.message
      });
    }
  }

  // Update role
  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      // Check if role exists
      const [existingRole] = await db.query(`
        SELECT id FROM roles WHERE id = ?
      `, [id]);
      
      if (existingRole.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }
      
      // Check if new name conflicts with existing role
      if (name) {
        const [conflictingRoles] = await db.query(`
          SELECT id FROM roles WHERE name = ? AND id != ?
        `, [name, id]);
        
        if (conflictingRoles.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Role name already exists'
          });
        }
      }
      
      // Update role
      const updateFields = [];
      const updateValues = [];
      
      if (name) {
        updateFields.push('name = ?');
        updateValues.push(name);
      }
      
      if (description) {
        updateFields.push('description = ?');
        updateValues.push(description);
      }
      
      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }
      
      updateValues.push(id);
      
      await db.query(`
        UPDATE roles 
        SET ${updateFields.join(', ')} 
        WHERE id = ?
      `, updateValues);
      
      // Get updated role
      const [updatedRole] = await db.query(`
        SELECT id, name, description, created_at 
        FROM roles 
        WHERE id = ?
      `, [id]);
      
      res.json({
        success: true,
        message: 'Role updated successfully',
        data: updatedRole[0]
      });
    } catch (error) {
      console.error('Error updating role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update role',
        error: error.message
      });
    }
  }

  // Delete role
  async deleteRole(req, res) {
    try {
      const { id } = req.params;
      
      // Check if role exists
      const [existingRole] = await db.query(`
        SELECT id FROM roles WHERE id = ?
      `, [id]);
      
      if (existingRole.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }
      
      // Check if role is being used in user_department_roles
      const [usersWithRole] = await db.query(`
        SELECT COUNT(*) as count FROM user_department_roles WHERE role_id = ?
      `, [id]);
      
      if (usersWithRole[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete role that is assigned to users'
        });
      }
      
      // Delete role
      await db.query(`
        DELETE FROM roles WHERE id = ?
      `, [id]);
      
      res.json({
        success: true,
        message: 'Role deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete role',
        error: error.message
      });
    }
  }

  // Get user role assignments
  async getUserRoleAssignments(req, res) {
    try {
      const { userId } = req.params;
      
      const [assignments] = await db.query(`
        SELECT 
          udr.user_id,
          udr.department_id,
          udr.role_id,
          udr.assigned_at,
          udr.assigned_by,
          udr.status,
          d.name as department_name,
          r.name as role_name,
          r.description as role_description,
          u.full_name as assigned_by_name
        FROM user_department_roles udr
        JOIN departments d ON udr.department_id = d.id
        JOIN roles r ON udr.role_id = r.id
        LEFT JOIN users u ON udr.assigned_by = u.id
        WHERE udr.user_id = ?
        ORDER BY udr.assigned_at DESC
      `, [userId]);
      
      res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      console.error('Error fetching user role assignments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user role assignments',
        error: error.message
      });
    }
  }

  // Assign role to user
  async assignRoleToUser(req, res) {
    try {
      const { userId, departmentId, roleId, assignedBy } = req.body;
      
      // Validate required fields
      if (!userId || !departmentId || !roleId) {
        return res.status(400).json({
          success: false,
          message: 'User ID, Department ID, and Role ID are required'
        });
      }
      
      // Check if assignment already exists
      const [existingAssignment] = await db.query(`
        SELECT user_id FROM user_department_roles 
        WHERE user_id = ? AND department_id = ? AND role_id = ?
      `, [userId, departmentId, roleId]);
      
      if (existingAssignment.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Role assignment already exists for this user and department'
        });
      }
      
      // Create role assignment
      const [result] = await db.query(`
        INSERT INTO user_department_roles (user_id, department_id, role_id, assigned_by, status)
        VALUES (?, ?, ?, ?, 'active')
      `, [userId, departmentId, roleId, assignedBy]);
      
      // Get the created assignment with details
      const [assignment] = await db.query(`
        SELECT 
          udr.user_id,
          udr.department_id,
          udr.role_id,
          udr.assigned_at,
          udr.assigned_by,
          udr.status,
          d.name as department_name,
          r.name as role_name,
          r.description as role_description
        FROM user_department_roles udr
        JOIN departments d ON udr.department_id = d.id
        JOIN roles r ON udr.role_id = r.id
        WHERE udr.user_id = ? AND udr.department_id = ? AND udr.role_id = ?
      `, [userId, departmentId, roleId]);
      
      res.status(201).json({
        success: true,
        message: 'Role assigned successfully',
        data: assignment[0]
      });
    } catch (error) {
      console.error('Error assigning role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign role',
        error: error.message
      });
    }
  }

  // Update role assignment status
  async updateRoleAssignmentStatus(req, res) {
    try {
      const { userId, departmentId, roleId } = req.params;
      const { status } = req.body;
      
      // Validate status
      const validStatuses = ['active', 'inactive', 'revoked'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be active, inactive, or revoked'
        });
      }
      
      // Update assignment status
      await db.query(`
        UPDATE user_department_roles 
        SET status = ?
        WHERE user_id = ? AND department_id = ? AND role_id = ?
      `, [status, userId, departmentId, roleId]);
      
      res.json({
        success: true,
        message: 'Role assignment status updated successfully'
      });
    } catch (error) {
      console.error('Error updating role assignment status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update role assignment status',
        error: error.message
      });
    }
  }

  // Remove role assignment
  async removeRoleAssignment(req, res) {
    try {
      const { userId, departmentId, roleId } = req.params;
      
      // Delete the assignment
      await db.query(`
        DELETE FROM user_department_roles 
        WHERE user_id = ? AND department_id = ? AND role_id = ?
      `, [userId, departmentId, roleId]);
      
      res.json({
        success: true,
        message: 'Role assignment removed successfully'
      });
    } catch (error) {
      console.error('Error removing role assignment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove role assignment',
        error: error.message
      });
    }
  }

  // Get all role assignments
  async getAllRoleAssignments(req, res) {
    try {
      const [assignments] = await db.query(`
        SELECT 
          udr.user_id,
          udr.department_id,
          udr.role_id,
          udr.assigned_at,
          udr.assigned_by,
          udr.status,
          d.name as department_name,
          r.name as role_name,
          r.description as role_description,
          u.full_name as user_name,
          u.email as user_email,
          assigned_by_user.full_name as assigned_by_name
        FROM user_department_roles udr
        JOIN departments d ON udr.department_id = d.id
        JOIN roles r ON udr.role_id = r.id
        JOIN users u ON udr.user_id = u.id
        LEFT JOIN users assigned_by_user ON udr.assigned_by = assigned_by_user.id
        ORDER BY udr.assigned_at DESC
      `);
      
      res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      console.error('Error fetching role assignments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch role assignments',
        error: error.message
      });
    }
  }

  // Search roles
  async searchRoles(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }
      
      const [roles] = await db.query(`
        SELECT id, name, description, created_at 
        FROM roles 
        WHERE name LIKE ? OR description LIKE ?
        ORDER BY created_at DESC
      `, [`%${q}%`, `%${q}%`]);
      
      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      console.error('Error searching roles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search roles',
        error: error.message
      });
    }
  }

  // Get roles by department
  async getRolesByDepartment(req, res) {
    try {
      const { departmentId } = req.params;
      
      // Get roles that are assigned to users in this department
      const [roles] = await db.query(`
        SELECT DISTINCT
          r.id,
          r.name,
          r.description,
          r.created_at,
          COUNT(udr.user_id) as assigned_users_count
        FROM roles r
        LEFT JOIN user_department_roles udr ON r.id = udr.role_id AND udr.department_id = ?
        WHERE udr.department_id = ? OR udr.department_id IS NULL
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `, [departmentId, departmentId]);
      
      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      console.error('Error fetching roles by department:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch roles by department',
        error: error.message
      });
    }
  }
}

export default new RoleController(); 