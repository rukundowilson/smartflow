"use client"
import React, { useState, useEffect } from 'react';
import { Shield, Bell, LogOut, Menu, X, Monitor, UserPlus, Key, Users, UserCheck, UserMinus } from 'lucide-react';
import { useAuth } from "@/app/contexts/auth-context";
import { usePathname, useRouter } from 'next/navigation';

interface HRNavbarProps {
  title?: string;
  subtitle?: string;
}

const HRNavbar: React.FC<HRNavbarProps> = ({ 
  title = "smartflow", 
  subtitle = "Human Resources Portal" 
}) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const modules = [
    { id: 'overview', name: 'Overview', icon: Monitor },
    { id: 'registrations', name: 'Employee Registrations', icon: UserPlus },
    { id: 'access-management', name: 'Access Management', icon: Key },
    { id: 'directory', name: 'Employee Directory', icon: Users },
  ];

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
              <Shield className="h-8 w-8 text-sky-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <p className="text-xs text-gray-500">{subtitle}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 bg-red-400 rounded-full"></span>
              </button>
              
              {/* User Info - Medium Screens and Above */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.department || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'user@company.com'}</p>
                </div>
                <div className="h-8 w-8 bg-sky-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <LogOut onClick={logout} className="h-5 w-5" />
                </button>
              </div>
              
              {/* Hamburger Menu Button - Small Screens Only */}
              <button 
                onClick={toggleMobileMenu}
                className="sm:hidden text-gray-400 hover:text-gray-600"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Menu - Small Screens Only */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 bg-white">
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
                
                {/* Quick Actions */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <UserCheck className="h-4 w-4 mr-3" />
                      Approve Registration
                    </button>
                    <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <Key className="h-4 w-4 mr-3" />
                      Request Access
                    </button>
                    <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                      <UserMinus className="h-4 w-4 mr-3" />
                      Revoke Access
                    </button>
                  </div>
                </div>
                
                {/* User Info and Logout - Small Screens */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-sky-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.department || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.email || 'user@company.com'}</p>
                      </div>
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
};

export default HRNavbar; 