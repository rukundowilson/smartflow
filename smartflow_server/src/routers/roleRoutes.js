import express from 'express';
import RoleController from '../controllers/roleController.js';

const router = express.Router();

router.get('/', (req, res) => RoleController.getAllRoles(req, res));
router.post('/', (req, res) => RoleController.createRole(req, res));
router.get('/:id', (req, res) => RoleController.getRoleById(req, res));
router.put('/:id', (req, res) => RoleController.updateRole(req, res));
router.delete('/:id', (req, res) => RoleController.deleteRole(req, res));

// assignments
router.get('/assignments/user/:userId', (req, res) => RoleController.getUserRoleAssignments(req, res));
router.post('/assignments', (req, res) => RoleController.assignRoleToUser(req, res));
router.put('/assignments/:userId/:departmentId/:roleId/status', (req, res) => RoleController.updateRoleAssignmentStatus(req, res));
router.delete('/assignments/:userId/:departmentId/:roleId', (req, res) => RoleController.removeRoleAssignment(req, res));
router.get('/department/:departmentId', (req, res) => RoleController.getRolesByDepartment(req, res));
router.post('/system/assign', (req, res) => RoleController.assignSystemRoleToUser(req, res));

export default router; 