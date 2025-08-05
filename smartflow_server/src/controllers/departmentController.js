import db from '../config/db.js';

class DepartmentController {
  // Get all departments
  async getAllDepartments(req, res) {
    try {
      const [departments] = await db.query(`
        SELECT id, name, description 
        FROM departments 
        ORDER BY name ASC
      `);
      
      res.json({
        success: true,
        departments: departments
      });
    } catch (error) {
      console.error('Error fetching departments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch departments',
        error: error.message
      });
    }
  }

  // Get department by ID
  async getDepartmentById(req, res) {
    try {
      const { id } = req.params;
      
      const [departments] = await db.query(`
        SELECT id, name, description 
        FROM departments 
        WHERE id = ?
      `, [id]);
      
      if (departments.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }
      
      res.json({
        success: true,
        department: departments[0]
      });
    } catch (error) {
      console.error('Error fetching department:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch department',
        error: error.message
      });
    }
  }

  // Get roles for a specific department
  async getDepartmentRoles(req, res) {
    try {
      const { departmentId } = req.params;
      
      // Get department details first
      const [departments] = await db.query(`
        SELECT id, name, description 
        FROM departments 
        WHERE id = ?
      `, [departmentId]);
      
      if (departments.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }
      
      const department = departments[0];
      
      // Get roles that are appropriate for this department
      // For now, return all roles, but in the future this could be department-specific
      const [roles] = await db.query(`
        SELECT id, name, description 
        FROM roles 
        ORDER BY name ASC
      `);
      
      // Add department_id to each role for frontend compatibility
      const rolesWithDepartmentId = roles.map(role => ({
        ...role,
        department_id: parseInt(departmentId)
      }));
      
      res.json({
        success: true,
        roles: rolesWithDepartmentId
      });
    } catch (error) {
      console.error('Error fetching department roles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch department roles',
        error: error.message
      });
    }
  }

  // Create new department
  async createDepartment(req, res) {
    try {
      const { name, description } = req.body;
      
      // Validate required fields
      if (!name || !description) {
        return res.status(400).json({
          success: false,
          message: 'Name and description are required'
        });
      }
      
      // Check if department name already exists
      const [existingDepartments] = await db.query(`
        SELECT id FROM departments WHERE name = ?
      `, [name]);
      
      if (existingDepartments.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Department name already exists'
        });
      }
      
      // Insert new department
      const [result] = await db.query(`
        INSERT INTO departments (name, description) 
        VALUES (?, ?)
      `, [name, description]);
      
      // Get the created department
      const [newDepartment] = await db.query(`
        SELECT id, name, description 
        FROM departments 
        WHERE id = ?
      `, [result.insertId]);
      
      res.status(201).json({
        success: true,
        message: 'Department created successfully',
        department: newDepartment[0]
      });
    } catch (error) {
      console.error('Error creating department:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create department',
        error: error.message
      });
    }
  }

  // Update department
  async updateDepartment(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      // Validate required fields
      if (!name || !description) {
        return res.status(400).json({
          success: false,
          message: 'Name and description are required'
        });
      }
      
      // Check if department exists
      const [existingDepartments] = await db.query(`
        SELECT id FROM departments WHERE id = ?
      `, [id]);
      
      if (existingDepartments.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }
      
      // Check if new name conflicts with existing department
      const [nameConflict] = await db.query(`
        SELECT id FROM departments WHERE name = ? AND id != ?
      `, [name, id]);
      
      if (nameConflict.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Department name already exists'
        });
      }
      
      // Update department
      await db.query(`
        UPDATE departments 
        SET name = ?, description = ? 
        WHERE id = ?
      `, [name, description, id]);
      
      res.json({
        success: true,
        message: 'Department updated successfully'
      });
    } catch (error) {
      console.error('Error updating department:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update department',
        error: error.message
      });
    }
  }

  // Delete department
  async deleteDepartment(req, res) {
    try {
      const { id } = req.params;
      
      // Check if department exists
      const [existingDepartments] = await db.query(`
        SELECT id FROM departments WHERE id = ?
      `, [id]);
      
      if (existingDepartments.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }
      
      // Check if department has active users
      const [activeUsers] = await db.query(`
        SELECT user_id FROM user_department_roles WHERE department_id = ? AND status = 'active'
      `, [id]);
      
      if (activeUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete department with active users'
        });
      }
      
      // Delete department
      await db.query('DELETE FROM departments WHERE id = ?', [id]);
      
      res.json({
        success: true,
        message: 'Department deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting department:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete department',
        error: error.message
      });
    }
  }
}

export default new DepartmentController(); 