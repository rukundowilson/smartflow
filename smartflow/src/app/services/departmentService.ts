import API from '../utils/axios';

export interface Department {
  id: number;
  name: string;
  description: string;
}

export interface NewDepartment {
  name: string;
  description: string;
}

export interface DepartmentRole {
  id: number;
  name: string;
  description: string;
  department_id: number;
}

// Get all departments
export async function getAllDepartments(): Promise<{ success: boolean; departments: Department[] }> {
  try {
    const response = await API.get('/api/departments');
    return response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
}

// Get department by ID
export async function getDepartmentById(id: number): Promise<{ success: boolean; department: Department }> {
  try {
    const response = await API.get(`/api/departments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching department:', error);
    throw error;
  }
}

// Create new department
export async function createDepartment(department: NewDepartment): Promise<{ success: boolean; department: Department }> {
  try {
    const response = await API.post('/api/departments', department);
    return response.data;
  } catch (error) {
    console.error('Error creating department:', error);
    throw error;
  }
}

// Update department
export async function updateDepartment(departmentId: number, department: NewDepartment): Promise<{ success: boolean; message: string }> {
  try {
    const response = await API.put(`/api/departments/${departmentId}`, department);
    return response.data;
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
}

// Delete department
export async function deleteDepartment(departmentId: number): Promise<{ success: boolean; message: string }> {
  try {
    const response = await API.delete(`/api/departments/${departmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
}

// Get roles for a specific department
export async function getDepartmentRoles(departmentId: number): Promise<{ success: boolean; roles: DepartmentRole[] }> {
  try {
    const response = await API.get(`/api/departments/${departmentId}/roles`);
    return response.data;
  } catch (error) {
    console.error('Error fetching department roles:', error);
    throw error;
  }
} 