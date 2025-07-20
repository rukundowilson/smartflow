"use client"
import React, { useState } from 'react';
import { 
  Users, 
  Ticket, 
  Key, 
  UserMinus, 
  Package, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Monitor,
  Settings,
  Bell,
  LogOut
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [activeModule, setActiveModule] = useState('overview');
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Sample data
  const tickets = [
    { id: 'T001', title: 'Computer won\'t start', employee: 'John Smith', priority: 'High', status: 'Open', created: '2025-07-19' },
    { id: 'T002', title: 'Email sync issues', employee: 'Sarah Johnson', priority: 'Medium', status: 'In Progress', created: '2025-07-18' },
    { id: 'T003', title: 'Software installation request', employee: 'Mike Davis', priority: 'Low', status: 'Resolved', created: '2025-07-17' },
  ];

  const accessRequests = [
    { id: 'AR001', employee: 'Alice Brown', requestedBy: 'HR Team', systems: ['CRM', 'Payroll'], status: 'Pending', created: '2025-07-19' },
    { id: 'AR002', employee: 'Bob Wilson', requestedBy: 'IT Manager', systems: ['Admin Panel'], status: 'Approved', created: '2025-07-18' },
  ];

  const revocationRequests = [
    { id: 'RV001', employee: 'Tom Anderson', reason: 'Termination', systems: ['All Access'], status: 'Pending', created: '2025-07-19' },
    { id: 'RV002', employee: 'Lisa Garcia', reason: 'Role Change', systems: ['Finance System'], status: 'Completed', created: '2025-07-18' },
  ];

  const itemRequests = [
    { id: 'IR001', employee: 'David Lee', item: 'MacBook Pro 16"', quantity: 1, status: 'Approved', created: '2025-07-19' },
    { id: 'IR002', employee: 'Emma White', item: 'USB-C Cables', quantity: 3, status: 'Pending', created: '2025-07-18' },
  ];

  const users = [
    { id: 'U001', name: 'John Smith', email: 'john@company.com', role: 'Employee', status: 'Active', lastLogin: '2025-07-19' },
    { id: 'U002', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'HR', status: 'Active', lastLogin: '2025-07-19' },
    { id: 'U003', name: 'Mike Davis', email: 'mike@company.com', role: 'IT Staff', status: 'Active', lastLogin: '2025-07-18' },
  ];

  interface StatusColorMap {
    [key: string]: string;
  }

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'in progress': return 'text-blue-600 bg-blue-50';
      case 'resolved':
      case 'approved':
      case 'completed': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  interface PriorityColorMap {
    [key: string]: string;
  }

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color?: string;
  }

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color = 'text-blue-600' }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );

  interface TableHeaderProps {
    columns: string[];
    onSelectAll?: React.ChangeEventHandler<HTMLInputElement>;
    selectedCount: number;
    totalCount: number;
  }

  const TableHeader: React.FC<TableHeaderProps> = ({ columns, onSelectAll, selectedCount, totalCount }) => (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left">
          <input 
            type="checkbox" 
            onChange={onSelectAll}
            checked={selectedCount === totalCount}
            className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
          />
        </th>
        {columns.map((col, idx) => (
          <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {col}
          </th>
        ))}
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );

  interface ActionButtonProps {
    icon: React.ElementType;
    label: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    variant?: 'primary' | 'secondary' | 'danger';
  }

  const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, onClick, variant = 'primary' }) => {
    const baseClasses = "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = {
      primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
      secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-sky-500",
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
        <StatCard title="Open Tickets" value="12" icon={Ticket} color="text-red-600" />
        <StatCard title="Pending Access Requests" value="5" icon={Key} color="text-yellow-600" />
        <StatCard title="Active Users" value="248" icon={Users} color="text-green-600" />
        <StatCard title="Pending Item Requests" value="8" icon={Package} color="text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Recent Tickets</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {tickets.slice(0, 3).map(ticket => (
              <div key={ticket.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ticket.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{ticket.employee}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">System Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                <span className="text-gray-600">New user registration approved</span>
                <span className="text-gray-400 ml-auto">2 min ago</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span className="text-gray-600">IT access granted to John Doe</span>
                <span className="text-gray-400 ml-auto">15 min ago</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                <span className="text-gray-600">High priority ticket created</span>
                <span className="text-gray-400 ml-auto">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTickets = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">IT Tickets</h2>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <ActionButton icon={Filter} label="Filter" variant="secondary" />
          <ActionButton icon={Plus} label="New Ticket" />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader 
              columns={['Ticket ID', 'Title', 'Employee', 'Priority', 'Status', 'Created']}
              selectedCount={selectedTickets.length}
              totalCount={tickets.length}
            />
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ticket.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ticket.employee}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ticket.created}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="text-sky-600 hover:text-sky-900">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Edit className="h-4 w-4" />
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

  const renderAccessRequests = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Access Requests</h2>
        <ActionButton icon={Plus} label="New Request" />
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader 
              columns={['Request ID', 'Employee', 'Requested By', 'Systems', 'Status', 'Created']}
              selectedCount={0}
              totalCount={accessRequests.length}
            />
            <tbody className="bg-white divide-y divide-gray-200">
              {accessRequests.map(request => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{request.employee}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{request.requestedBy}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{request.systems.join(', ')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{request.created}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {request.status === 'Pending' && (
                      <>
                        <button className="text-green-600 hover:text-green-900">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button className="text-sky-600 hover:text-sky-900">
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

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex space-x-3">
          <ActionButton icon={Plus} label="Add HR User" />
          <ActionButton icon={Users} label="Bulk Actions" variant="secondary" />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader 
              columns={['Name', 'Email', 'Role', 'Status', 'Last Login']}
              selectedCount={selectedUsers.length}
              totalCount={users.length}
            />
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'Super Admin' ? 'text-purple-600 bg-purple-50' :
                      user.role === 'HR' ? 'text-blue-600 bg-blue-50' :
                      user.role === 'IT Staff' ? 'text-green-600 bg-green-50' :
                      'text-gray-600 bg-gray-50'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.lastLogin}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="text-sky-600 hover:text-sky-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
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
    { id: 'tickets', name: 'IT Tickets', icon: Ticket },
    { id: 'access-requests', name: 'Access Requests', icon: Key },
    { id: 'revocation', name: 'Access Revocation', icon: UserMinus },
    { id: 'requisition', name: 'Item Requisition', icon: Package },
    { id: 'users', name: 'User Management', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#F0F8F8]"> {/* Duck egg background */}
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-sky-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">IT Management System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 bg-red-400 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Super Admin</p>
                  <p className="text-xs text-gray-500">admin@company.com</p>
                </div>
                <div className="h-8 w-8 bg-sky-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">SA</span>
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
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {activeModule === 'overview' && renderOverview()}
            {activeModule === 'tickets' && renderTickets()}
            {activeModule === 'access-requests' && renderAccessRequests()}
            {activeModule === 'users' && renderUserManagement()}
            {activeModule === 'revocation' && (
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 text-center">
                <UserMinus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Access Revocation</h3>
                <p className="text-gray-500">Manage access revocation requests and security compliance.</p>
              </div>
            )}
            {activeModule === 'requisition' && (
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Item Requisition</h3>
                <p className="text-gray-500">Track and manage IT equipment and asset requests.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;