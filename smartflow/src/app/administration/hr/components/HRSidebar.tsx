"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Monitor,
  UserPlus,
  Key,
  Users,
  LogOut,
} from 'lucide-react';
import { useAuth } from "@/app/contexts/auth-context";

const modules = [
  { id: 'overview', name: 'Overview', icon: Monitor },
  { id: 'registrations', name: 'Employee Registrations', icon: UserPlus },
  { id: 'access-management', name: 'Access Management', icon: Key },
  { id: 'directory', name: 'Employee Directory', icon: Users },
];

export default function HRSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('overview');

  const { logout } = useAuth();

  // Set active module from URL on mount
  useEffect(() => {
    const path = pathname.split('/').pop();
    if (path && modules.some(module => module.id === path)) {
      setActiveModule(path);
    } else if (pathname === '/administration/hr') {
      setActiveModule('overview');
    }
  }, [pathname, modules]);

  const handleModuleClick = (id: string) => {
    const newPath = `/administration/hr${id === 'overview' ? '' : `/${id}`}`;
    if (pathname !== newPath) {
      setActiveModule(id);
      router.push(newPath);
    }
  };

  return (
    <nav className="w-72 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hidden lg:block">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center mr-3 shadow-sm">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">HR Portal</h2>
            <p className="text-xs text-gray-500 font-medium">Human Resources</p>
          </div>
        </div>
      </div>

      {/* Navigation Modules */}
      <div className="space-y-2">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => handleModuleClick(module.id)}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeModule === module.id
                ? "bg-sky-100 text-sky-700 border border-sky-200"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <module.icon className="h-5 w-5 mr-3" />
            {module.name}
          </button>
        ))}
      </div>

      {/* Sign Out */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </nav>
  );
} 