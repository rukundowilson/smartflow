import API from '../utils/axios';

export interface System {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  system_id: number;
  created_at: string;
}

export interface CreateSystemData {
  name: string;
  description: string;
  createDefaultRoles?: boolean;
}

export interface UpdateSystemData {
  name: string;
  description: string;
}

class SystemService {
  private baseUrl = '/api/systems';

  // Get all systems
  async getAllSystems(): Promise<{ success: boolean; systems: System[] }> {
    try {
      const response = await API.get(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching systems:', error);
      throw error;
    }
  }

  // Get system by ID
  async getSystemById(id: number): Promise<{ success: boolean; system: System }> {
    try {
      const response = await API.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching system:', error);
      throw error;
    }
  }

  // Get roles for a specific system
  async getSystemRoles(systemId: number): Promise<{ success: boolean; roles: Role[] }> {
    try {
      const response = await API.get(`${this.baseUrl}/${systemId}/roles`);
      return response.data;
    } catch (error) {
      console.error('Error fetching system roles:', error);
      throw error;
    }
  }

  // Create new system
  async createSystem(data: CreateSystemData): Promise<{ success: boolean; message: string; system: System }> {
    try {
      const response = await API.post(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('Error creating system:', error);
      throw error;
    }
  }

  // Update system
  async updateSystem(id: number, data: UpdateSystemData): Promise<{ success: boolean; message: string; system: System }> {
    try {
      const response = await API.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating system:', error);
      throw error;
    }
  }

  // Delete system
  async deleteSystem(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await API.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting system:', error);
      throw error;
    }
  }
}

export default new SystemService(); 