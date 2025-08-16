"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Users, Shield, User, Settings, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '@/app/contexts/auth-context';

interface UserRole {
  department_name: string;
  role_name: string;
  department_id: number;
  role_id: number;
  dept_id: number;
}

interface User {
  id: number;
  full_name: string;
  email: string;
  department: string;
  role: string;
  status: string;
  roles: UserRole[];
}

export default function RoleSelectionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { setSelectedRole: setAuthSelectedRole } = useAuth();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      
      // If user has only one role, auto-select it
      if (userObj.roles && userObj.roles.length === 1) {
        setSelectedRole(userObj.roles[0]);
      }
    }
    setIsLoading(false);
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) return;

    // Update user object with selected role
    const updatedUser = {
      ...user,
      department: selectedRole.department_name,
      role: selectedRole.role_name,
      selectedRole: selectedRole
    };

    // Save updated user data
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Save selected role in auth context
    localStorage.setItem('selectedRole', JSON.stringify(selectedRole));
    setAuthSelectedRole(selectedRole);

    // Redirect based on selected role
    redirectByRole(selectedRole);
  };

  const redirectByRole = (role: UserRole) => {
    const roleName = role.role_name;
    const departmentName = role.department_name.toLowerCase();

    // Check for approval roles first (these take priority)
    if (roleName === 'Line Manager') {
      router.push('/administration/office/linemanager');
      return;
    }
    
    if (roleName === 'HOD') {
      // Check if HOD is in IT Department
      if (departmentName === 'it department' || departmentName === 'it' || departmentName === 'information technology') {
        console.log('🔍 IT Department HOD, redirecting to IT HOD dashboard');
        router.push('/administration/it-hod');
        return;
      }
      
      // For other departments, use the general HOD route
      console.log('🔍 General HOD, redirecting to HOD approvals');
      router.push('/administration/office/hod');
      return;
    }
    
    if (roleName === 'IT Manager') {
      router.push('/administration/office/itmanager');
      return;
    }

    // Check if the department is one of the special ones (case-insensitive)
    const specialDepartments = [
      "human resources",
      "hr",
      "it department", 
      "it",
      "it deparment", // Handle typo
      "information technology",
      "superadmin"
    ];

    if (specialDepartments.includes(departmentName)) {
      // For special departments, redirect based on department regardless of role
      const routes: Record<string, string> = {
        "human resources": "/administration/hr",
        "hr": "/administration/hr",
        "it department": "/departments/it-department/overview",
        "it": "/departments/it-department/overview",
        "it deparment": "/departments/it-department/overview", // Handle typo
        "information technology": "/departments/it-department/overview",
        "superadmin": "/administration/superadmin/overview"
      };
      
      const route = routes[departmentName] || "/departments/others/overview";
      console.log(`Redirecting ${departmentName} user to: ${route}`);
      router.push(route);
    } else {
      // For other departments (Finance, Marketing, etc.), redirect to general dashboard
      console.log(`Redirecting ${departmentName} user to general dashboard`);
      router.push("/departments/others/overview");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('selectedRole');
    router.push('/');
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'line manager':
        return <Users className="h-6 w-6 text-yellow-600" />;
      case 'hod':
        return <Shield className="h-6 w-6 text-orange-600" />;
      case 'it manager':
        return <Building2 className="h-6 w-6 text-blue-600" />;
      case 'admin':
      case 'superadmin':
        return <Settings className="h-6 w-6 text-purple-600" />;
      default:
        return <User className="h-6 w-6 text-gray-600" />;
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'line manager':
        return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100';
      case 'hod':
        return 'border-orange-200 bg-orange-50 hover:bg-orange-100';
      case 'it manager':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      case 'admin':
      case 'superadmin':
        return 'border-purple-200 bg-purple-50 hover:bg-purple-100';
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading role selection...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.roles || user.roles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
            <User className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Roles Assigned</h2>
          <p className="text-gray-600 mb-4">You don't have any active roles assigned.</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <LogOut className="h-4 w-4 inline mr-2" />
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome, {user.full_name}!
          </h1>
          <p className="text-lg text-gray-600">
            You have multiple roles assigned. Please select which role you'd like to use for this session.
          </p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{user.full_name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.roles.map((role, index) => (
            <div
              key={`${role.department_id}-${role.role_id}`}
              className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-200 ${
                selectedRole === role 
                  ? 'ring-2 ring-blue-500 ring-offset-2' 
                  : ''
              } ${getRoleColor(role.role_name)}`}
              onClick={() => handleRoleSelect(role)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getRoleIcon(role.role_name)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {role.role_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {role.department_name}
                  </p>
                </div>
                {selectedRole === role && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              selectedRole
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ArrowRight className="h-5 w-5 inline mr-2" />
            Continue with Selected Role
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            You can switch roles by logging out and logging back in.
          </p>
        </div>
      </div>
    </div>
  );
} 