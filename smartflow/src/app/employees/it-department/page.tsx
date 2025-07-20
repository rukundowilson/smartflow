"use client"
import React, { useState } from 'react';
import { 
  Users, 
  Ticket, 
  Key, 
  Package, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Monitor,
  Settings,
  Bell,
  LogOut,
  Wrench,
  Truck,
  MessageSquare,
  Calendar
} from 'lucide-react';

const ITStaffDashboard = () => {
  const [activeModule, setActiveModule] = useState('overview');
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [selectedRequests, setSelectedRequests] = useState([]);

  // Sample data for IT Staff view
  const myTickets = [
    { id: 'T001', title: 'Computer won\'t start', employee: 'John Smith', priority: 'High', status: 'Assigned to Me', created: '2025-07-19', assignedTo: 'me' },
    { id: 'T002', title: 'Email sync issues', employee: 'Sarah Johnson', priority: 'Medium', status: 'In Progress', created: '2025-07-18', assignedTo: 'me' },
    { id: 'T005', title: 'VPN connection problems', employee: 'Alex Brown', priority: 'High', status: 'Open', created: '2025-07-20', assignedTo: null },
    { id: 'T006', title: 'Printer not responding', employee: 'Lisa White', priority: 'Low', status: 'Open', created: '2025-07-19', assignedTo: null },
  ];

  const accessRequests = [
    { id: 'AR001', employee: 'Alice Brown', requestedBy: 'HR Team', systems: ['CRM', 'Payroll'], status: 'Pending IT Approval', created: '2025-07-19', urgency: 'Standard' },
    { id: 'AR003', employee: 'Chris Wilson', requestedBy: 'Sales Manager', systems: ['Sales Dashboard'], status: 'Pending IT Approval', created: '2025-07-20', urgency: 'High' },
    { id: 'AR004', employee: 'Maria Garcia', requestedBy: 'Finance', systems: ['Accounting System'], status: 'Approved', created: '2025-07-18', urgency: 'Standard' },
  ];

  const itemRequests = [
    { id: 'IR001', employee: 'David Lee', item: 'MacBook Pro 16"', quantity: 1, status: 'IT Approved', created: '2025-07-19', location: 'Building A, Floor 3' },
    { id: 'IR002', employee: 'Emma White', item: 'USB-C Cables', quantity: 3, status: 'Pending IT Review', created: '2025-07-18', location: 'Building B, Floor 1' },
    { id: 'IR003', employee: 'Tom Johnson', item: 'External Monitor', quantity: 2, status: 'Ready for Delivery', created: '2025-07-17', location: 'Building A, Floor 2' },
  ];

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'pending it approval':
      case 'pending it review': return 'text-orange-600 bg-orange-50';
      case 'assigned to me':
      case 'in progress': return 'text-blue-600 bg-blue-50';
      case 'resolved':
      case 'approved':
      case 'it approved':
      case 'completed': return 'text-green-600 bg-green-50';
      case 'ready for delivery': return 'text-purple-600 bg-purple-50';
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
    action?: string;
  }

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color = 'text-blue-600', action }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {action && <p className="text-xs text-gray-500 mt-1">{action}</p>}
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );

  interface ActionButtonProps {
    icon: React.ElementType;
    label: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
  }

  const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, onClick, variant = 'primary' }) => {
    const baseClasses = "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = {
      primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
      secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-sky-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
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
        <StatCard title="My Active Tickets" value="8" icon={Wrench} color="text-blue-600" action="2 high priority" />
        <StatCard title="Pending Approvals" value="12" icon={Clock} color="text-orange-600" action="Access & Items" />
        <StatCard title="Ready for Delivery" value="5" icon={Truck} color="text-purple-600" action="Items awaiting pickup" />
        <StatCard title="Resolved Today" value="3" icon={CheckCircle} color="text-green-600" action="Great work!" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">My Priority Tickets</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {myTickets.filter(t => t.priority === 'High' || t.assignedTo === 'me').slice(0, 4).map(ticket => (
              <div key={ticket.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ticket.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{ticket.employee}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                  <button className="text-sky-600 hover:text-sky-700 text-sm font-medium">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
                <Ticket className="h-6 w-6 text-sky-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">New Ticket</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
                <Key className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Grant Access</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
                <Package className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Approve Item</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
                <Truck className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Schedule Delivery</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">Today's Schedule</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Setup new employee workstation</p>
                  <p className="text-xs text-gray-600">Building A, Floor 3 - Alice Brown</p>
                </div>
              </div>
              <span className="text-xs text-blue-600 font-medium">10:00 AM</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Deliver MacBook Pro</p>
                  <p className="text-xs text-gray-600">Building A, Floor 3 - David Lee</p>
                </div>
              </div>
              <span className="text-xs text-purple-600 font-medium">2:00 PM</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Wrench className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fix printer issue</p>
                  <p className="text-xs text-gray-600">Building B, Floor 1 - Lisa White</p>
                </div>
              </div>
              <span className="text-xs text-green-600 font-medium">4:00 PM</span>
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
          <ActionButton icon={Filter} label="My Tickets" variant="secondary" />
          <ActionButton icon={Plus} label="Assign to Me" />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myTickets.map(ticket => (
                <tr key={ticket.id} className={`hover:bg-gray-50 ${ticket.assignedTo === 'me' ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {ticket.id}
                    {ticket.assignedTo === 'me' && <span className="ml-2 text-xs text-blue-600">(Mine)</span>}
                  </td>
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
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    {ticket.assignedTo !== 'me' && (
                      <button className="text-green-600 hover:text-green-900">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
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
        <div className="flex space-x-3">
          <ActionButton icon={CheckCircle} label="Batch Approve" variant="success" />
          <ActionButton icon={XCircle} label="Batch Reject" variant="danger" />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Systems</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
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
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.urgency === 'High' ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'
                    }`}>
                      {request.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {request.status === 'Pending IT Approval' && (
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

  const renderItemRequests = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Item Requisitions</h2>
        <div className="flex space-x-3">
          <ActionButton icon={Truck} label="Schedule Deliveries" variant="secondary" />
          <ActionButton icon={CheckCircle} label="Mark Delivered" variant="success" />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {itemRequests.map(request => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{request.employee}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{request.item}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{request.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{request.location}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {request.status === 'Pending IT Review' && (
                      <>
                        <button className="text-green-600 hover:text-green-900">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {request.status === 'Ready for Delivery' && (
                      <button className="text-purple-600 hover:text-purple-900">
                        <Truck className="h-4 w-4" />
                      </button>
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

  const modules = [
    { id: 'overview', name: 'Overview', icon: Monitor },
    { id: 'tickets', name: 'My Tickets', icon: Wrench },
    { id: 'access-requests', name: 'Access Requests', icon: Key },
    { id: 'item-requests', name: 'Item Requisitions', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-[#F0F8F8]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-sky-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">smartflow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 bg-red-400 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">IT Staff</p>
                  <p className="text-xs text-gray-500">itstaff@company.com</p>
                </div>
                <div className="h-8 w-8 bg-sky-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">IT</span>
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
            
            {/* IT Staff Quick Stats */}
            <div className="mt-8 p-4 bg-sky-50 rounded-lg">
              <h4 className="text-sm font-medium text-sky-900 mb-3">Today's Progress</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-sky-700">Tickets Resolved</span>
                  <span className="font-medium text-sky-900">3/8</span>
                </div>
                <div className="w-full bg-sky-200 rounded-full h-1.5">
                  <div className="bg-sky-600 h-1.5 rounded-full" style={{width: '37.5%'}}></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-sky-700">Approvals Done</span>
                  <span className="font-medium text-sky-900">7/12</span>
                </div>
                <div className="w-full bg-sky-200 rounded-full h-1.5">
                  <div className="bg-sky-600 h-1.5 rounded-full" style={{width: '58%'}}></div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {activeModule === 'overview' && renderOverview()}
            {activeModule === 'tickets' && renderTickets()}
            {activeModule === 'access-requests' && renderAccessRequests()}
            {activeModule === 'item-requests' && renderItemRequests()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ITStaffDashboard;