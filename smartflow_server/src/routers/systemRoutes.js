import express from 'express';
import SystemController from '../controllers/systemController.js';
import db from '../config/db.js';

const router = express.Router();

// System Routes
router.get('/', SystemController.getAllSystems.bind(SystemController));
router.post('/', SystemController.createSystem.bind(SystemController));
router.get('/:id', SystemController.getSystemById.bind(SystemController));
router.get('/:systemId/roles', SystemController.getSystemRoles.bind(SystemController));
router.put('/:id', SystemController.updateSystem.bind(SystemController));
router.delete('/:id', SystemController.deleteSystem.bind(SystemController));

// System audit logs
router.get('/:id/logs', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT id, action, entity_type, entity_id, actor_user_id, details, created_at
       FROM audit_logs WHERE entity_type = 'system' AND entity_id = ?
       ORDER BY created_at DESC`,
      [id]
    );
    res.json({ success: true, logs: rows });
  } catch (e) {
    console.error('Error fetching system logs:', e.message);
    res.status(500).json({ success: false, message: 'Failed to fetch logs' });
  }
});

export default router; 