"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { 
  Ticket, 
  Key, 
  Monitor,
  HelpCircle
} from 'lucide-react';

function SideBar() {
  const pathname = usePathname(); 
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const modules = [
    { id: 'overview', name: 'Overview', icon: Monitor },
    { id: 'my-tickets', name: 'IT Tickets', icon: Ticket },
    { id: 'my-requests', name: 'My Requests', icon: Key },
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
      setIsMobileMenuOpen(false); // Close mobile menu after navigation
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const toggle = document.getElementById('mobile-menu-toggle');
      
      if (isMobileMenuOpen && sidebar && toggle && 
          !sidebar.contains(event.target as Node) && 
          !toggle.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const SidebarContent = () => (
    <>
      <div className="space-y-1">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => handleModuleClick(module.id)}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
              activeModule === module.id
                ? "bg-sky-100 text-sky-700 shadow-sm"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <module.icon className={`h-4 w-4 mr-3 transition-colors ${
              activeModule === module.id 
                ? "text-sky-600" 
                : "text-gray-500 group-hover:text-gray-700"
            }`} />
            {module.name}
          </button>
        ))}
      </div>

      {/* Help Section */}
      <div className="mt-8 p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg border border-sky-100">
        <div className="flex items-start">
          <HelpCircle className="h-4 w-4 text-sky-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-sky-900 mb-1">Need Help?</h4>
            <p className="text-xs text-sky-700 mb-3 leading-relaxed">
              Contact IT support for assistance with your requests
            </p>
            <button className="text-xs bg-sky-600 text-white px-3 py-1.5 rounded-md hover:bg-sky-700 transition-colors shadow-sm font-medium">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden lg:block w-64 bg-white rounded-lg shadow-sm border border-gray-100 p-6 mr-6 sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <SidebarContent />
      </nav>
    </>
  );
}

export default SideBar;