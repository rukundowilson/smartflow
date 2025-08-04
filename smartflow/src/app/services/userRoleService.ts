import API from '../utils/axios';

export interface UserRoleInfo {
  user_id: number;
  department_id: number;
  role_id: number;
  department_name: string;
  role_name: string;
  status: 'active' | 'inactive' | 'revoked';
}

class UserRoleService {
  // Get user's current role and department information
  async getUserRoleInfo(userId: number): Promise<UserRoleInfo | null> {
    try {
      const response = await API.get(`/api/roles/assignments/user/${userId}`);
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        // Return the first active assignment
        const activeAssignment = response.data.data.find((assignment: UserRoleInfo) => 
          assignment.status === 'active'
        );
        return activeAssignment || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user role info:', error);
      
      // Return null instead of hardcoded data
      console.log('Returning null for user role info');
      return null;
    }
  }

  // Get all role assignments for a user
  async getUserRoleAssignments(userId: number): Promise<UserRoleInfo[]> {
    try {
      const response = await API.get(`/api/roles/assignments/user/${userId}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching user role assignments:', error);
      
      // Return empty array instead of hardcoded data
      console.log('Returning empty user role assignments array');
      return [];
    }
  }
}

export default new UserRoleService(); 