import axios from '../utils/axios';

export interface Role {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface CreateRoleData {
  name: string;
  description: string;
  department_id?: number;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  department_id?: number;
}

export interface RoleAssignment {
  user_id: number;
  department_id: number;
  role_id: number;
  assigned_at: string;
  assigned_by: number;
  status: 'active' | 'inactive' | 'revoked';
  department_name: string;
  role_name: string;
  role_description: string;
  user_name: string;
  user_email: string;
  assigned_by_name: string;
}

export interface AssignRoleData {
  userId: number;
  departmentId: number;
  roleId: number;
  assignedBy: number;
}

class RoleService {
  private baseUrl = '/api/roles';

  // Get all roles
  async getAllRoles(): Promise<Role[]> {
    try {
      const response = await axios.get(this.baseUrl);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  // Get role by ID
  async getRoleById(id: number): Promise<Role> {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  // Create new role
  async createRole(roleData: CreateRoleData): Promise<Role> {
    try {
      const response = await axios.post(this.baseUrl, roleData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  // Update role
  async updateRole(id: number, roleData: UpdateRoleData): Promise<Role> {
    try {
      const response = await axios.put(`${this.baseUrl}/${id}`, roleData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  // Delete role
  async deleteRole(id: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  // Get roles by department
  async getRolesByDepartment(departmentId: number): Promise<Role[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/department/${departmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching roles by department:', error);
      throw error;
    }
  }

  // Search roles
  async searchRoles(query: string): Promise<Role[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching roles:', error);
      throw error;
    }
  }

  // Get all role assignments
  async getAllRoleAssignments(): Promise<RoleAssignment[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/assignments/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role assignments:', error);
      throw error;
    }
  }

  // Get user role assignments
  async getUserRoleAssignments(userId: number): Promise<RoleAssignment[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/assignments/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user role assignments:', error);
      throw error;
    }
  }

  // Assign role to user
  async assignRoleToUser(assignmentData: AssignRoleData): Promise<RoleAssignment> {
    try {
      const response = await axios.post(`${this.baseUrl}/assignments/assign`, assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  }

  // Update role assignment status
  async updateRoleAssignmentStatus(
    userId: number, 
    departmentId: number, 
    roleId: number, 
    status: 'active' | 'inactive' | 'revoked'
  ): Promise<void> {
    try {
      await axios.put(`${this.baseUrl}/assignments/${userId}/${departmentId}/${roleId}/status`, { status });
    } catch (error) {
      console.error('Error updating role assignment status:', error);
      throw error;
    }
  }

  // Remove role assignment
  async removeRoleAssignment(userId: number, departmentId: number, roleId: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/assignments/${userId}/${departmentId}/${roleId}`);
    } catch (error) {
      console.error('Error removing role assignment:', error);
      throw error;
    }
  }
}

export default new RoleService(); 