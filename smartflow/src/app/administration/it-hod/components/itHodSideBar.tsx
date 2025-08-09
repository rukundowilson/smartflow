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
} from 'lucide-react';
import { useAuth } from "@/app/contexts/auth-context";

const modules = [
  { id: '/', name: 'overview', icon: Key, description: 'home dashboard' },
  { id: 'pending-requests', name: 'pending requests', icon: Key, description: 'requires your approval' },
  { id: 'aprooved-requests', name: 'approved request', icon: Ticket, description: 'requests you approved' },
  { id: 'rejected', name: 'rejected requests', icon: Ticket, description: 'requests you rejected' },
];

interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('overview');

  const { logout, user, selectedRole } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  // Set active module from URL on mount
  useEffect(() => {
    // Extract the last part of the path, removing query parameters
    const path = pathname.split('/').pop()?.split('?')[0];
    if (path && modules.some(module => module.id === path)) {
      setActiveModule(path);
    }
  }, [pathname]);

  const handleModuleClick = (id: string) => {
    const newPath = id === '/' ? `/administration/it-hod` : `/administration/it-hod/${id}`;
    if (pathname !== newPath) {
      setActiveModule(id);
      router.push(newPath);
      // Close mobile sidebar if it's open
      if (isMobile && onClose) {
        onClose();
      }
    }
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
    <nav className={`${isMobile ? 'w-full' : 'min-w-[280px] max-w-[320px] w-72'} bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${isMobile ? '' : 'mr-6 hidden lg:block sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto'}`}>
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
      <div className={`${isMobile ? 'mb-6' : 'mb-8'} pb-6 border-b border-gray-200`}>
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-sm">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900" suppressHydrationWarning>{departmentName}</h2>
            <p className="text-xs text-gray-500 font-medium" suppressHydrationWarning>{roleName}</p>
          </div>
        </div>
        
        {/* Current Role Badge */}
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
          <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-blue-900 truncate">Current Role</p>
            <p className="text-xs text-blue-700 truncate" suppressHydrationWarning>{roleName}</p>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">
          Navigation
        </h3>
        <div className="space-y-2">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => handleModuleClick(module.id)}
              className={`group w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeModule === module.id
                  ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
              }`}
            >
              <module.icon className={`h-5 w-5 mr-3 transition-colors ${
                activeModule === module.id 
                  ? "text-blue-600" 
                  : "text-gray-500 group-hover:text-gray-700"
              }`} />
              <div className="flex-1 text-left">
                <div className="font-medium">{module.name}</div>
                <div className={`text-xs ${
                  activeModule === module.id ? "text-blue-600" : "text-gray-400"
                }`}>
                  {module.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* User Info & Sign Out */}
      <div className="pt-6 border-t border-gray-200">
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
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
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-sm"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </nav>
  );
}