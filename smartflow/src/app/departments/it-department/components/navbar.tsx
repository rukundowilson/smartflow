"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  Ticket,
  Key,
  UserMinus,
  Package,
  Monitor,
  Shield,
  Building2,
  ChevronDown,
  User,
} from 'lucide-react';
import { useAuth } from "@/app/contexts/auth-context";
import userRoleService from "@/app/services/userRoleService";
import NotificationBell from "@/app/components/NotificationBell";

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
  const [userRoleInfo, setUserRoleInfo] = useState<any>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const { user, token, isAuthenticated, logout } = useAuth();

  // Fetch user role information
  useEffect(() => {
    const fetchUserRoleInfo = async () => {
      if (user?.id) {
        const roleInfo = await userRoleService.getUserRoleInfo(user.id);
        setUserRoleInfo(roleInfo);
      }
    };

    fetchUserRoleInfo();
  }, [user]);

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
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('user-dropdown');
      const toggle = document.getElementById('user-dropdown-toggle');
      
      if (isUserDropdownOpen && dropdown && toggle && 
          !dropdown.contains(event.target as Node) && 
          !toggle.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDropdownOpen]);

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
              <NotificationBell />
              
              {/* User Dropdown */}
              <div className="relative">
                <button
                  id="user-dropdown-toggle"
                  onClick={toggleUserDropdown}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className="h-8 w-8 bg-sky-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div
                    id="user-dropdown"
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-sky-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-medium">
                            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{user?.full_name}</h3>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Role and Department Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-sky-600" />
                          <div>
                            <p className="text-xs text-gray-500">Role</p>
                            <p className="text-sm font-medium text-gray-900">
                              {userRoleInfo?.role_name || 'User'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Department</p>
                            <p className="text-sm font-medium text-gray-900">
                              {userRoleInfo?.department_name || user?.department || 'Department'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="py-1">
                      <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <User className="h-4 w-4 mr-3 text-gray-400" />
                        Profile Settings
                      </button>
                      <button 
                        onClick={logout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="lg:hidden flex items-center space-x-4">
              <NotificationBell />
              <div className="h-8 w-8 bg-sky-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </span>
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
                      <div className="flex items-center gap-1 mb-1">
                        <Shield className="h-3 w-3 text-sky-600" />
                        <p className="text-sm font-medium text-gray-900">
                          {userRoleInfo?.role_name || 'User'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">{user?.department || 'Department'}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
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