import express from 'express';
import {
  handleGetAllDepartments,
  handleGetDepartmentById,
  handleCreateDepartment,
  handleUpdateDepartment,
  handleDeleteDepartment
} from '../controllers/departmentController.js';

const router = express.Router();

// GET /api/departments - Get all departments
router.get('/', handleGetAllDepartments);

// GET /api/departments/:departmentId - Get department by ID
router.get('/:departmentId', handleGetDepartmentById);

// POST /api/departments - Create a new department
router.post('/', handleCreateDepartment);

// PUT /api/departments/:departmentId - Update a department
router.put('/:departmentId', handleUpdateDepartment);

// DELETE /api/departments/:departmentId - Delete a department
router.delete('/:departmentId', handleDeleteDepartment);

export default router; 