"use client"
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Monitor, 
  Settings, 
  Key, 
  UserMinus, 
  Package, 
  LogOut,
  Bell,
  ChevronDown,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  FileText,
  Upload,
  X,
  Check
} from 'lucide-react';

interface System {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  systemId: string;
}

interface AccessRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  systemId: string;
  systemName: string;
  roleId: string;
  roleName: string;
  justification: string;
  startDate: string;
  endDate?: string;
  isPermanent: boolean;
  status: 'pending_manager_approval' | 'pending_system_owner' | 'granted' | 'rejected';
  submittedDate: string;
  attachments?: string[];
}

const AccessRequestsPortal = () => {
  const [activeSection, setActiveSection] = useState('access-requests');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state
  const [selectedSystem, setSelectedSystem] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [justification, setJustification] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);

  // Sample data
  const systems: System[] = [
    { id: '1', name: 'Ticketing System', description: 'Customer support ticket management' },
    { id: '2', name: 'CRM', description: 'Customer relationship management' },
    { id: '3', name: 'Payroll System', description: 'Employee payroll and benefits' },
    { id: '4', name: 'Project Management', description: 'Project tracking and collaboration' },
    { id: '5', name: 'Analytics Dashboard', description: 'Business intelligence and reporting' }
  ];

  const roles: Role[] = [
    { id: '1', name: 'Support Agent', description: 'Basic ticket handling', systemId: '1' },
    { id: '2', name: 'Support Manager', description: 'Ticket management and escalation', systemId: '1' },
    { id: '3', name: 'Admin', description: 'Full system administration', systemId: '1' },
    { id: '4', name: 'Sales Rep', description: 'Customer contact management', systemId: '2' },
    { id: '5', name: 'Sales Manager', description: 'Team and pipeline management', systemId: '2' },
    { id: '6', name: 'HR Specialist', description: 'Payroll processing', systemId: '3' },
    { id: '7', name: 'HR Admin', description: 'Full payroll administration', systemId: '3' },
    { id: '8', name: 'Team Member', description: 'Project participation', systemId: '4' },
    { id: '9', name: 'Project Manager', description: 'Project oversight', systemId: '4' },
    { id: '10', name: 'Analyst', description: 'Report viewing', systemId: '5' },
    { id: '11', name: 'Data Admin', description: 'Dashboard management', systemId: '5' }
  ];

  const accessRequests: AccessRequest[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      email: 'john.doe@company.com',
      systemId: '2',
      systemName: 'CRM',
      roleId: '4',
      roleName: 'Sales Rep',
      justification: 'New hire joining the sales team',
      startDate: '2025-02-01',
      isPermanent: true,
      status: 'pending_manager_approval',
      submittedDate: '2025-01-30'
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Sarah Wilson',
      email: 'sarah.wilson@company.com',
      systemId: '1',
      systemName: 'Ticketing System',
      roleId: '2',
      roleName: 'Support Manager',
      justification: 'Promotion to team lead role',
      startDate: '2025-02-05',
      isPermanent: true,
      status: 'granted',
      submittedDate: '2025-01-28'
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      systemId: '5',
      systemName: 'Analytics Dashboard',
      roleId: '10',
      roleName: 'Analyst',
      justification: 'Temporary access for quarterly reporting',
      startDate: '2025-02-01',
      endDate: '2025-04-30',
      isPermanent: false,
      status: 'pending_system_owner',
      submittedDate: '2025-01-29'
    }
  ];

  // Get filtered roles based on selected system
  const filteredRoles = roles.filter(role => role.systemId === selectedSystem);

  // Get filtered requests
  const filteredRequests = accessRequests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.systemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSystem || !selectedRole || !justification || !startDate) {
      alert('Please fill in all required fields');
      return;
    }

    const newRequest: AccessRequest = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'Current User',
      email: 'taja@gmail.com',
      systemId: selectedSystem,
      systemName: systems.find(s => s.id === selectedSystem)?.name || '',
      roleId: selectedRole,
      roleName: roles.find(r => r.id === selectedRole)?.name || '',
      justification,
      startDate,
      endDate: isPermanent ? undefined : endDate,
      isPermanent,
      status: 'pending_manager_approval',
      submittedDate: new Date().toISOString().split('T')[0],
      attachments
    };

    console.log('Submitting request:', newRequest);
    
    // Reset form
    setSelectedSystem('');
    setSelectedRole('');
    setJustification('');
    setStartDate('');
    setEndDate('');
    setIsPermanent(false);
    setAttachments([]);
    setShowRequestForm(false);
    
    alert('Access request submitted successfully!');
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Monitor },
    { id: 'it-tickets', label: 'IT Tickets', icon: Settings },
    { id: 'access-requests', label: 'Access Requests', icon: Key },
    { id: 'access-revocation', label: 'Access Revocation', icon: UserMinus },
    { id: 'item-requisition', label: 'Item Requisition', icon: Package }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_manager_approval': return 'bg-yellow-100 text-yellow-800';
      case 'pending_system_owner': return 'bg-orange-100 text-orange-800';
      case 'granted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending_manager_approval': return 'Pending Manager';
      case 'pending_system_owner': return 'Pending System Owner';
      case 'granted': return 'Granted';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
                {/* Main Content */}
        <div className="flex-1 p-8">
          {activeSection === 'access-requests' ? (
            <div>
              {/* Header Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Requests</h1>
                    <p className="text-gray-600">Request access to systems and manage your pending requests.</p>
                  </div>
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Request
                  </button>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search by name, email, or system..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <select
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="pending_manager_approval">Pending Manager</option>
                      <option value="pending_system_owner">Pending System Owner</option>
                      <option value="granted">Granted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Requests Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requestor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System & Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Justification</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                              <div className="text-sm text-gray-500">{request.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{request.systemName}</div>
                              <div className="text-sm text-gray-500">{request.roleName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(request.startDate).toLocaleDateString()}
                              {request.isPermanent ? (
                                <div className="text-xs text-green-600">Permanent</div>
                              ) : (
                                <div className="text-xs text-gray-500">
                                  to {request.endDate ? new Date(request.endDate).toLocaleDateString() : 'TBD'}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate" title={request.justification}>
                              {request.justification}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                              {formatStatus(request.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(request.submittedDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredRequests.length === 0 && (
                  <div className="text-center py-12">
                    <Key className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No access requests</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || filterStatus !== 'all' 
                        ? 'No requests match your current filters.' 
                        : 'No access requests found. Create your first request!'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Placeholder for other sections
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {menuItems.find(item => item.id === activeSection)?.label}
              </h1>
              <p className="text-gray-600">This section is under development.</p>
            </div>
          )}
        </div>
      </div>

      {/* Access Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">New Access Request</h2>
              <button
                onClick={() => setShowRequestForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitRequest} className="p-6 space-y-6">
              {/* System Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSystem}
                  onChange={(e) => {
                    setSelectedSystem(e.target.value);
                    setSelectedRole(''); // Reset role when system changes
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a system...</option>
                  {systems.map((system) => (
                    <option key={system.id} value={system.id}>
                      {system.name} - {system.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!selectedSystem}
                  required
                >
                  <option value="">Select a role...</option>
                  {filteredRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
                {!selectedSystem && (
                  <p className="text-sm text-gray-500 mt-1">Please select a system first</p>
                )}
              </div>

              {/* Justification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justification <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Explain why you need this access..."
                  required
                />
              </div>

              {/* Access Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Access Duration</label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isPermanent}
                      onChange={(e) => setIsPermanent(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Permanent access</span>
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    {!isPermanent && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload or drag and drop files here
                  </p>
                  <p className="text-xs text-gray-500">
                    Manager approval email, project documentation, etc.
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessRequestsPortal;