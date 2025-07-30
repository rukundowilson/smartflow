/**
 * 
 * @param department
 * @param router
 */
export function redirectByDepartment(department: string, router: any) {
  // Define the special departments that have specific dashboards
  const specialDepartments = [
    "human resources",
    "hr",
    "it department", 
    "it",
    "superadmin"
  ];

  // Check if the department is one of the special ones
  const departmentLower = department?.toLowerCase();
  
  if (specialDepartments.includes(departmentLower)) {
    // Handle special departments with specific routes
    const routes: Record<string, string> = {
      "human resources": "/administration/hr",
      "hr": "/administration/hr",
      "it department": "/departments/it-department/overview",
      "it": "/departments/it-department/overview",
      "superadmin": "/administration/superadmin/overview"
    };
    
    const route = routes[departmentLower] || "/departments/others/overview";
    window.location.href = route;
  } else {
    // All other departments redirect to the general "others" dashboard
    window.location.href = "/departments/others/overview";
  }
}
