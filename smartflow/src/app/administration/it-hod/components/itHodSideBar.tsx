"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Monitor,
  Ticket,
  Key,
  LogOut,
  Building2,
  Users,
  HelpCircle,
  X,
  Shield,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from "@/app/contexts/auth-context";

const modules: Array<{
  id: string;
  name: string;
  icon: any;
  description?: string;
  children?: Array<{ id: string; name: string; icon: any }>;
}> = [
  { id: '/', name: 'overview', icon: Key, description: 'home dashboard' },
  { id: 'pending-requests', name: 'pending requests', icon: Key, description: 'requires your approval' },
  { id: 'aprooved-requests', name: 'approved request', icon: Ticket, description: 'requests you approved' },
  { id: 'rejected', name: 'rejected requests', icon: Ticket, description: 'requests you rejected' },
  {
    id: 'tat-metrics',
    name: 'TAT Metrics',
    icon: Key,
    description: 'turnaround analytics',
    children: [
      { id: 'tat-metrics/tickets', name: 'Tickets', icon: Ticket },
      { id: 'tat-metrics/access-requests', name: 'Access Requests', icon: Key },
      { id: 'tat-metrics/users', name: 'Users', icon: Users },
    ],
  },
];

interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const basePath = '/administration/it-hod';

  const { logout, user, selectedRole } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  // dropdown open states
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  // Set active module from URL on mount and ensure dropdowns open when on child routes
  useEffect(() => {
    const path = pathname.split('/').pop()?.split('?')[0];
    if (path && modules.some(module => module.id === path)) {
      setActiveModule(path);
    }
    if (pathname === `${basePath}/tat-metrics` || pathname.startsWith(`${basePath}/tat-metrics/`)) {
      setOpenDropdowns(prev => ({ ...prev, ['tat-metrics']: true }));
    }
  }, [pathname]);

  const handleModuleClick = (id: string) => {
    const newPath = id === '/' ? `${basePath}` : `${basePath}/${id}`;
    if (pathname !== newPath) {
      setActiveModule(id);
      router.push(newPath);
      // Close mobile sidebar if it's open
      if (isMobile && onClose) {
        onClose();
      }
    }
  };

  const toggleDropdown = (id: string, children?: Array<{ id: string }>) => {
    if (!children || children.length === 0) return;
    if (isCollapsed) {
      // When collapsed, navigate to the first child for quick access
      handleModuleClick(children[0].id);
      return;
    }
    setOpenDropdowns(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = () => {
    logout();
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Hydration-safe identity/role/department
  const roleName = hydrated ? (selectedRole?.role_name || user?.role || 'User') : 'User';
  const departmentName = hydrated ? (selectedRole?.department_name || user?.department || 'Department') : 'Department';
  const displayName = hydrated ? (user?.full_name || 'User') : 'User';
  const displayEmail = hydrated ? (user?.email || '') : '';

  return (
    <nav className={`${isMobile ? 'w-full' : (isCollapsed ? 'w-20' : 'w-80')} bg-white ${isMobile ? 'rounded-xl shadow-lg border border-gray-200' : 'rounded-2xl shadow-xl border border-slate-200'} p-6 ${isMobile ? '' : 'mr-6 hidden lg:block sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 ease-in-out'}`}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Menu</h2>
              <p className="text-xs text-gray-500">Navigation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className={`${isMobile ? 'mb-6' : 'mb-8'} pb-6 ${isMobile ? 'border-gray-200' : 'border-slate-200'} border-b`}>
        <div className={`flex items-center ${isMobile ? '' : 'justify-between'} mb-4`}>
          <div className="flex items-center">
            <div className={`${isMobile ? 'w-12 h-12 rounded-xl' : 'w-12 h-12 rounded-2xl'} bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 flex items-center justify-center mr-4 shadow-lg`}>
              <Settings className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-gray-900" suppressHydrationWarning>{departmentName}</h2>
                <p className="text-xs text-gray-500 font-medium" suppressHydrationWarning>{roleName}</p>
              </div>
            )}
          </div>
          {!isMobile && (
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200">
              <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
            </button>
          )}
        </div>

        {/* Current Role Badge */}
        {!isCollapsed && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
            <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-900 truncate">Current Role</p>
              <p className="text-xs text-blue-700 truncate" suppressHydrationWarning>{roleName}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Section */}
      <div className="mb-8">
        {!isCollapsed && (
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Navigation</h3>
        )}
        <div className="space-y-1">
          {modules.map((module) => {
            const hasChildren = module.children && module.children.length > 0;
            const targetPath = `${basePath}/${module.id}`;
            const isParentActive = hasChildren
              ? pathname === `${basePath}/tat-metrics` || pathname.startsWith(`${basePath}/tat-metrics/`)
              : pathname === targetPath || (module.id === '/' && pathname === basePath);
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
                  <module.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} transition-all duration-200 ${
                    isParentActive ? 'text-white drop-shadow-sm' : 'text-slate-500 group-hover:text-slate-700'
                  }`} />
                  {!isCollapsed && (
                    <div className="flex-1 text-left min-w-0 flex items-center justify-between">
                      <div>
                        <div className="font-semibold truncate">{module.name}</div>
                        {module.description && (
                          <div className={`text-xs truncate ${isParentActive ? 'text-blue-100' : 'text-slate-400 group-hover:text-slate-500'}`}>{module.description}</div>
                        )}
                      </div>
                      {hasChildren && (
                        <ChevronRight className={`h-4 w-4 ml-2 transition-transform duration-200 ${openDropdowns[module.id] ? 'rotate-90' : ''} ${isParentActive ? 'text-white' : 'text-slate-400'}`} />
                      )}
                    </div>
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
        <div className="mb-4 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-xs font-medium" suppressHydrationWarning>
                {(displayName && displayName.length > 0) ? displayName.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate" suppressHydrationWarning>
                {displayName}
              </p>
              <p className="text-xs text-gray-500 truncate" suppressHydrationWarning>
                {displayEmail}
              </p>
            </div>
          </div>
        </div>
        
        <button onClick={handleLogout} className={`group w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'} text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:shadow-red-500/10`}>
          <LogOut className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} transition-transform duration-200 group-hover:scale-110`} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </nav>
  );
}