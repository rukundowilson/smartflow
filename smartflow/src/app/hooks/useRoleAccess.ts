import { useAuth } from '@/app/contexts/auth-context';
import { getRoleConfig, getUserPrimaryDepartment, getUserPrimaryRole, isSpecialDepartment } from '@/app/utils/roleConfig';

export function useRoleAccess() {
  const { user, isAuthenticated, selectedRole } = useAuth();

  const checkAccess = (path: string): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }

    const config = getRoleConfig(path);
    const userDepartment = getUserPrimaryDepartment(user, selectedRole);
    const userRole = getUserPrimaryRole(user, selectedRole);

    // Check department access
    if (config.allowedDepartments && config.allowedDepartments.length > 0) {
      if (!config.allowedDepartments.includes(userDepartment)) {
        return false;
      }
    }

    // Check role access
    if (config.allowedRoles && config.allowedRoles.length > 0) {
      if (!config.allowedRoles.includes(userRole)) {
        return false;
      }
    }

    return true;
  };

  const hasDepartmentAccess = (allowedDepartments: string[]): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }

    const userDepartment = getUserPrimaryDepartment(user, selectedRole);
    return allowedDepartments.includes(userDepartment);
  };

  const hasRoleAccess = (allowedRoles: string[]): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }

    const userRole = getUserPrimaryRole(user, selectedRole);
    return allowedRoles.includes(userRole);
  };

  const isStandardDepartmentUser = (): boolean => {
    const userDepartment = getUserPrimaryDepartment(user, selectedRole);
    return !isSpecialDepartment(userDepartment);
  };

  const isITDepartmentUser = (): boolean => {
    return hasDepartmentAccess(['IT Department']);
  };

  const isHRDepartmentUser = (): boolean => {
    return hasDepartmentAccess(['Human Resources']);
  };

  const isSuperAdmin = (): boolean => {
    return hasDepartmentAccess(['Superadmin']);
  };

  const isManager = (): boolean => {
    return hasRoleAccess(['Line Manager', 'HOD', 'IT Manager', 'HR Officer']);
  };

  return {
    checkAccess,
    hasDepartmentAccess,
    hasRoleAccess,
    isStandardDepartmentUser,
    isITDepartmentUser,
    isHRDepartmentUser,
    isSuperAdmin,
    isManager,
    isAuthenticated,
    user,
    selectedRole
  };
} 