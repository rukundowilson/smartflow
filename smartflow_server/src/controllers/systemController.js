import db from '../config/db.js';

class SystemController {
  // Get all systems
  async getAllSystems(req, res) {
    try {
      const [systems] = await db.query(`
        SELECT id, name, description, created_at 
        FROM systems 
        ORDER BY created_at DESC
      `);
      
      res.json({
        success: true,
        systems: systems
      });
    } catch (error) {
      console.error('Error fetching systems:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch systems',
        error: error.message
      });
    }
  }

  // Create new system with automatic role generation
  async createSystem(req, res) {
    try {
      const { name, description, createDefaultRoles = true } = req.body;
      
      // Validate required fields
      if (!name || !description) {
        return res.status(400).json({
          success: false,
          message: 'Name and description are required'
        });
      }
      
      // Check if system name already exists
      const [existingSystems] = await db.query(`
        SELECT id FROM systems WHERE name = ?
      `, [name]);
      
      if (existingSystems.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'System name already exists'
        });
      }
      
      // Start transaction
      await db.query('START TRANSACTION');
      
      try {
        // Insert new system
        const [systemResult] = await db.query(`
          INSERT INTO systems (name, description) 
          VALUES (?, ?)
        `, [name, description]);
        
        const systemId = systemResult.insertId;
        
        // Create default roles for the new system if requested
        if (createDefaultRoles) {
          const defaultRoles = [
            { name: `${name} Admin`, description: `Administrator role for ${name} system` },
            { name: `${name} Manager`, description: `Manager role for ${name} system` },
            { name: `${name} User`, description: `Regular user role for ${name} system` },
            { name: `${name} Viewer`, description: `Read-only access role for ${name} system` }
          ];
          
          for (const role of defaultRoles) {
            await db.query(`
              INSERT INTO roles (name, description) 
              VALUES (?, ?)
            `, [role.name, role.description]);
          }
          
          console.log(`✅ Created ${defaultRoles.length} default roles for system: ${name}`);
        }
        
        // Get the created system
        const [newSystem] = await db.query(`
          SELECT id, name, description, created_at 
          FROM systems 
          WHERE id = ?
        `, [systemId]);
        
        await db.query('COMMIT');
        
        res.status(201).json({
          success: true,
          message: 'System created successfully',
          system: newSystem[0]
        });
        
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
      
    } catch (error) {
      console.error('Error creating system:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create system',
        error: error.message
      });
    }
  }

  // Get system by ID with its roles
  async getSystemById(req, res) {
    try {
      const { id } = req.params;
      
      // Get system details
      const [systems] = await db.query(`
        SELECT id, name, description, created_at 
        FROM systems 
        WHERE id = ?
      `, [id]);
      
      if (systems.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'System not found'
        });
      }
      
      // Get roles associated with this system (roles that contain system name)
      const [roles] = await db.query(`
        SELECT id, name, description, created_at 
        FROM roles 
        WHERE name LIKE ? OR name LIKE ? OR name LIKE ?
        ORDER BY created_at DESC
      `, [`%${systems[0].name}%`, `${systems[0].name}%`, `%${systems[0].name}`]);
      
      res.json({
        success: true,
        system: {
          ...systems[0],
          roles: roles
        }
      });
    } catch (error) {
      console.error('Error fetching system:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system',
        error: error.message
      });
    }
  }

  // Get roles for a specific system
  async getSystemRoles(req, res) {
    try {
      const { systemId } = req.params;
      
      // Get system details first
      const [systems] = await db.query(`
        SELECT id, name, description 
        FROM systems 
        WHERE id = ?
      `, [systemId]);
      
      if (systems.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'System not found'
        });
      }
      
      const system = systems[0];
      
      // Return all roles that can be used for any system
      // This allows for role-based access requests
      const [roles] = await db.query(`
        SELECT id, name, description, created_at 
        FROM roles 
        ORDER BY name ASC
      `);
      
      // Add system_id to each role for frontend compatibility
      const rolesWithSystemId = roles.map(role => ({
        ...role,
        system_id: parseInt(systemId)
      }));
      
      res.json({
        success: true,
        roles: rolesWithSystemId
      });
    } catch (error) {
      console.error('Error fetching system roles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system roles',
        error: error.message
      });
    }
  }

  // Update system
  async updateSystem(req, res) {
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
      
      // Check if system exists
      const [existingSystems] = await db.query(`
        SELECT id FROM systems WHERE id = ?
      `, [id]);
      
      if (existingSystems.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'System not found'
        });
      }
      
      // Check if new name conflicts with existing system
      const [nameConflict] = await db.query(`
        SELECT id FROM systems WHERE name = ? AND id != ?
      `, [name, id]);
      
      if (nameConflict.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'System name already exists'
        });
      }
      
      // Update system
      await db.query(`
        UPDATE systems 
        SET name = ?, description = ? 
        WHERE id = ?
      `, [name, description, id]);
      
      // Get updated system
      const [updatedSystem] = await db.query(`
        SELECT id, name, description, created_at 
        FROM systems 
        WHERE id = ?
      `, [id]);
      
      res.json({
        success: true,
        message: 'System updated successfully',
        system: updatedSystem[0]
      });
    } catch (error) {
      console.error('Error updating system:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update system',
        error: error.message
      });
    }
  }

  // Delete system
  async deleteSystem(req, res) {
    try {
      const { id } = req.params;
      
      // Check if system exists
      const [existingSystems] = await db.query(`
        SELECT id FROM systems WHERE id = ?
      `, [id]);
      
      if (existingSystems.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'System not found'
        });
      }
      
      // Check if system has active access requests
      const [activeRequests] = await db.query(`
        SELECT id FROM access_requests WHERE system_id = ? AND status NOT IN ('rejected', 'granted')
      `, [id]);
      
      if (activeRequests.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete system with active access requests'
        });
      }
      
      // Delete system
      await db.query('DELETE FROM systems WHERE id = ?', [id]);
      
      res.json({
        success: true,
        message: 'System deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting system:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete system',
        error: error.message
      });
    }
  }
}

export default new SystemController(); 