"use client"
import React, { useState } from 'react';
import { 
  Users, 
  UserPlus,
  UserCheck,
  UserX,
  Key, 
  UserMinus, 
  Search, 
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Monitor,
  Bell,
  LogOut,
  FileText,
  Shield,
  Calendar
} from 'lucide-react';

const HRDashboard = () => {
  const [activeModule, setActiveModule] = useState('overview');
  const [selectedRequests, setSelectedRequests] = useState([]);

  // Sample data relevant to HR
  const employeeRegistrations = [
    { id: 'ER001', name: 'Alice Johnson', email: 'alice.johnson@personal.com', department: 'Marketing', position: 'Marketing Specialist', status: 'Pending', applied: '2025-07-19', expiresIn: '18h' },
    { id: 'ER002', name: 'Robert Chen', email: 'robert.chen@gmail.com', department: 'Finance', position: 'Financial Analyst', status: 'Pending', applied: '2025-07-18', expiresIn: '42h' },
    { id: 'ER003', name: 'Maria Rodriguez', email: 'maria.r@outlook.com', department: 'IT', position: 'Software Developer', status: 'Approved', applied: '2025-07-17', expiresIn: 'Processed' },
  ];

  const accessRequests = [
    { id: 'AR001', employee: 'John Smith', department: 'Sales', requestedSystems: ['CRM', 'Sales Portal'], reason: 'New hire onboarding', status: 'Pending', created: '2025-07-19' },
    { id: 'AR002', employee: 'Lisa Wang', department: 'Finance', requestedSystems: ['Payroll System', 'Finance Dashboard'], reason: 'Role promotion', status: 'Submitted', created: '2025-07-18' },
    { id: 'AR003', employee: 'Tom Wilson', department: 'HR', requestedSystems: ['HR Management'], reason: 'Department transfer', status: 'Approved', created: '2025-07-17' },
  ];

  const revocationRequests = [
    { id: 'RV001', employee: 'Sarah Mitchell', department: 'Marketing', reason: 'Termination', lastWorkingDay: '2025-07-25', systems: ['All Systems'], status: 'Pending', created: '2025-07-19' },
    { id: 'RV002', employee: 'David Kumar', department: 'IT', reason: 'Role Change', lastWorkingDay: 'N/A', systems: ['Admin Panel', 'Server Access'], status: 'In Progress', created: '2025-07-18' },
  ];

  const employees = [
    { id: 'E001', name: 'John Smith', email: 'john.smith@company.com', department: 'Sales', position: 'Sales Manager', status: 'Active', startDate: '2023-03-15', systemAccess: 'CRM, Sales Portal' },
    { id: 'E002', name: 'Lisa Wang', email: 'lisa.wang@company.com', department: 'Finance', position: 'Senior Analyst', status: 'Active', startDate: '2022-08-20', systemAccess: 'Payroll, Finance Dashboard' },
    { id: 'E003', name: 'Tom Wilson', email: 'tom.wilson@company.com', department: 'HR', position: 'HR Specialist', status: 'Active', startDate: '2024-01-10', systemAccess: 'HR Management' },
  ];

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'submitted': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'in progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyColor = (expiresIn: string): string => {
    if (expiresIn.includes('h')) {
      const hours = parseInt(expiresIn);
      if (hours < 24) return 'text-red-600 bg-red-50';
      if (hours < 48) return 'text-orange-600 bg-orange-50';
    }
    return 'text-green-600 bg-green-50';
  };

  interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color?: string;
    subtitle?: string;
  }

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color = 'text-blue-600', subtitle }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );

  interface ActionButtonProps {
    icon: React.ElementType;
    label: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    variant?: 'primary' | 'secondary' | 'success' | 'danger';
  }

  const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, onClick, variant = 'primary' }) => {
    const baseClasses = "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = {
      primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
      secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-sky-500",
      success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
    };
    
    return (
      <button onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
        <Icon className="h-4 w-4 mr-2" />
        {label}
      </button>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pending Registrations" value="2" icon={UserPlus} color="text-orange-600" subtitle="Expire in <24h" />
        <StatCard title="Access Requests" value="3" icon={Key} color="text-blue-600" subtitle="Awaiting approval" />
        <StatCard title="Active Employees" value="248" icon={Users} color="text-green-600" subtitle="System users" />
        <StatCard title="Revocation Requests" value="2" icon={UserMinus} color="text-red-600" subtitle="Security priority" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Urgent Employee Registrations</h3>
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">Time Sensitive</span>
          </div>
          <div className="divide-y divide-gray-100">
            {employeeRegistrations.filter(reg => reg.status === 'Pending').slice(0, 3).map(registration => (
              <div key={registration.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{registration.name}</p>
                    <p className="text-xs text-gray-500">{registration.position} • {registration.department}</p>
                    <p className="text-xs text-gray-500 mt-1">{registration.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getUrgencyColor(registration.expiresIn)}`}>
                      {registration.expiresIn}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">Applied {registration.applied}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Recent HR Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                <span className="text-gray-600">Employee registration approved</span>
                <span className="text-gray-400 ml-auto">5 min ago</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span className="text-gray-600">Access request submitted to IT</span>
                <span className="text-gray-400 ml-auto">20 min ago</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                <span className="text-gray-600">Access revocation initiated</span>
                <span className="text-gray-400 ml-auto">1 hour ago</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                <span className="text-gray-600">New registration application received</span>
                <span className="text-gray-400 ml-auto">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmployeeRegistrations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Registrations</h2>
          <p className="text-sm text-gray-500 mt-1">Review and approve new employee system access requests</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search registrations..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <ActionButton icon={Filter} label="Filter" variant="secondary" />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  />
                </th>
                {['Registration ID', 'Name', 'Email', 'Department', 'Position', 'Status', 'Applied', 'Expires In'].map((col, idx) => (
                  <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employeeRegistrations.map(registration => (
                <tr key={registration.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{registration.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{registration.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{registration.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{registration.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{registration.position}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(registration.status)}`}>
                      {registration.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{registration.applied}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getUrgencyColor(registration.expiresIn)}`}>
                      {registration.expiresIn}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {registration.status === 'Pending' && (
                      <>
                        <button className="text-green-600 hover:text-green-900 p-1" title="Approve">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-1" title="Reject">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button className="text-sky-600 hover:text-sky-900 p-1" title="View Details">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAccessManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Access Management</h2>
          <p className="text-sm text-gray-500 mt-1">Request and track system access for employees</p>
        </div>
        <ActionButton icon={Key} label="Request Access" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access Requests */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Active Access Requests</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {accessRequests.map(request => (
              <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.employee}</p>
                    <p className="text-xs text-gray-500">{request.department} • {request.reason}</p>
                    <p className="text-xs text-blue-600 mt-1">{request.requestedSystems.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{request.created}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revocation Requests */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Access Revocation Requests</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {revocationRequests.map(request => (
              <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.employee}</p>
                    <p className="text-xs text-gray-500">{request.department} • {request.reason}</p>
                    <p className="text-xs text-red-600 mt-1">Last Day: {request.lastWorkingDay}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{request.created}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmployeeDirectory = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Directory</h2>
          <p className="text-sm text-gray-500 mt-1">View and manage employee information and system access</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <ActionButton icon={Filter} label="Filter" variant="secondary" />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  />
                </th>
                {['Name', 'Email', 'Department', 'Position', 'Start Date', 'System Access', 'Status'].map((col, idx) => (
                  <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map(employee => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{employee.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{employee.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{employee.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{employee.position}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{employee.startDate}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{employee.systemAccess}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(employee.status)}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="text-sky-600 hover:text-sky-900 p-1" title="Request Access">
                      <Key className="h-4 w-4" />
                    </button>
                    <button className="text-orange-600 hover:text-orange-900 p-1" title="Revoke Access">
                      <UserMinus className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 p-1" title="View Details">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const modules = [
    { id: 'overview', name: 'Overview', icon: Monitor },
    { id: 'registrations', name: 'Employee Registrations', icon: UserPlus },
    { id: 'access-management', name: 'Access Management', icon: Key },
    { id: 'directory', name: 'Employee Directory', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#F0F8F8]"> {/* Duck egg background */}
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-sky-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">smartflow</h1>
                <p className="text-xs text-gray-500">Human Resources Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 bg-red-400 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">HR Manager</p>
                  <p className="text-xs text-gray-500">hr.manager@company.com</p>
                </div>
                <div className="h-8 w-8 bg-sky-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">HR</span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar */}
          <nav className="w-64 bg-white rounded-lg shadow-sm border border-gray-100 p-4 mr-6">
            <div className="space-y-1">
              {modules.map(module => (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeModule === module.id
                      ? 'bg-sky-100 text-sky-700 border-r-2 border-sky-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <module.icon className="h-4 w-4 mr-3" />
                  {module.name}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Approve Registration
                </button>
                <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  <Key className="h-4 w-4 mr-2" />
                  Request Access
                </button>
                <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  <UserMinus className="h-4 w-4 mr-2" />
                  Revoke Access
                </button>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {activeModule === 'overview' && renderOverview()}
            {activeModule === 'registrations' && renderEmployeeRegistrations()}
            {activeModule === 'access-management' && renderAccessManagement()}
            {activeModule === 'directory' && renderEmployeeDirectory()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;