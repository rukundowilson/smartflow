"use client"
import React, { useState } from 'react';
import { 
  Ticket, 
  Package, 
  Plus, 
  Search, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Monitor,
  Bell,
  LogOut,
  User,
  Calendar,
  MessageSquare,
  Laptop,
  Printer,
  Cable
} from 'lucide-react';

const EmployeeDashboard = () => {
  const [activeModule, setActiveModule] = useState('overview');

  // Sample data for employee view
  const myTickets = [
    { id: 'T001', title: 'Computer won\'t start', priority: 'High', status: 'In Progress', created: '2025-07-19', assignedTo: 'Mike Davis' },
    { id: 'T005', title: 'Printer connection issues', priority: 'Medium', status: 'Open', created: '2025-07-18', assignedTo: 'Unassigned' },
    { id: 'T008', title: 'Software license expired', priority: 'Low', status: 'Resolved', created: '2025-07-15', assignedTo: 'Sarah Tech' },
  ];

  const myRequests = [
    { id: 'IR001', item: 'MacBook Pro 16"', quantity: 1, status: 'Approved', created: '2025-07-19', estimatedDelivery: '2025-07-22' },
    { id: 'IR004', item: 'USB-C Hub', quantity: 1, status: 'Pending', created: '2025-07-18', estimatedDelivery: 'TBD' },
    { id: 'IR003', item: 'Monitor Stand', quantity: 1, status: 'Delivered', created: '2025-07-15', estimatedDelivery: '2025-07-20' },
  ];

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'in progress': return 'text-blue-600 bg-blue-50';
      case 'resolved':
      case 'approved':
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

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
    variant?: 'primary' | 'secondary';
  }

  const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, onClick, variant = 'primary' }) => {
    const baseClasses = "inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = {
      primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
      secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-sky-500"
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-6 border border-sky-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome back, John!</h2>
        <p className="text-gray-600">Here's what's happening with your IT requests and tickets.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Tickets" value="2" icon={Ticket} color="text-orange-600" subtitle="1 high priority" />
        <StatCard title="Pending Requests" value="1" icon={Package} color="text-yellow-600" subtitle="USB-C Hub" />
        <StatCard title="Resolved This Month" value="5" icon={CheckCircle} color="text-green-600" subtitle="Great progress!" />
        <StatCard title="Items Delivered" value="3" icon={Laptop} color="text-blue-600" subtitle="This quarter" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900">Report IT Issue</h4>
                <p className="text-sm text-gray-500">Get help with technical problems</p>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900">Request IT Equipment</h4>
                <p className="text-sm text-gray-500">Order laptops, accessories, software</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Recent Tickets</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {myTickets.slice(0, 3).map(ticket => (
              <div key={ticket.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ticket.title}</p>
                    <p className="text-xs text-gray-500 mt-1">Assigned to: {ticket.assignedTo}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-gray-100">
            <button className="text-sky-600 hover:text-sky-700 text-sm font-medium">View all tickets →</button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Recent Requests</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {myRequests.slice(0, 3).map(request => (
              <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.item}</p>
                    <p className="text-xs text-gray-500 mt-1">Est. delivery: {request.estimatedDelivery}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-gray-100">
            <button className="text-sky-600 hover:text-sky-700 text-sm font-medium">View all requests →</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMyTickets = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My IT Tickets</h2>
        <ActionButton icon={Plus} label="Report New Issue" />
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ticket.title}</td>
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
                  <td className="px-6 py-4 text-sm text-gray-900">{ticket.assignedTo}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ticket.created}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="text-sky-600 hover:text-sky-900" title="View Details">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900" title="Add Comment">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Ticket Form Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Report Issue</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500">
              <option>Hardware Problem</option>
              <option>Software Issue</option>
              <option>Network/Internet</option>
              <option>Email Problem</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea 
            rows={3} 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500"
            placeholder="Please describe your issue in detail..."
          ></textarea>
        </div>
        <ActionButton icon={Plus} label="Submit Ticket" />
      </div>
    </div>
  );

  const renderMyRequests = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Equipment Requests</h2>
        <ActionButton icon={Plus} label="Request Equipment" />
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Delivery</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myRequests.map(request => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{request.item}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{request.quantity}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{request.estimatedDelivery}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{request.created}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sky-600 hover:text-sky-900" title="View Details">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Request New Equipment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Equipment Categories */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-sky-300 transition-colors cursor-pointer">
            <div className="text-center">
              <Laptop className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Computers</h4>
              <p className="text-sm text-gray-500">Laptops, Desktops, Tablets</p>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:border-sky-300 transition-colors cursor-pointer">
            <div className="text-center">
              <Printer className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Peripherals</h4>
              <p className="text-sm text-gray-500">Monitors, Keyboards, Mice</p>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:border-sky-300 transition-colors cursor-pointer">
            <div className="text-center">
              <Cable className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Accessories</h4>
              <p className="text-sm text-gray-500">Cables, Adapters, Stands</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Category</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500">
              <option>Select category...</option>
              <option>Laptop</option>
              <option>Desktop Computer</option>
              <option>Monitor</option>
              <option>Keyboard & Mouse</option>
              <option>Cables & Adapters</option>
              <option>Software License</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input 
              type="number" 
              min="1" 
              max="10" 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500"
              defaultValue="1"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Justification</label>
          <textarea 
            rows={3} 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500"
            placeholder="Please explain why you need this equipment..."
          ></textarea>
        </div>
        <ActionButton icon={Plus} label="Submit Request" />
      </div>
    </div>
  );

  const modules = [
    { id: 'overview', name: 'Dashboard', icon: Monitor },
    { id: 'tickets', name: 'My Tickets', icon: Ticket },
    { id: 'requests', name: 'My Requests', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-[#F0F8F8]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Monitor className="h-8 w-8 text-sky-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">smartflow</h1>
              <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Employee Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 bg-red-400 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">John Smith</p>
                  <p className="text-xs text-gray-500">Employee</p>
                </div>
                <div className="h-8 w-8 bg-sky-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JS</span>
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
            
            {/* Help Section */}
            <div className="mt-8 p-4 bg-sky-50 rounded-lg border border-sky-100">
              <h4 className="text-sm font-medium text-sky-900 mb-2">Need Help?</h4>
              <p className="text-xs text-sky-700 mb-3">Contact IT support for assistance</p>
              <button className="text-xs bg-sky-600 text-white px-3 py-1 rounded-md hover:bg-sky-700 transition-colors">
                Contact Support
              </button>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {activeModule === 'overview' && renderOverview()}
            {activeModule === 'tickets' && renderMyTickets()}
            {activeModule === 'requests' && renderMyRequests()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;