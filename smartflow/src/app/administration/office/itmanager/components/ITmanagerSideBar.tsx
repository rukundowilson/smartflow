"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Monitor,
  Key,
  LogOut,
  Building2,
  CheckCircle,
  Settings,
  ChevronRight,
  Ticket,
  Users,
  Clock,
} from 'lucide-react';
import { useAuth } from "@/app/contexts/auth-context";
import systemAccessRequestService from "@/app/services/systemAccessRequestService";

const modules: Array<{
  id: string;
  name: string;
  icon: any;
  description?: string;
  children?: Array<{ id: string; name: string; icon: any }>;
}> = [
  { id: '', name: 'Overview', icon: Monitor, description: 'IT Manager dashboard' },
  { id: 'assignments', name: 'Assignments', icon: CheckCircle, description: 'IT support assignments' },
  {
    id: 'tat-metrics',
    name: 'TAT Metrics',
    icon: Monitor,
    description: 'Turnaround analytics',
    children: [
      { id: 'tat-metrics/tickets', name: 'Tickets', icon: Ticket },
      { id: 'tat-metrics/access-requests', name: 'Access Requests', icon: Key },
      { id: 'tat-metrics/users', name: 'Users', icon: Users },
    ],
  },
];

export default function ITManagerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [counts, setCounts] = useState({ pending: 0, assignments: 0 });

  const basePath = '/administration/office/itmanager';

  const { logout, user } = useAuth();

  const fetchCounts = async () => {
    if (!user?.id) return;
    
    try {
      const [pendingRes, assignmentsRes] = await Promise.all([
        systemAccessRequestService.getPending({ 
          approver_id: user.id, 
          approver_role: 'IT Manager' 
        }),
        systemAccessRequestService.getApprovedBy({ 
          approver_id: user.id, 
          approver_role: 'IT Manager' 
        })
      ]);

      // Pending: Only requests that need IT Manager action
      const pendingCount = pendingRes.success ? pendingRes.requests.filter(r => r.status === 'it_manager_pending').length : 0;
      
      // Assignments: All requests the IT Manager has acted upon
      const assignmentsCount = assignmentsRes.success ? assignmentsRes.requests.length : 0;

      setCounts({ pending: pendingCount, assignments: assignmentsCount });
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  // Fetch counts when user changes
  useEffect(() => {
    fetchCounts();
  }, [user?.id]);

  // Fetch counts when pathname changes (refresh data)
  useEffect(() => {
    fetchCounts();
  }, [pathname]);

  // Set active module from URL on mount
  useEffect(() => {
    // Extract the last part of the path, removing query parameters
    const path = pathname.split('/').pop()?.split('?')[0];
    if (path && modules.some(module => module.id === path)) {
      setActiveModule(path);
    } else if (pathname === basePath || pathname.endsWith('/itmanager/')) {
      setActiveModule('');
    }
  }, [pathname]);

  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (pathname === `${basePath}/tat-metrics` || pathname.startsWith(`${basePath}/tat-metrics/`)) {
      setOpenDropdowns(prev => ({ ...prev, ['tat-metrics']: true }));
    }
  }, [pathname]);

  const handleModuleClick = (id: string) => {
    const newPath = `${basePath}${id === '' ? '' : `/${id}`}`;
    if (pathname !== newPath) {
      setActiveModule(id || '');
      router.push(newPath);
    }
  };

  const toggleDropdown = (id: string, children?: Array<{ id: string }>) => {
    if (!children || children.length === 0) return;
    if (isCollapsed) {
      handleModuleClick(children[0].id);
      return;
    }
    setOpenDropdowns(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getBadgeCount = (moduleId: string) => {
    switch (moduleId) {
      case '':
        // Overview: Only show pending requests that need IT Manager action
        return counts.pending;
      case 'assignments':
        // Assignments: Show all assignments (assigned, granted, rejected)
        return counts.assignments;
      default:
        return 0;
    }
  };

  const getBadgeColor = (moduleId: string) => {
    const count = getBadgeCount(moduleId);
    if (count === 0) return 'hidden';
    if (count > 99) return 'bg-red-500 text-white';
    return 'bg-blue-500 text-white';
  };

  return (
    <nav className={`${isCollapsed ? 'w-20' : 'w-88'} bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mr-6 hidden lg:block sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out`}>
      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-slate-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Settings className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="ml-4 flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight break-words leading-tight">IT Manager</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">{user?.department}</p>
              </div>
            )}
          </div>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200 flex-shrink-0">
            <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
          </button>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="mb-8">
        {!isCollapsed && (
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Management</h3>
        )}
        <div className="space-y-1">
          {modules.map((module) => {
            const hasChildren = module.children && module.children.length > 0;
            const targetPath = `${basePath}/${module.id}`;
            const isParentActive = hasChildren
              ? pathname === `${basePath}/tat-metrics` || pathname.startsWith(`${basePath}/tat-metrics/`)
              : pathname === (module.id === '' ? basePath : targetPath);
            const badgeCount = getBadgeCount(module.id);
            const badgeColor = getBadgeColor(module.id);
            
            return (
              <div key={module.id}>
                <button
                  onClick={() => hasChildren ? toggleDropdown(module.id, module.children) : handleModuleClick(module.id)}
                  className={`group w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'} text-sm font-medium rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                    isParentActive
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md'
                  }`}
                  title={isCollapsed ? module.name : ''}
                >
                  <module.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} transition-all duration-200 flex-shrink-0 ${
                    isParentActive ? 'text-white drop-shadow-sm' : 'text-slate-500 group-hover:text-slate-700'
                  }`} />
                  {!isCollapsed && (
                    <div className="flex-1 text-left min-w-0 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{module.name}</div>
                        {module.description && (
                          <div className={`text-xs truncate ${isParentActive ? 'text-blue-100' : 'text-slate-400 group-hover:text-slate-500'}`}>{module.description}</div>
                        )}
                      </div>
                      <div className="flex items-center flex-shrink-0">
                        {badgeCount > 0 && (
                          <span className={`ml-1 px-1.5 py-0.5 text-xs font-medium rounded-full min-w-[1.5rem] text-center ${badgeColor}`}>
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </span>
                        )}
                      {hasChildren && (
                          <ChevronRight className={`h-4 w-4 ml-1 transition-transform duration-200 flex-shrink-0 ${openDropdowns[module.id] ? 'rotate-90' : ''} ${isParentActive ? 'text-white' : 'text-slate-400'}`} />
                      )}
                      </div>
                    </div>
                  )}
                  {isCollapsed && badgeCount > 0 && (
                    <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-medium rounded-full min-w-[1.5rem] text-center ${badgeColor}`}>
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </button>

                {hasChildren && openDropdowns[module.id] && !isCollapsed && (
                  <div className="mt-1 ml-10 space-y-1">
                    {module.children!.map(child => {
                      const childPath = `${basePath}/${child.id}`;
                      const isChildActive = pathname === childPath || pathname.startsWith(`${childPath}/`);
                      return (
                        <button
                          key={child.id}
                          onClick={() => handleModuleClick(child.id)}
                          className={`group w-full flex items-center px-3 py-2 text-sm rounded-xl transition-colors ${
                            isChildActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <child.icon className={`h-4 w-4 mr-2 ${isChildActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-600'}`} />
                          <span className="truncate">{child.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* User Info & Sign Out */}
      <div className="pt-6 border-t border-slate-200">
        {user && (
          <div className="mb-4 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-xs font-medium">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
        <button onClick={logout} className={`group w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'} text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:shadow-red-500/10`}>
          <LogOut className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} transition-transform duration-200 group-hover:scale-110`} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </nav>
  );
} 