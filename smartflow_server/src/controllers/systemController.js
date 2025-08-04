import pool from '../config/db.js';

// Get all systems
export const handleGetAllSystems = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM systems ORDER BY name');
    res.json({
      success: true,
      systems: rows
    });
  } catch (error) {
    console.error('Error fetching systems:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch systems'
    });
  }
};

// Get system by ID
export const handleGetSystemById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM systems WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'System not found'
      });
    }
    
    res.json({
      success: true,
      system: rows[0]
    });
  } catch (error) {
    console.error('Error fetching system:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system'
    });
  }
};

// Get roles for a specific system
export const handleGetSystemRoles = async (req, res) => {
  try {
    const { systemId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM roles WHERE system_id = ? ORDER BY name',
      [systemId]
    );
    
    res.json({
      success: true,
      roles: rows
    });
  } catch (error) {
    console.error('Error fetching system roles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system roles'
    });
  }
}; 