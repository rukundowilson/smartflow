// Role-based access control configuration
export interface RoleConfig {
  allowedRoles?: string[];
  allowedDepartments?: string[];
  allowedRoleTypes?: string[];
  requireAuth?: boolean;
  redirectTo?: string;
}

// Special departments that have their own dedicated dashboards
export const SPECIAL_DEPARTMENTS = [
  'IT Department',
  'Human Resources', 
  'Superadmin'
];

// Department-specific role configurations
export const DEPARTMENT_ROLES = {
  // IT Department - has special access
  'IT Department': {
    allowedRoles: ['IT Manager', 'HOD', 'Line Manager', 'IT Support', 'IT Admin', 'User'],
    allowedDepartments: ['IT Department'],
    requireAuth: true,
    redirectTo: '/'
  },
  
  // HR Department - has special access
  'Human Resources': {
    allowedRoles: ['HR Officer', 'Line Manager', 'HOD', 'User'],
    allowedDepartments: ['Human Resources'],
    requireAuth: true,
    redirectTo: '/'
  },
  
  // Super Admin - has access to everything
  'Superadmin': {
    allowedRoles: ['Super Admin'],
    allowedDepartments: ['Superadmin'],
    requireAuth: true,
    redirectTo: '/'
  }
};

// Page-specific role configurations
export const PAGE_ROLES = {
  // Departments/Others pages - accessible by standard department users (any department not in SPECIAL_DEPARTMENTS)
  '/departments/others': {
    requireAuth: true,
    redirectTo: '/'
  },
  
  '/departments/others/overview': {
    requireAuth: true,
    redirectTo: '/'
  },
  
  '/departments/others/my-requests': {
    requireAuth: true,
    redirectTo: '/'
  },
  
  '/departments/others/my-tickets': {
    requireAuth: true,
    redirectTo: '/'
  },
  
  '/departments/others/access-request': {
    requireAuth: true,
    redirectTo: '/'
  },
  
  // IT Department pages
  '/departments/it-department': {
    allowedDepartments: ['IT Department'],
    requireAuth: true,
    redirectTo: '/'
  },
  
  // HR Department pages
  '/administration/hr': {
    allowedDepartments: ['Human Resources'],
    requireAuth: true,
    redirectTo: '/'
  },
  
  // Super Admin pages
  '/administration/superadmin': {
    allowedDepartments: ['Superadmin'],
    requireAuth: true,
    redirectTo: '/'
  },
  
  // Office administration pages
  '/administration/office': {
    allowedRoles: ['Line Manager', 'HOD', 'IT Manager'],
    requireAuth: true,
    redirectTo: '/'
  },

  // IT HOD specific pages (HOD role in IT Department)
  '/administration/it-hod': {
    allowedRoles: ['HOD'],
    allowedDepartments: ['IT Department'],
    requireAuth: true,
    redirectTo: '/'
  }
};

// Function to get role configuration for a specific path
export function getRoleConfig(path: string): RoleConfig {
  // Check for exact path match first
  if (PAGE_ROLES[path as keyof typeof PAGE_ROLES]) {
    return PAGE_ROLES[path as keyof typeof PAGE_ROLES];
  }
  
  // Check for path prefix matches
  for (const [pagePath, config] of Object.entries(PAGE_ROLES)) {
    if (path.startsWith(pagePath)) {
      return config;
    }
  }
  
  // Default configuration - require authentication
  return {
    requireAuth: true,
    redirectTo: '/'
  };
}

// Function to check if user has access to a specific department
export function hasDepartmentAccess(userDepartment: string, allowedDepartments: string[]): boolean {
  return allowedDepartments.includes(userDepartment);
}

// Function to check if user has access to a specific role
export function hasRoleAccess(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

// Function to check if a department is a special department
export function isSpecialDepartment(department: string): boolean {
  return SPECIAL_DEPARTMENTS.includes(department);
}

// Function to get user's primary department from auth context
export function getUserPrimaryDepartment(user: any, selectedRole: any): string {
  if (selectedRole?.department_name) {
    return selectedRole.department_name;
  }
  
  if (user?.department) {
    return user.department;
  }
  
  return '';
}

// Function to get user's primary role from auth context
export function getUserPrimaryRole(user: any, selectedRole: any): string {
  if (selectedRole?.role_name) {
    return selectedRole.role_name;
  }
  
  if (user?.role) {
    return user.role;
  }
  
  return '';
} 