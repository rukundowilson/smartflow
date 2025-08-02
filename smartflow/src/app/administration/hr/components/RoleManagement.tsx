"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Users, Shield, Edit, Trash2, UserPlus, X, Check } from 'lucide-react';
import roleService from '../../../services/roleService';
import { getAllDepartments } from '../../../services/departmentService';
import API from '../../../utils/axios';

interface Role {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface User {
  user_id: number;
  full_name: string;
  email: string;
  user_status: string;
}

interface Department {
  id: number;
  name: string;
}

interface UserDepartmentRole {
  user_id: number;
  department_id: number;
  role_id: number;
  assigned_at: string;
  assigned_by: number;
  status: 'active' | 'inactive' | 'revoked';
  user_name?: string;
  department_name?: string;
  role_name?: string;
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userRoles, setUserRoles] = useState<UserDepartmentRole[]>([]);
  const [activeTab, setActiveTab] = useState<'roles' | 'assignments'>('roles');
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Role form state
  const [newRole, setNewRole] = useState({
    name: '',
    description: ''
  });

  // Assignment form state
  const [newAssignment, setNewAssignment] = useState({
    user_id: '',
    department_id: '',
    role_id: ''
  });

  // Load data from API
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load roles
      const rolesData = await roleService.getAllRoles();
      setRoles(rolesData);

      // Load departments
      const departmentsData = await getAllDepartments();
      setDepartments(departmentsData.departments || []);

      // Load users
      const usersResponse = await API.get('/api/users/users');
      const usersData = usersResponse.data;
      if (usersData.users) {
        // Remove duplicate users based on user_id
        const uniqueUsers = usersData.users.filter((user: User, index: number, self: User[]) => 
          index === self.findIndex(u => u.user_id === user.user_id)
        );
        setUsers(uniqueUsers);
      }

      // Load role assignments
      const assignmentsResponse = await roleService.getAllRoleAssignments();
      if (assignmentsResponse.success && assignmentsResponse.data) {
        setUserRoles(assignmentsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRole.name.trim()) {
      try {
        const createdRole = await roleService.createRole({
          name: newRole.name,
          description: newRole.description
        });
        setRoles([...roles, createdRole]);
        setNewRole({ name: '', description: '' });
        setShowRoleForm(false);
      } catch (error) {
        console.error('Error creating role:', error);
        alert('Failed to create role. Please try again.');
      }
    }
  };

  const handleAssignRole = async () => {
    if (!newAssignment.user_id || !newAssignment.department_id || !newAssignment.role_id) {
      alert('Please select user, department, and role');
      return;
    }

    try {
      const response = await roleService.assignRoleToUser({
        userId: parseInt(newAssignment.user_id),
        departmentId: parseInt(newAssignment.department_id),
        roleId: parseInt(newAssignment.role_id),
        assignedBy: 1 // Placeholder for current user ID
      });

      if (response.success) {
        alert('Role assigned successfully!');
        setNewAssignment({ user_id: '', department_id: '', role_id: '' });
        loadData(); // Refresh the data
      } else {
        alert('Failed to assign role: ' + response.message);
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      alert('Error assigning role. Please try again.');
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        await roleService.deleteRole(roleId);
        setRoles(roles.filter(role => role.id !== roleId));
        alert('Role deleted successfully!');
      } catch (error) {
        console.error('Error deleting role:', error);
        alert('Failed to delete role. Please try again.');
      }
    }
  };

  const handleRevokeAssignment = async (userId: number, deptId: number, roleId: number) => {
    if (confirm('Are you sure you want to revoke this assignment?')) {
      try {
        await roleService.updateRoleAssignmentStatus(
          userId,
          deptId,
          roleId,
          'revoked'
        );

        // Reload assignments
        const assignmentsResponse = await roleService.getAllRoleAssignments();
        if (assignmentsResponse.success && assignmentsResponse.data) {
          setUserRoles(assignmentsResponse.data);
        }

        alert('Role assignment revoked successfully!');
      } catch (error: any) {
        console.error('Error revoking assignment:', error);
        alert('Failed to revoke assignment. Please try again.');
      }
    }
  };

  const getUserName = (userId: number) => users.find(u => u.user_id === userId)?.full_name || 'Unknown';
  const getDepartmentName = (deptId: number) => departments.find(d => d.id === deptId)?.name || 'Unknown';
  const getRoleName = (roleId: number) => roles.find(r => r.id === roleId)?.name || 'Unknown';

  if (isLoading) {
  return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading role management system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#F0F8F8' }}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6">
            <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
              <Shield className="h-8 w-8 text-sky-600" />
              HR Role Management System
            </h1>
            <p className="text-gray-600 mt-2">Manage employee roles and department assignments</p>
      </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('roles')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'roles'
                  ? 'bg-sky-50 text-sky-700 border-b-2 border-sky-600'
                  : 'text-gray-500 hover:text-gray-700'
            }`}
          >
              <Shield className="h-5 w-5 inline mr-2" />
              Roles Management
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'assignments'
                  ? 'bg-sky-50 text-sky-700 border-b-2 border-sky-600'
                  : 'text-gray-500 hover:text-gray-700'
            }`}
          >
              <Users className="h-5 w-5 inline mr-2" />
              Employee Assignments
            </button>
          </div>

          <div className="p-6">
            {/* Roles Tab */}
            {activeTab === 'roles' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-800">System Roles</h2>
                  <button
                    onClick={() => setShowRoleForm(!showRoleForm)}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Create Role
          </button>
      </div>

                {/* Create Role Form */}
                {showRoleForm && (
                  <div className="bg-sky-50 p-6 rounded-lg border border-sky-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Create New Role</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role Name *
                        </label>
              <input
                type="text"
                          value={newRole.name}
                          onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="Enter role name (max 100 characters)"
                          maxLength={100}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={newRole.description}
                          onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          rows={3}
                          placeholder="Describe the role responsibilities..."
              />
            </div>
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleCreateRole(e);
                          }}
                          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md transition-colors"
                        >
                          Create Role
                        </button>
                        <button
                          onClick={() => setShowRoleForm(false)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Roles List */}
                <div className="grid gap-4">
                  {roles.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Roles Created</h3>
                      <p className="text-gray-500 mb-4">
                        No roles have been created yet. Use the "Create Role" button above to create your first role.
                      </p>
                    </div>
                  ) : (
                    roles.map((role) => (
                      <div key={role.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800">{role.name}</h3>
                            <p className="text-gray-600 mt-1">{role.description}</p>
                            <p className="text-sm text-gray-400 mt-2">
                              Created: {new Date(role.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 text-gray-600 hover:text-sky-600 transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Assignments Tab */}
            {activeTab === 'assignments' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-800">Employee Role Assignments</h2>
                  <button
                    onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    Assign Role
                  </button>
                </div>

                {/* Assignment Form */}
                {showAssignmentForm && (
                  <div className="bg-sky-50 p-6 rounded-lg border border-sky-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Assign Employee to Role</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employee *
                        </label>
                        <select
                          value={newAssignment.user_id}
                          onChange={(e) => setNewAssignment({ ...newAssignment, user_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          required
                        >
                          <option value="">Select employee</option>
                          {users
                            .filter(user => user.user_status === 'active')
                            .filter((user, index, self) => 
                              index === self.findIndex(u => u.user_id === user.user_id)
                            )
                            .map((user, index) => (
                              <option key={`user-${user.user_id}-${index}`} value={user.user_id}>
                                {user.full_name} ({user.email})
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department *
                        </label>
                        <select
                          value={newAssignment.department_id}
                          onChange={(e) => setNewAssignment({ ...newAssignment, department_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          required
                        >
                          <option value="">Select department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role *
                        </label>
            <select
                          value={newAssignment.role_id}
                          onChange={(e) => setNewAssignment({ ...newAssignment, role_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          required
            >
                          <option value="">Select role</option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
              ))}
            </select>
          </div>
                      <div className="md:col-span-3 flex gap-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAssignRole();
                          }}
                          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md transition-colors"
                        >
                          Assign Role
                        </button>
                        <button
                          onClick={() => setShowAssignmentForm(false)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assignments List */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {userRoles.length === 0 ? (
                    <div className="p-8 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Role Assignments</h3>
                      <p className="text-gray-500 mb-4">
                        No employees have been assigned roles yet. Use the "Assign Role" button above to create your first assignment.
                      </p>
                    </div>
                  ) : (
            <div className="overflow-x-auto">
                      <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Employee
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Department
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Assigned
                    </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                          {userRoles.map((assignment, index) => (
                            <tr 
                              key={`assignment-${assignment.user_id}-${assignment.department_id}-${assignment.role_id}-${index}`} 
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {assignment.user_name || getUserName(assignment.user_id)}
                      </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {assignment.department_name || getDepartmentName(assignment.department_id)}
                      </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {assignment.role_name || getRoleName(assignment.role_id)}
                      </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    assignment.status === 'active'
                                      ? 'bg-green-100 text-green-800'
                                      : assignment.status === 'inactive'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {assignment.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(assignment.assigned_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {assignment.status === 'active' && (
                        <button
                                    onClick={() => handleRevokeAssignment(
                                      assignment.user_id,
                                      assignment.department_id,
                                      assignment.role_id
                                    )}
                                    className="text-red-600 hover:text-red-900 transition-colors"
                        >
                                    Revoke
                        </button>
                                )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement; 