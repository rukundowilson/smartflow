/**
 * 
 * @param department
 * @param router
 */
export function redirectByDepartment(department: string, router: any) {
  const routes: Record<string, string> = {
    hr: "/administration/hr/overview",
    it: "/administration/it/overview",
    superadmin: "/administration/superadmin/overview",
  };

  const route = routes[department?.toLowerCase()] || "/dashboard";
  router.push(route);
}
