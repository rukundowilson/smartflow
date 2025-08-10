import express from 'express';
import DepartmentController from '../controllers/departmentController.js';

const router = express.Router();

router.get('/', (req, res) => DepartmentController.getAllDepartments(req, res));
router.get('/:id', (req, res) => DepartmentController.getDepartmentById(req, res));
router.get('/:departmentId/roles', (req, res) => DepartmentController.getDepartmentRoles(req, res));
router.post('/', (req, res) => DepartmentController.createDepartment(req, res));
router.put('/:id', (req, res) => DepartmentController.updateDepartment(req, res));
router.delete('/:id', (req, res) => DepartmentController.deleteDepartment(req, res));

export default router; 