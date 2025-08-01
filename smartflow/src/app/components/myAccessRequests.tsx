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
  Check,
  Loader2,
  Clock,
  Building2,
  Shield
} from 'lucide-react';
import { useAuth } from '@/app/contexts/auth-context';
import systemService, { System, Role } from '@/app/services/systemService';
import accessRequestService, { AccessRequest, CreateAccessRequestData } from '@/app/services/accessRequestService';

const AccessRequestsPortal = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('access-requests');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [selectedSystem, setSelectedSystem] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [justification, setJustification] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);

  // Data state
  const [systems, setSystems] = useState<System[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug logging
  console.log('AccessRequestsPortal render:', { 
    user: user?.id, 
    isLoading, 
    accessRequestsCount: accessRequests.length,
    systemsCount: systems.length 
  });

  // Load systems and user's access requests
  useEffect(() => {
    console.log('useEffect triggered:', { userId: user?.id });
    if (user?.id) {
      // Small delay to ensure auth context is fully loaded
      const timer = setTimeout(() => {
        loadData();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  const loadData = async () => {
    console.log('Loading data...', { userId: user?.id });
    setIsLoading(true);
    try {
      // Load systems
      const systemsResponse = await systemService.getAllSystems();
      console.log('Systems response:', systemsResponse);
      if (systemsResponse.success) {
        setSystems(systemsResponse.systems);
      }

      // Load user's access requests
      if (user?.id) {
        const requestsResponse = await accessRequestService.getUserAccessRequests(user.id);
        console.log('Requests response:', requestsResponse);
        if (requestsResponse.success) {
          setAccessRequests(requestsResponse.requests);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  

  // Load roles when system is selected
  useEffect(() => {
    if (selectedSystem) {
      loadSystemRoles(parseInt(selectedSystem));
    } else {
      setRoles([]);
    }
  }, [selectedSystem]);

  const loadSystemRoles = async (systemId: number) => {
    try {
      const response = await systemService.getSystemRoles(systemId);
      if (response.success) {
        setRoles(response.roles);
      }
    } catch (error) {
      console.error('Error loading system roles:', error);
    }
  };

  // Get filtered roles based on selected system
  const filteredRoles = roles.filter(role => role.system_id === parseInt(selectedSystem));

  // Get filtered requests
  const filteredRequests = accessRequests.filter(request => {
    const matchesSearch = request.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.system_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSystem || !selectedRole || !justification || !startDate || !user?.id) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: CreateAccessRequestData = {
        user_id: user.id,
        system_id: parseInt(selectedSystem),
        role_id: parseInt(selectedRole),
        justification,
        start_date: startDate,
        end_date: isPermanent ? undefined : endDate,
        is_permanent: isPermanent
      };

      const response = await accessRequestService.createAccessRequest(requestData);
      
      if (response.success) {
        alert('Access request submitted successfully!');
        
        // Reset form
        setSelectedSystem('');
        setSelectedRole('');
        setJustification('');
        setStartDate('');
        setEndDate('');
        setIsPermanent(false);
        setAttachments([]);
        setShowRequestForm(false);
        
        // Reload data
        loadData();
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_manager_approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending_system_owner': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'granted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_manager_approval': return Clock;
      case 'pending_system_owner': return Shield;
      case 'granted': return Check;
      case 'rejected': return X;
      default: return Clock;
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

  // Show loading state if user is not available
  if (!user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading access requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeSection === 'access-requests' ? (
            <div>
              {/* Header Section */}
              <div className="mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Access Requests</h1>
                    <p className="text-gray-600 text-sm sm:text-base">Request access to systems and manage your pending requests.</p>
                  </div>
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Request</span>
                    <span className="sm:hidden">New</span>
                  </button>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex-1 w-full max-w-md">
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
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <select
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="pending_manager_approval">Pending Manager</option>
                      <option value="pending_system_owner">Pending System Owner</option>
                      <option value="granted">Granted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    
                    <button 
                      onClick={loadData}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 justify-center w-full sm:w-auto"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span className="hidden sm:inline">Refresh</span>
                      <span className="sm:hidden">Refresh</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Requests Cards */}
              <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <Key className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No access requests</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || filterStatus !== 'all' 
                        ? 'No requests match your current filters.' 
                        : 'No access requests found. Create your first request!'}
                    </p>
                  </div>
                ) : (
                  filteredRequests.map((request) => {
                    const StatusIcon = getStatusIcon(request.status);
                    return (
                      <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{request.user_name}</h3>
                                <p className="text-sm text-gray-500">{request.user_email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                              <StatusIcon className="h-3 w-3" />
                              {formatStatus(request.status)}
                            </span>
                          </div>
                        </div>

                        {/* System & Role Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{request.system_name}</p>
                              <p className="text-xs text-gray-500">{request.system_description}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Shield className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{request.role_name}</p>
                              <p className="text-xs text-gray-500">{request.role_description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Access Period */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Access Period</p>
                            <p className="text-sm text-gray-600">
                              {new Date(request.start_date).toLocaleDateString()}
                              {request.is_permanent ? (
                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Permanent</span>
                              ) : (
                                <span className="ml-2 text-xs text-gray-500">
                                  to {request.end_date ? new Date(request.end_date).toLocaleDateString() : 'TBD'}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Justification */}
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-900 mb-2">Justification</p>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {request.justification}
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Submitted: {new Date(request.submitted_at).toLocaleDateString()}
                            </span>
                            {request.approved_at && (
                              <span className="flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Processed: {new Date(request.approved_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {request.rejection_reason && (
                            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                              <strong>Rejection Reason:</strong> {request.rejection_reason}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
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
                {activeSection}
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
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">New Access Request</h2>
              <button
                onClick={() => setShowRequestForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitRequest} className="p-4 sm:p-6 space-y-6">
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
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
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