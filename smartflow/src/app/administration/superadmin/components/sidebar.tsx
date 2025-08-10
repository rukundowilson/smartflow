"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  Ticket,
  Key,
  UserMinus,
  Package,
  Monitor,
  Building2,
  Shield,
  Settings,
  ChevronRight,
  Activity,
} from 'lucide-react';

const modules: Array<{
  id: string;
  name: string;
  icon: any;
  children?: Array<{ id: string; name: string; icon: any }>;
}> = [
  { id: 'overview', name: 'Overview', icon: Monitor },
  { id: 'tickets', name: 'IT Tickets', icon: Ticket },
  { id: 'access-requests', name: 'Access Requests', icon: Key },
  { id: 'revocation', name: 'Access Revocation', icon: UserMinus },
  { id: 'requisition', name: 'Item Requisition', icon: Package },
  { id: 'users', name: 'User Management', icon: Users },
  { id: 'departments', name: 'Departments', icon: Building2 },
  { id: 'roles', name: 'Role Management', icon: Shield },
  { id: 'systems', name: 'Systems', icon: Settings },
  {
    id: 'tat-metrics',
    name: 'TAT Metrics',
    icon: Activity,
    children: [
      { id: 'tat-metrics/tickets', name: 'Tickets', icon: Ticket },
      { id: 'tat-metrics/access-requests', name: 'Access Requests', icon: Key },
      { id: 'tat-metrics/users', name: 'Users', icon: Users },
    ],
  },
];

interface SideBarProps {
  className?: string;
}

function SideBar({ className = "" }: SideBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const basePath = '/administration/superadmin';

  // Set active module from URL on mount
  useEffect(() => {
    const path = pathname.split('/').pop();
    if (path && modules.some(module => module.id === path)) {
      setActiveModule(path);
    }
    if (pathname === `${basePath}/tat-metrics` || pathname.startsWith(`${basePath}/tat-metrics/`)) {
      setOpenDropdowns(prev => ({ ...prev, ['tat-metrics']: true }));
    }
  }, [pathname]);

  const handleModuleClick = (id: string) => {
    const newPath = `${basePath}/${id}`;
    if (pathname !== newPath) {
      setActiveModule(id);
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

  return (
    <nav className={`${isCollapsed ? 'w-20' : 'w-80'} bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mr-6 hidden lg:block sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 ease-in-out ${className}`}>
      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="ml-4">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Super Admin</h2>
                <p className="text-sm text-slate-500 font-medium">Administration</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200"
            title="Collapse"
          >
            <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
          </button>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="mb-8">
        {!isCollapsed && (
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">
            Management Tools
          </h3>
        )}
        <div className="space-y-1">
          {modules.map((module) => {
            const hasChildren = module.children && module.children.length > 0;
            const targetPath = `${basePath}/${module.id}`;
            const isParentActive = hasChildren
              ? pathname === `${basePath}/tat-metrics` || pathname.startsWith(`${basePath}/tat-metrics/`)
              : pathname === targetPath;
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
    </nav>
  );
}

export default SideBar;