import express from 'express';
import SystemController from '../controllers/systemController.js';

const router = express.Router();

// System Routes
router.get('/', SystemController.getAllSystems.bind(SystemController));
router.post('/', SystemController.createSystem.bind(SystemController));
router.get('/:id', SystemController.getSystemById.bind(SystemController));
router.get('/:systemId/roles', SystemController.getSystemRoles.bind(SystemController));
router.put('/:id', SystemController.updateSystem.bind(SystemController));
router.delete('/:id', SystemController.deleteSystem.bind(SystemController));

export default router; 