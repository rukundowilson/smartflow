"use client"
import React, { useState } from 'react';
import { Plus, Users, Shield, Edit, Trash2, UserPlus } from 'lucide-react';

interface Role {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
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
}

const RoleManagementSystem: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 1,
      name: 'Administrator',
      description: 'Full system access with all permissions',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      name: 'Manager',
      description: 'Department management and team oversight',
      created_at: '2024-01-16T14:20:00Z'
    },
    {
      id: 3,
      name: 'Employee',
      description: 'Standard employee access level',
      created_at: '2024-01-17T09:15:00Z'
    }
  ]);

  const [users] = useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john.doe@company.com' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com' },
    { id: 3, name: 'Mike Johnson', email: 'mike.johnson@company.com' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@company.com' }
  ]);

  const [departments] = useState<Department[]>([
    { id: 1, name: 'Human Resources' },
    { id: 2, name: 'Engineering' },
    { id: 3, name: 'Marketing' },
    { id: 4, name: 'Finance' }
  ]);

  const [userRoles, setUserRoles] = useState<UserDepartmentRole[]>([
    {
      user_id: 1,
      department_id: 2,
      role_id: 1,
      assigned_at: '2024-01-20T10:00:00Z',
      assigned_by: 1,
      status: 'active'
    },
    {
      user_id: 2,
      department_id: 1,
      role_id: 2,
      assigned_at: '2024-01-21T11:30:00Z',
      assigned_by: 1,
      status: 'active'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'roles' | 'assignments'>('roles');
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);

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

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRole.name.trim()) {
      const role: Role = {
        id: Math.max(...roles.map(r => r.id)) + 1,
        name: newRole.name,
        description: newRole.description,
        created_at: new Date().toISOString()
      };
      setRoles([...roles, role]);
      setNewRole({ name: '', description: '' });
      setShowRoleForm(false);
    }
  };

  const handleAssignRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAssignment.user_id && newAssignment.department_id && newAssignment.role_id) {
      const assignment: UserDepartmentRole = {
        user_id: parseInt(newAssignment.user_id),
        department_id: parseInt(newAssignment.department_id),
        role_id: parseInt(newAssignment.role_id),
        assigned_at: new Date().toISOString(),
        assigned_by: 1, // Current user ID
        status: 'active'
      };
      setUserRoles([...userRoles, assignment]);
      setNewAssignment({ user_id: '', department_id: '', role_id: '' });
      setShowAssignmentForm(false);
    }
  };

  const handleDeleteRole = (roleId: number) => {
    setRoles(roles.filter(role => role.id !== roleId));
  };

  const handleRevokeAssignment = (userId: number, deptId: number, roleId: number) => {
    setUserRoles(userRoles.map(ur => 
      ur.user_id === userId && ur.department_id === deptId && ur.role_id === roleId
        ? { ...ur, status: 'revoked' as const }
        : ur
    ));
  };

  const getUserName = (userId: number) => users.find(u => u.id === userId)?.name || 'Unknown';
  const getDepartmentName = (deptId: number) => departments.find(d => d.id === deptId)?.name || 'Unknown';
  const getRoleName = (roleId: number) => roles.find(r => r.id === roleId)?.name || 'Unknown';

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#F0F8F8' }}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6">
            <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
              <Shield className="h-8 w-8" />
              Role Management System
            </h1>
            <p className="text-gray-600 mt-2">Manage organizational roles and user assignments</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'roles'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
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
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-5 w-5 inline mr-2" />
              User Assignments
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Create Role
                  </button>
                </div>

                {/* Create Role Form */}
                {showRoleForm && (
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
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
                  {roles.map((role) => (
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
                          <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
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
                  ))}
                </div>
              </div>
            )}

            {/* Assignments Tab */}
            {activeTab === 'assignments' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-800">User Role Assignments</h2>
                  <button
                    onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    Assign Role
                  </button>
                </div>

                {/* Assignment Form */}
                {showAssignmentForm && (
                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Assign User to Role</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          User *
                        </label>
                        <select
                          value={newAssignment.user_id}
                          onChange={(e) => setNewAssignment({ ...newAssignment, user_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        >
                          <option value="">Select user</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                            handleAssignRole(e);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
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
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
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
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {getUserName(assignment.user_id)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getDepartmentName(assignment.department_id)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getRoleName(assignment.role_id)}
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagementSystem;