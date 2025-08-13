"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Monitor,
  UserPlus,
  Key,
  Users,
  Shield,
  Building2,
  ChevronDown,
  User,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from "@/app/contexts/auth-context";
import LineManagerSidebar from "./LineManagerSidebar";
import NotificationBell from '@/app/components/NotificationBell';
import systemAccessRequestService from "@/app/services/systemAccessRequestService";

interface HRNavbarProps {
  title?: string;
  subtitle?: string;
}

const LineManagerNavBar: React.FC<HRNavbarProps> = ({ 
  title = "smartflow", 
  subtitle = "Line manager" 
}) => {
  const { user, logout, selectedRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [counts, setCounts] = useState({
    pending: 0,
    reviewed: 0
  });

  const modules = [
  { id: 'overview', name: 'Overview', icon: Monitor, description: 'Line Manager Dashboard' },
  { id: 'approvals', name: 'Pending Approvals', icon: Clock, description: 'Review access requests' },
  { id: 'reviewed', name: 'Reviewed Requests', icon: CheckCircle, description: 'View reviewed requests' },
  { id: 'team', name: 'My Team', icon: Users, description: 'Manage team members' },
  { id: 'reports', name: 'Reports', icon: TrendingUp, description: 'Analytics & insights' },
];

  // Fetch counts for badges
  const fetchCounts = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch pending requests count
      const pendingResponse = await systemAccessRequestService.getPending({ approver_id: user.id, approver_role: 'Line Manager' });
      const pendingCount = pendingResponse.success ? (pendingResponse.requests || []).length : 0;
      
      // Fetch reviewed requests count
      const reviewedResponse = await systemAccessRequestService.getApprovedBy({ approver_id: user.id, approver_role: 'Line Manager' });
      const reviewedCount = reviewedResponse.success ? (reviewedResponse.requests || []).length : 0;
      
      setCounts({
        pending: pendingCount,
        reviewed: reviewedCount
      });
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  // Use selectedRole from auth context for role/department display

  // Set active module from URL on mount
  useEffect(() => {
    const path = pathname.split('/').pop();
    if (path && modules.some(module => module.id === path)) {
      setActiveModule(path);
    } else if (pathname === '/administration/office/linemanager') {
      setActiveModule('overview');
    }
  }, [pathname, modules]);

  // Fetch counts when user changes
  useEffect(() => {
    fetchCounts();
  }, [user]);

  // Refresh counts when pathname changes (user navigates)
  useEffect(() => {
    fetchCounts();
  }, [pathname]);

  const handleModuleClick = (id: string) => {
    const newPath = `/administration/office/linemanager${id === 'overview' ? '' : `/${id}`}`;
    if (pathname !== newPath) {
      setActiveModule(id);
      router.push(newPath);
      setIsMobileMenuOpen(false);
    }
  };

  // Get count for specific module
  const getModuleCount = (moduleId: string) => {
    switch (moduleId) {
      case 'approvals':
        return counts.pending;
      case 'reviewed':
        return counts.reviewed;
      default:
        return 0;
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

  const displayRole = selectedRole?.roleName || 'Line Manager';
  const displayDepartment = selectedRole?.departmentName || user?.department || 'Department';

  return (
    <>
      <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-sky-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <p className="text-xs text-gray-500">{displayDepartment} {subtitle}</p>
              </div>
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
                              {displayRole}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Department</p>
                            <p className="text-sm font-medium text-gray-900">
                              {displayDepartment}
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
                {modules.map((module) => {
                  const count = getModuleCount(module.id);
                  return (
                    <button
                      key={module.id}
                      onClick={() => handleModuleClick(module.id)}
                      className={`w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                        activeModule === module.id
                          ? "bg-sky-100 text-sky-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center">
                        <module.icon className="h-5 w-5 mr-3" />
                        {module.name}
                      </div>
                      {/* Badge for mobile menu */}
                      {count > 0 && (
                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                          activeModule === module.id 
                            ? 'bg-sky-200 text-sky-800' 
                            : module.id === 'approvals'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                        }`}>
                          {count > 99 ? '99+' : count}
                        </div>
                      )}
                    </button>
                  );
                })}
                
                {/* Mobile User Info and Logout */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Shield className="h-3 w-3 text-sky-600" />
                        <p className="text-sm font-medium text-gray-900">
                          {displayRole}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">{displayDepartment}</p>
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
};

export default LineManagerNavBar; 