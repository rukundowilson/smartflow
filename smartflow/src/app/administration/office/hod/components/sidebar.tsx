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
  Clock,
} from 'lucide-react';
import { useAuth } from "@/app/contexts/auth-context";
import systemAccessRequestService from "@/app/services/systemAccessRequestService";

const modules = [
  { id: '', name: 'Overview', icon: Monitor, description: 'HOD dashboard' },
  { id: 'requests', name: 'Manage Requests', icon: Key, description: 'Approve requests' },
  { id: 'reviewed', name: 'Reviewed Requests', icon: CheckCircle, description: 'View reviewed requests' },
];

export default function HodSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [counts, setCounts] = useState({
    pending: 0,
    reviewed: 0
  });

  const { logout, user, selectedRole } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  const roleName = hydrated ? (selectedRole?.role_name || user?.role || 'User') : 'User';
  const departmentName = hydrated ? (selectedRole?.department_name || user?.department || 'Department') : 'Department';

  // Fetch counts for badges
  const fetchCounts = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch pending requests count
      const pendingResponse = await systemAccessRequestService.getPending({ approver_id: user.id, approver_role: 'HOD' });
      const pendingCount = pendingResponse.success ? (pendingResponse.requests || []).length : 0;
      
      // Fetch reviewed requests count (both approved and rejected)
      const reviewedResponse = await systemAccessRequestService.getApprovedBy({ approver_id: user.id, approver_role: 'HOD' });
      const reviewedRequests = reviewedResponse.success ? (reviewedResponse.requests || []) : [];
      const reviewedCount = reviewedRequests.filter(request => 
        request.hod_at
      ).length;
      
      setCounts({
        pending: pendingCount,
        reviewed: reviewedCount
      });
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  // Set active module from URL on mount
  useEffect(() => {
    // Extract the last part of the path, removing query parameters
    const path = pathname.split('/').pop()?.split('?')[0];
    if (path && modules.some(module => module.id === path)) {
      setActiveModule(path);
    } else if (pathname === '/administration/office/hod' || pathname.endsWith('/hod/')) {
      setActiveModule('');
    }
  }, [pathname]);

  // Fetch counts when user changes
  useEffect(() => {
    fetchCounts();
  }, [user]);

  // Refresh counts when pathname changes (user navigates)
  useEffect(() => {
    fetchCounts();
  }, [pathname]);

  const handleModuleClick = (id: string) => {
    const newPath = `/administration/office/hod${id === '' ? '' : `/${id}`}`;
    if (pathname !== newPath) {
      setActiveModule(id || 'overview');
      router.push(newPath);
    }
  };

  // Get count for specific module
  const getModuleCount = (moduleId: string) => {
    switch (moduleId) {
      case 'requests':
        return counts.pending;
      case 'reviewed':
        return counts.reviewed;
      default:
        return 0;
    }
  };

  return (
    <nav className={`${isCollapsed ? 'w-20' : 'w-88'} bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mr-6 hidden lg:block sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out`}>
      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-slate-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Settings className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="ml-4 flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight break-words leading-tight" suppressHydrationWarning>{departmentName} Office</h2>
                <p className="text-sm text-slate-500 font-medium break-words leading-tight mt-1" suppressHydrationWarning>{roleName}</p>
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
            const count = getModuleCount(module.id);
            return (
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
                <div className="relative">
                  <module.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} transition-all duration-200 ${
                    activeModule === module.id ? 'text-white drop-shadow-sm' : 'text-slate-500 group-hover:text-slate-700'
                  }`} />
                  {/* Badge for collapsed state */}
                  {isCollapsed && count > 0 && (
                    <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full text-xs font-bold flex items-center justify-center ${
                      activeModule === module.id 
                        ? 'bg-white text-indigo-600' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {count > 99 ? '99+' : count}
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{module.name}</div>
                      <div className={`text-xs truncate ${activeModule === module.id ? 'text-blue-100' : 'text-slate-400 group-hover:text-slate-500'}`}>{module.description}</div>
                    </div>
                    {/* Badge for expanded state */}
                    {count > 0 && (
                      <div className={`ml-1 flex-shrink-0 px-1.5 py-0.5 rounded-full text-xs font-bold min-w-[1.5rem] text-center ${
                        activeModule === module.id 
                          ? 'bg-white text-indigo-600' 
                          : module.id === 'requests'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                      }`}>
                        {count > 99 ? '99+' : count}
                      </div>
                    )}
                  </div>
                )}
              </button>
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