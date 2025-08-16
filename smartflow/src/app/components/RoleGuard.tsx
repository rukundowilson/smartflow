"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/auth-context';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  allowedDepartments?: string[];
  allowedRoleTypes?: string[]; // For specific role types like 'User', 'Manager', etc.
  requireAuth?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

interface RoleConfig {
  department: string;
  role: string;
  roleType?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles = [],
  allowedDepartments = [],
  allowedRoleTypes = [],
  requireAuth = true,
  fallback,
  redirectTo = '/'
}) => {
  const { user, isAuthenticated, selectedRole } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      // If authentication is not required, allow access
      if (!requireAuth) {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      // If user is not authenticated, deny access
      if (!isAuthenticated || !user) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      // Get user's roles and departments
      const userRoles: RoleConfig[] = [];
      
      // Add primary role from user object
      if (user.role && user.department) {
        userRoles.push({
          department: user.department,
          role: user.role
        });
      }

      // Add roles from selectedRole
      if (selectedRole) {
        userRoles.push({
          department: selectedRole.department_name || selectedRole.department,
          role: selectedRole.role_name || selectedRole.role
        });
      }

      // Add roles from user.roles array
      if (Array.isArray(user.roles)) {
        user.roles.forEach((role: any) => {
          if (typeof role === 'string') {
            userRoles.push({
              department: user.department,
              role: role
            });
          } else if (role && typeof role === 'object') {
            userRoles.push({
              department: role.department_name || role.department,
              role: role.role_name || role.role
            });
          }
        });
      }

      // Debug logging
      console.log('🔍 RoleGuard Debug Info:');
      console.log('User object:', user);
      console.log('Selected role:', selectedRole);
      console.log('User roles array:', userRoles);
      console.log('Allowed departments:', allowedDepartments);
      console.log('Allowed roles:', allowedRoles);

      // Check if user has any matching roles/departments
      const hasMatchingRole = userRoles.some(userRole => {
        // Check allowed roles
        if (allowedRoles.length > 0 && !allowedRoles.includes(userRole.role)) {
          console.log(`❌ Role mismatch: ${userRole.role} not in ${allowedRoles}`);
          return false;
        }

        // Check allowed departments
        if (allowedDepartments.length > 0 && !allowedDepartments.includes(userRole.department)) {
          console.log(`❌ Department mismatch: ${userRole.department} not in ${allowedDepartments}`);
          return false;
        }

        // Check allowed role types
        if (allowedRoleTypes.length > 0 && userRole.roleType && !allowedRoleTypes.includes(userRole.roleType)) {
          console.log(`❌ Role type mismatch: ${userRole.roleType} not in ${allowedRoleTypes}`);
          return false;
        }

        console.log(`✅ Access granted for role: ${userRole.role}, department: ${userRole.department}`);
        return true;
      });

      // Special logic for departments/others pages - allow any department that's not special
      let finalAccess = hasMatchingRole;
      
      // If this is a departments/others page and no specific departments are required,
      // allow access to any department that's not in the special departments list
      if (window.location.pathname.startsWith('/departments/others') && allowedDepartments.length === 0) {
        const specialDepartments = ['IT Department', 'Human Resources', 'Superadmin'];
        const userDepartment = userRoles[0]?.department || '';
        
        if (!specialDepartments.includes(userDepartment)) {
          console.log(`✅ Access granted to departments/others for standard department: ${userDepartment}`);
          finalAccess = true;
        } else {
          console.log(`❌ Access denied to departments/others for special department: ${userDepartment}`);
          finalAccess = false;
        }
      }

      // If no specific restrictions, allow access
      if (allowedRoles.length === 0 && allowedDepartments.length === 0 && allowedRoleTypes.length === 0) {
        setHasAccess(true);
      } else {
        setHasAccess(finalAccess);
      }

      console.log(`🔍 Final access decision: ${finalAccess ? 'GRANTED' : 'DENIED'}`);

      setIsLoading(false);
    };

    checkAccess();
  }, [user, isAuthenticated, selectedRole, allowedRoles, allowedDepartments, allowedRoleTypes, requireAuth]);

  useEffect(() => {
    if (!isLoading && !hasAccess && redirectTo) {
      router.push(redirectTo);
    }
  }, [isLoading, hasAccess, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard; 