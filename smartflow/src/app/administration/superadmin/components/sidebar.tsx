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
} from 'lucide-react';

const modules = [
  { id: 'overview', name: 'Overview', icon: Monitor },
  { id: 'tickets', name: 'IT Tickets', icon: Ticket },
  { id: 'access-requests', name: 'Access Requests', icon: Key },
  { id: 'revocation', name: 'Access Revocation', icon: UserMinus },
  { id: 'requisition', name: 'Item Requisition', icon: Package },
  { id: 'users', name: 'User Management', icon: Users },
];

interface SideBarProps {
  className?: string;
}

function SideBar({ className = "" }: SideBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('overview');

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
    <nav className={`w-64 bg-white h-200 rounded-lg shadow-sm border border-gray-100 p-4 mr-6 min-h-[200px] hidden lg:block ${className}`}>
      <div className="space-y-1">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => handleModuleClick(module.id)}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeModule === module.id
                ? "bg-sky-100 text-sky-700 border-r-2 border-sky-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <module.icon className="h-4 w-4 mr-3" />
            {module.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default SideBar;