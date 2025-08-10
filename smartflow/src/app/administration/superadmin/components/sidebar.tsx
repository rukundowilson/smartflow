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

const modules = [
  { id: 'overview', name: 'Overview', icon: Monitor },
  { id: 'tickets', name: 'IT Tickets', icon: Ticket },
  { id: 'access-requests', name: 'Access Requests', icon: Key },
  { id: 'revocation', name: 'Access Revocation', icon: UserMinus },
  { id: 'requisition', name: 'Item Requisition', icon: Package },
  { id: 'users', name: 'User Management', icon: Users },
  { id: 'departments', name: 'Departments', icon: Building2 },
  { id: 'roles', name: 'Role Management', icon: Shield },
  { id: 'systems', name: 'Systems', icon: Settings },
  { id: 'tat-metrics', name: 'TAT Metrics', icon: Activity },
];

interface SideBarProps {
  className?: string;
}

function SideBar({ className = "" }: SideBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Set active module from URL on mount
  useEffect(() => {
    const path = pathname.split('/').pop();
    if (path && modules.some(module => module.id === path)) {
      setActiveModule(path);
    }
  }, [pathname]);

  const handleModuleClick = (id: string) => {
    const newPath = `/administration/superadmin/${id}`;
    if (pathname !== newPath) {
      setActiveModule(id);
      router.push(newPath);
    }
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
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => handleModuleClick(module.id)}
              className={`group w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'} text-sm font-medium rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                activeModule === module.id
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md'
              }`}
              title={isCollapsed ? module.name : ''}
            >
              <module.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} transition-all duration-200 ${
                activeModule === module.id ? 'text-white drop-shadow-sm' : 'text-slate-500 group-hover:text-slate-700'
              }`} />
              {!isCollapsed && (
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold truncate">{module.name}</div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default SideBar;