"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Monitor,
  Ticket,
  Key,
  UserMinus,
  Package,
  LogOut,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from "@/app/contexts/auth-context";
import { getAllTickets } from "@/app/services/itTicketService";
import systemAccessRequestService from "@/app/services/systemAccessRequestService";

const modules = [
  { 
    id: 'overview', 
    name: 'Overview', 
    icon: Monitor, 
    description: 'Dashboard & Analytics',
  },
  { 
    id: 'tickets', 
    name: 'IT Tickets', 
    icon: Ticket, 
    description: 'Support Management',
  },
  { 
    id: 'access-requests', 
    name: 'Access Requests', 
    icon: Key, 
    description: 'Permission Management',
  },
  { 
    id: 'revocation', 
    name: 'Access Revocation', 
    icon: UserMinus, 
    description: 'Security Management',
  },
  { 
    id: 'requisition', 
    name: 'Item Requisition', 
    icon: Package, 
    description: 'Asset Management',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { logout, user } = useAuth();

  // Dynamic badge counts
  const [ticketBadgeCount, setTicketBadgeCount] = useState<number>(0);
  const [accessBadgeCount, setAccessBadgeCount] = useState<number>(0);

  // Set active module from URL on mount
  useEffect(() => {
    const path = pathname.split('/').pop();
    if (path && modules.some(module => module.id === path)) {
      setActiveModule(path);
    }
  }, [pathname]);

  // Load dynamic badge counts
  useEffect(() => {
    let isCancelled = false;

    const loadCounts = async () => {
      try {
        // Tickets: count open tickets
        const tRes = await getAllTickets();
        if (!isCancelled) {
          const openCount = (tRes?.tickets || []).filter(t => t.status === 'open').length;
          setTicketBadgeCount(openCount);
        }
      } catch {
        if (!isCancelled) setTicketBadgeCount(0);
      }

      try {
        // Access Requests: pending IT support review
        const uid = user?.id ? Number(user.id) : 0;
        const sarRes = await systemAccessRequestService.getITSupportQueue({ user_id: uid });
        if (!isCancelled) {
          const pendingCount = (sarRes?.requests || []).filter((r: any) => r.status === 'it_support_review').length;
          setAccessBadgeCount(pendingCount);
        }
      } catch {
        if (!isCancelled) setAccessBadgeCount(0);
      }
    };

    loadCounts();
    const interval = setInterval(loadCounts, 60_000); // refresh every 60s
    return () => { isCancelled = true; clearInterval(interval); };
  }, [user?.id]);

  const handleModuleClick = (id: string) => {
    const newPath = `/departments/it-department/${id}`;
    if (pathname !== newPath) {
      setActiveModule(id);
      router.push(newPath);
    }
  };

  const getBadgeClass = (moduleId: string) => {
    if (moduleId === 'tickets') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (moduleId === 'access-requests') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <nav className={`${isCollapsed ? 'w-20' : 'w-80'} bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mr-6 hidden lg:block sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 ease-in-out`}>
      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="ml-4">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">IT Department</h2>
                <p className="text-sm text-slate-500 font-medium">Management Portal</p>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200"
          >
            <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
          </button>
        </div>
        
        {/* User Info */}
        {!isCollapsed && user && (
          <div className="flex items-center p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
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
            const count = module.id === 'tickets' ? ticketBadgeCount : module.id === 'access-requests' ? accessBadgeCount : 0;
            return (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module.id)}
                className={`group w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'} text-sm font-medium rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                  activeModule === module.id
                    ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md"
                }`}
                title={isCollapsed ? module.name : ''}
              >
                <module.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} transition-all duration-200 ${
                  activeModule === module.id 
                    ? "text-white drop-shadow-sm" 
                    : "text-slate-500 group-hover:text-slate-700"
                }`} />
                
                {!isCollapsed && (
                  <>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-semibold truncate">{module.name}</div>
                      <div className={`text-xs truncate transition-colors duration-200 ${
                        activeModule === module.id ? "text-blue-100" : "text-slate-400 group-hover:text-slate-500"
                      }`}>
                        {module.description}
                      </div>
                    </div>
                    {count > 0 && (
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getBadgeClass(module.id)}`}>
                        {count}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sign Out */}
      <div className="pt-6 border-t border-slate-200">
        <button
          onClick={logout}
          className={`group w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'} text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:shadow-red-500/10`}
          title={isCollapsed ? 'Sign Out' : ''}
        >
          <LogOut className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} transition-transform duration-200 group-hover:scale-110`} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </nav>
  );
}