import express from 'express';
import roleController from '../controllers/roleController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Role assignment routes (no authentication required for now) - MUST BE FIRST
router.get('/assignments/all', roleController.getAllRoleAssignments);
router.get('/assignments/user/:userId', roleController.getUserRoleAssignments);
router.post('/assignments/assign', roleController.assignRoleToUser);
router.post('/assignments/system', roleController.assignSystemRoleToUser);
router.put('/assignments/:userId/:departmentId/:roleId/status', roleController.updateRoleAssignmentStatus);
router.delete('/assignments/:userId/:departmentId/:roleId', roleController.removeRoleAssignment);

// Public routes (no authentication required)
router.get('/', roleController.getAllRoles);
router.get('/:id', roleController.getRoleById);
router.post('/', roleController.createRole);

// Protected routes (authentication required)
router.use(verifyToken);

// Search route (must come before :id routes)
router.get('/search', roleController.searchRoles);

// Department routes (must come before :id routes)
router.get('/department/:departmentId', roleController.getRolesByDepartment);

// Role management routes (protected)
router.put('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

export default router; 