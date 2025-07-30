"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Users,
  Ticket,
  Key,
  UserMinus,
  Package,
  Monitor,
} from 'lucide-react';
import { useAuth } from "@/app/contexts/auth-context";

const modules = [
    { id: 'overview', name: 'Overview', icon: Monitor },
    { id: 'tickets', name: 'IT Tickets', icon: Ticket },
    { id: 'access-requests', name: 'Access Requests', icon: Key },
    { id: 'revocation', name: 'Access Revocation', icon: UserMinus },
    { id: 'requisition', name: 'Item Requisition', icon: Package },
  ];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, token, isAuthenticated, logout } = useAuth();
  console.log(user)
  // Set active module from URL on mount
  useEffect(() => {
    const path = pathname.split('/').pop();
    if (path && modules.some(module => module.id === path)) {
      setActiveModule(path);
      console.log("got a user yeeh",user,token)
    }
  }, [pathname]);

  console.log("got a user yeeh",user,token)

  const handleModuleClick = (id: string) => {
    const newPath = `/departments/it-department/${id}`;
    if (pathname !== newPath) {
      setActiveModule(id);
      router.push(newPath);
      setIsMobileMenuOpen(false); // Close mobile menu after navigation
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-sky-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">smartflow</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 bg-red-400 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">IT staff</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="h-8 w-8 bg-sky-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">SA</span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <LogOut onClick={logout} className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="lg:hidden flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 bg-red-400 rounded-full"></span>
              </button>
              <div className="h-8 w-8 bg-sky-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">SA</span>
              </div>
              <button 
                onClick={toggleMobileMenu}
                className="text-gray-400 hover:text-gray-600"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="py-4 space-y-2">
                {modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => handleModuleClick(module.id)}
                    className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                      activeModule === module.id
                        ? "bg-sky-100 text-sky-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <module.icon className="h-5 w-5 mr-3" />
                    {module.name}
                  </button>
                ))}
                
                {/* Mobile User Info and Logout */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Super Admin</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <LogOut onClick={logout} className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}