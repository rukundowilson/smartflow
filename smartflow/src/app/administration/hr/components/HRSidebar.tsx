"use client"
import React from 'react';
import { 
  Monitor, 
  UserPlus, 
  Key, 
  Users, 
  UserCheck, 
  UserMinus
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HRSidebarProps {
  className?: string;
}

const HRSidebar: React.FC<HRSidebarProps> = ({ className = "" }) => {
  const pathname = usePathname();

  const modules = [
    { id: 'overview', name: 'Overview', icon: Monitor, href: '/administration/hr' },
    { id: 'registrations', name: 'Employee Registrations', icon: UserPlus, href: '/administration/hr/registrations' },
    { id: 'access-management', name: 'Access Management', icon: Key, href: '/administration/hr/access-management' },
    { id: 'directory', name: 'Employee Directory', icon: Users, href: '/administration/hr/directory' },
  ];

  const quickActions = [
    { id: 'approve', name: 'Approve Registration', icon: UserCheck, href: '/administration/hr/registrations' },
    { id: 'request', name: 'Request Access', icon: Key, href: '/administration/hr/access-management' },
    { id: 'revoke', name: 'Revoke Access', icon: UserMinus, href: '/administration/hr/access-management' },
  ];

  return (
    <nav className={`hidden lg:block w-72 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 ${className}`}>
      {/* Logo/Brand Section */}
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

      {/* Main Navigation */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
          Navigation
        </h3>
        <div className="space-y-2">
          {modules.map(module => {
            const isActive = pathname === module.href;
            return (
              <Link
                key={module.id}
                href={module.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-50 to-sky-100 text-sky-700 border border-sky-200 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                <module.icon className={`h-4 w-4 mr-3 transition-colors ${
                  isActive ? 'text-sky-600' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                {module.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
          Quick Actions
        </h3>
        <div className="space-y-2">
          {quickActions.map(action => (
            <Link
              key={action.id}
              href={action.href}
              className="group flex items-center px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200"
            >
              <action.icon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
              {action.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="px-3">
          <p className="text-xs text-gray-400 text-center">
            HR Portal v1.0
          </p>
        </div>
      </div>
    </nav>
  );
};

export default HRSidebar; 