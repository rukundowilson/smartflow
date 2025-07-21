"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { 
  Ticket, 
  Key, 
  Monitor,
} from 'lucide-react';

function SideBar() {
     const pathname = usePathname(); 
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('overview');

  const modules = [
    { id: 'overview', name: 'Overview', icon: Monitor },
    { id: 'my-tickets', name: 'IT Tickets', icon: Ticket },
    { id: 'my-requests', name: 'my Requests', icon: Key },
  ];

  // Set active module from URL on mount
 useEffect(() => {
  const path = pathname.split('/').pop(); // get the last segment
  if (path) setActiveModule(path);
}, [pathname]);


const handleModuleClick = (id: string) => {
  const newPath = `/departments/others/${id}`;
  if (pathname !== newPath) {
    setActiveModule(id);
    router.push(newPath);
  }
};


  return (
    <nav className="w-64 bg-white rounded-lg shadow-sm border border-gray-100 p-4 mr-6 min-h-200">
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
       {/* Help Section */}
            <div className="mt-8 p-4 bg-sky-50 rounded-lg border border-sky-100">
              <h4 className="text-sm font-medium text-sky-900 mb-2">Need Help?</h4>
              <p className="text-xs text-sky-700 mb-3">Contact IT support for assistance</p>
              <button className="text-xs bg-sky-600 text-white px-3 py-1 rounded-md hover:bg-sky-700 transition-colors">
                Contact Support
              </button>
            </div>
    </nav>
  );
}

export default SideBar;
