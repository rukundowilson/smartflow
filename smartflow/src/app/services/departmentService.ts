import API from "../utils/axios";

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface NewDepartment {
  name: string;
  description?: string;
}

export async function getAllDepartments(): Promise<{ success: boolean; departments: Department[] }> {
  try {
    const response = await API.get("/api/departments");
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch departments:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch departments");
  }
}

export async function getDepartmentById(departmentId: number): Promise<{ success: boolean; department: Department }> {
  try {
    const response = await API.get(`/api/departments/${departmentId}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch department:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch department");
  }
}

export async function createDepartment(department: NewDepartment): Promise<{ success: boolean; department: Department }> {
  try {
    const response = await API.post("/api/departments", department);
    return response.data;
  } catch (error: any) {
    console.error("Failed to create department:", error);
    throw new Error(error.response?.data?.message || "Failed to create department");
  }
}

export async function updateDepartment(departmentId: number, department: NewDepartment): Promise<{ success: boolean; message: string }> {
  try {
    const response = await API.put(`/api/departments/${departmentId}`, department);
    return response.data;
  } catch (error: any) {
    console.error("Failed to update department:", error);
    throw new Error(error.response?.data?.message || "Failed to update department");
  }
}

export async function deleteDepartment(departmentId: number): Promise<{ success: boolean; message: string }> {
  try {
    const response = await API.delete(`/api/departments/${departmentId}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to delete department:", error);
    throw new Error(error.response?.data?.message || "Failed to delete department");
  }
} 