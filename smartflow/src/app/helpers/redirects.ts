/**
 * 
 * @param department
 * @param router
 */
export function redirectByDepartment(department: string, router: any) {
  const routes: Record<string, string> = {
    hr: "/administration/hr",
    it: "/departments/it-department/overview",
    superadmin: "/administration/superadmin/overview",
    other : "/departments/others/overview"
  };

  const route = routes[department?.toLowerCase()] || "/notfound";
  router.push(route);
}
