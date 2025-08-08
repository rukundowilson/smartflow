import express from 'express';
import SystemController from '../controllers/systemController.js';

const router = express.Router();

router.get('/', (req, res) => SystemController.getAllSystems(req, res));
router.post('/', (req, res) => SystemController.createSystem(req, res));
router.get('/:id', (req, res) => SystemController.getSystemById(req, res));
router.get('/:systemId/roles', (req, res) => SystemController.getSystemRoles(req, res));
router.put('/:id', (req, res) => SystemController.updateSystem(req, res));
router.delete('/:id', (req, res) => SystemController.deleteSystem(req, res));

export default router; 