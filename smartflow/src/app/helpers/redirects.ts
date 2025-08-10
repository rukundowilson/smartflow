/**
 * 
 * @param department
 * @param router
 */
export function redirectByDepartment(department: string, router: any) {
  console.log('🔍 redirectByDepartment called with department:', department);
  
  // Define the special departments that have specific dashboards
  const specialDepartments = [
    "human resources",
    "hr",
    "it department", 
    "it",
    "it deparment", // Handle typo
    "information technology",
    "superadmin",
    "it hod"
  ];

  // Check if the department is one of the special ones (case-insensitive)
  const departmentLower = department?.toLowerCase();
  console.log('🔍 departmentLower:', departmentLower);
  console.log('🔍 specialDepartments includes:', specialDepartments.includes(departmentLower));
  
  if (specialDepartments.includes(departmentLower)) {
    // Handle special departments with specific routes
    const routes: Record<string, string> = {
      "human resources": "/administration/hr",
      "hr": "/administration/hr",
      "it department": "/departments/it-department/overview",
      "it": "/departments/it-department/overview",
      "it deparment": "/departments/it-department/overview", // Handle typo
      "information technology": "/departments/it-department/overview",
      "superadmin": "/administration/superadmin/overview",
      "it hod": "/administration/it-hod"
    };
    
    const route = routes[departmentLower] || "/departments/others/overview";
    console.log('🔍 redirecting to:', route);
    window.location.href = route;
  } else {
    // For non-special departments, check if user is a Line Manager
    // We need to get the user's role from localStorage or context
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role === 'Line Manager') {
        console.log('🔍 User is Line Manager, redirecting to Line Manager approvals');
        window.location.href = "/administration/office/linemanager/approvals";
        return;
      }
    }
    
    // All other departments redirect to the general "others" dashboard
    console.log('🔍 redirecting to general dashboard: /departments/others/overview');
    window.location.href = "/departments/others/overview";
  }
}

/**
 * Redirects user based on their department and roles
 * @param department - User's department
 * @param roleNames - Array of user's role names
 * @param router - Next.js router instance
 */
export function redirectByDepartmentAndRoles(department: string, roleNames: string[], router: any) {
  console.log('🔍 redirectByDepartmentAndRoles called with:');
  console.log('  - department:', department);
  console.log('  - roleNames:', roleNames);
  
  const rolesLower = (roleNames || []).map(r => (r || '').toLowerCase());
  const go = (path: string) => {
    try {
      if (router && typeof router.push === 'function') {
        router.push(path);
        return;
      }
    } catch {}
    window.location.href = path;
  };

  // Check for specific roles first
  if (rolesLower.includes('line manager')) {
    console.log('🔍 User is Line Manager, redirecting to Line Manager approvals');
    go("/administration/office/linemanager/approvals");
    return;
  }
  
  if (rolesLower.includes('hod')) {
    console.log('🔍 User is HOD, redirecting to HOD approvals');
    go("/administration/office/hod/approvals");
    return;
  }
  
  if (rolesLower.includes('it manager')) {
    console.log('🔍 User is IT Manager, redirecting to IT Manager dashboard');
    go("/administration/office/itmanager");
    return;
  }
  if (rolesLower.includes('it hod') || rolesLower.includes('ithod')) {
    console.log('🔍 User is IT HOD, redirecting to IT HOD dashboard');
    go("/administration/it-hod");
    return;
  }
  
  // Define the special departments that have specific dashboards
  const specialDepartments = [
    "human resources",
    "hr",
    "it department", 
    "it",
    "it deparment", // Handle typo
    "information technology",
    "superadmin",
    "it hod"
  ];

  // Check if the department is one of the special ones (case-insensitive)
  const departmentLower = department?.toLowerCase();
  console.log('🔍 departmentLower:', departmentLower);
  console.log('🔍 specialDepartments includes:', specialDepartments.includes(departmentLower));
  
  if (specialDepartments.includes(departmentLower)) {
    // Handle special departments with specific routes
    const routes: Record<string, string> = {
      "human resources": "/administration/hr",
      "hr": "/administration/hr",
      "it department": "/departments/it-department/overview",
      "it": "/departments/it-department/overview",
      "it deparment": "/departments/it-department/overview", // Handle typo
      "information technology": "/departments/it-department/overview",
      "superadmin": "/administration/superadmin/overview",
      "it hod": "/administration/it-hod"
    };
    
    const route = routes[departmentLower] || "/departments/others/overview";
    console.log('🔍 redirecting to:', route);
    go(route);
  } else {
    // All other departments redirect to the general "others" dashboard
    console.log('🔍 redirecting to general dashboard: /departments/others/overview');
    go("/departments/others/overview");
  }
}
