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
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from "@/app/contexts/auth-context";

const modules = [
  { id: 'overview', name: 'Overview', icon: Monitor, description: 'IT Dashboard' },
  { id: 'tickets', name: 'IT Tickets', icon: Ticket, description: 'Manage tickets' },
  { id: 'access-requests', name: 'Access Requests', icon: Key, description: 'Handle requests' },
  { id: 'revocation', name: 'Access Revocation', icon: UserMinus, description: 'Revoke access' },
  { id: 'requisition', name: 'Item Requisition', icon: Package, description: 'Manage items' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('overview');

  const { logout, user } = useAuth();

  // Set active module from URL on mount
  useEffect(() => {
    const path = pathname.split('/').pop();
    if (path && modules.some(module => module.id === path)) {
      setActiveModule(path);
    }
  }, [pathname]);

  const handleModuleClick = (id: string) => {
    const newPath = `/departments/it-department/${id}`;
    if (pathname !== newPath) {
      setActiveModule(id);
      router.push(newPath);
    }
  };

  return (
    <nav className="min-w-[280px] max-w-[320px] w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-6 mr-6 hidden lg:block sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center mr-4 shadow-sm">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">IT Department</h2>
            <p className="text-xs text-gray-500 font-medium">Management Portal</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-sky-50 rounded-lg p-3 border border-sky-100">
            <div className="flex items-center">
              <Ticket className="h-4 w-4 text-sky-600 mr-2" />
              <span className="text-xs font-medium text-sky-700">Tickets</span>
            </div>
            <p className="text-lg font-bold text-sky-900 mt-1">Active</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-purple-600 mr-2" />
              <span className="text-xs font-medium text-purple-700">Security</span>
            </div>
            <p className="text-lg font-bold text-purple-900 mt-1">Protected</p>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">
          Management
        </h3>
        <div className="space-y-2">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => handleModuleClick(module.id)}
              className={`group w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeModule === module.id
                  ? "bg-gradient-to-r from-sky-50 to-sky-100 text-sky-700 border border-sky-200 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
              }`}
            >
              <module.icon className={`h-5 w-5 mr-3 transition-colors ${
                activeModule === module.id 
                  ? "text-sky-600" 
                  : "text-gray-500 group-hover:text-gray-700"
              }`} />
              <div className="flex-1 text-left">
                <div className="font-medium">{module.name}</div>
                <div className={`text-xs ${
                  activeModule === module.id ? "text-sky-600" : "text-gray-400"
                }`}>
                  {module.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="mb-8 p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-100">
        <div className="flex items-start">
          <HelpCircle className="h-4 w-4 text-sky-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-sky-900 mb-1">IT Support</h4>
            <p className="text-xs text-sky-700 mb-3 leading-relaxed">
              Need technical assistance? Contact the IT support team
            </p>
            <button className="text-xs bg-sky-600 text-white px-3 py-1.5 rounded-md hover:bg-sky-700 transition-colors shadow-sm font-medium">
              Get Support
            </button>
          </div>
        </div>
      </div>

      {/* User Info & Sign Out */}
      <div className="pt-6 border-t border-gray-200">
        {user && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center mr-3">
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
        
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-sm"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </nav>
  );
}
