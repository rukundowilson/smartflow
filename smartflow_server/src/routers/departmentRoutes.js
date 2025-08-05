import express from 'express';
import DepartmentController from '../controllers/departmentController.js';

const router = express.Router();

// Department Routes
router.get('/', DepartmentController.getAllDepartments.bind(DepartmentController));
router.get('/:id', DepartmentController.getDepartmentById.bind(DepartmentController));
router.post('/', DepartmentController.createDepartment.bind(DepartmentController));
router.put('/:id', DepartmentController.updateDepartment.bind(DepartmentController));
router.delete('/:id', DepartmentController.deleteDepartment.bind(DepartmentController));
router.get('/:departmentId/roles', DepartmentController.getDepartmentRoles.bind(DepartmentController));

export default router; 