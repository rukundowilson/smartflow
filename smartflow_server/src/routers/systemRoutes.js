import express from 'express';
import {
  handleGetAllSystems,
  handleGetSystemById,
  handleGetSystemRoles
} from '../controllers/systemController.js';

const router = express.Router();

// System Routes
router.get('/', handleGetAllSystems);
router.get('/:id', handleGetSystemById);
router.get('/:systemId/roles', handleGetSystemRoles);

export default router; 