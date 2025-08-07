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
  Shield,
  Menu,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/app/contexts/auth-context';
import { getAllDepartments, getDepartmentRoles, Department, DepartmentRole } from '@/app/services/departmentService';
import accessRequestService, { AccessRequest, CreateAccessRequestData } from '@/app/services/accessRequestService';
import WorkflowStatus from './WorkflowStatus';
import { FullScreenLoading, InlineLoading } from './ResponsiveLoading';
import NotificationToast from './NotificationToast';

const AccessRequestsPortal = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('access-requests');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Form state
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [justification, setJustification] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);

  // Data state
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<DepartmentRole[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug logging
  console.log('AccessRequestsPortal render:', { 
    user: user?.id, 
    isLoading, 
    accessRequestsCount: accessRequests.length,
    departmentsCount: departments.length,
    userDetails: user // Log full user details
  });

  // Load systems and user's access requests
  useEffect(() => {
    console.log('useEffect triggered:', { userId: user?.id, user: user });
    if (user?.id) {
      // Small delay to ensure auth context is fully loaded
      const timer = setTimeout(() => {
        loadData();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      console.log('No user ID available');
    }
  }, [user?.id]);

  const loadData = async () => {
    console.log('Loading data...', { userId: user?.id, user: user });
    setIsLoading(true);
    try {
      // Load departments for role-based access requests
      const departmentsResponse = await getAllDepartments();
      console.log('Departments response:', departmentsResponse);
      if (departmentsResponse.success) {
        setDepartments(departmentsResponse.departments);
      }

      // Load user's access requests
      if (user?.id) {
        console.log('Fetching requests for user ID:', user.id);
        const requestsResponse = await accessRequestService.getUserRequests(user.id);
        console.log('Requests response:', requestsResponse);
        console.log('Requests array length:', requestsResponse.length);
        // getUserRequests returns the array directly, not wrapped in success object
        setAccessRequests(requestsResponse);
      } else {
        console.log('No user ID available for fetching requests');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      addNotification('error', 'Error Loading Data', 'Failed to load access requests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  

  // Load roles when system is selected
  useEffect(() => {
    if (selectedDepartment) {
      loadDepartmentRoles(parseInt(selectedDepartment));
    } else {
      setRoles([]);
    }
  }, [selectedDepartment]);

  const loadDepartmentRoles = async (departmentId: number) => {
    try {
      const response = await getDepartmentRoles(departmentId);
      if (response.success) {
        setRoles(response.roles);
      }
    } catch (error) {
      console.error('Error loading department roles:', error);
    }
  };

  // Get filtered roles based on selected system
  const filteredRoles = roles.filter(role => role.department_id === parseInt(selectedDepartment));

  // Get filtered requests
  let filtered = accessRequests.filter(request => {
    const matchesSearch = request.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.role_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, title, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDepartment || !selectedRole || !justification || !startDate || !user?.id) {
      addNotification('error', 'Validation Error', 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting access request with user ID:', user.id);
      console.log('User details:', user);
      
      const requestData: CreateAccessRequestData = {
        user_id: user.id,
        department_id: parseInt(selectedDepartment),
        role_id: parseInt(selectedRole),
        justification,
        start_date: startDate,
        end_date: isPermanent ? undefined : endDate,
        is_permanent: isPermanent
      };

      console.log('Request data being sent:', requestData);
      
      const response = await accessRequestService.createAccessRequest(requestData);
      
      if (response.success) {
        addNotification('success', 'Request Submitted', 'Role access request submitted successfully!');
        
        // Reset form
        setSelectedDepartment('');
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
      addNotification('error', 'Submission Failed', 'Failed to submit role request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_line_manager': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending_hod': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pending_it_manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending_manager_approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending_system_owner': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'granted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_line_manager': return Clock;
      case 'pending_hod': return Shield;
      case 'pending_it_manager': return Building2;
      case 'pending_manager_approval': return Clock;
      case 'pending_system_owner': return Shield;
      case 'granted': return Check;
      case 'rejected': return X;
      default: return Clock;
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending_line_manager': return 'Pending Line Manager';
      case 'pending_hod': return 'Pending HOD';
      case 'pending_it_manager': return 'Pending IT Manager';
      case 'pending_manager_approval': return 'Pending Manager';
      case 'pending_system_owner': return 'Pending System Owner';
      case 'granted': return 'Granted';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  // Show loading state if user is not available
  if (!user?.id) {
    return <FullScreenLoading message="Loading user information..." />;
  }

  if (isLoading) {
    return <FullScreenLoading message="Loading access requests..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notifications */}
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          id={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={removeNotification}
        />
      ))}

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeSection === 'access-requests' ? (
            <div>
              {/* Header Section */}
              <div className="mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Role Access Requests</h1>
                    <p className="text-gray-600 text-sm sm:text-base">Request role-based access and manage your pending requests.</p>
                  </div>
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Role Request</span>
                    <span className="sm:hidden">New Role</span>
                  </button>
                </div>
              </div>

              {/* Mobile Filters Toggle */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                  className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-700">Filters & Search</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isMobileFiltersOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Controls */}
              <div className={`bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex-1 w-full max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search by name, email, department, or role..."
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
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {filtered.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <Key className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No role access requests</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || filterStatus !== 'all' 
                        ? 'No requests match your current filters.' 
                        : 'No role access requests found. Create your first request!'}
                    </p>
                  </div>
                ) : (
                  filtered.map((request) => {
                    const StatusIcon = getStatusIcon(request.status);
                    return (
                      <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{request.user_name}</h3>
                                <p className="text-sm text-gray-500 truncate">{request.user_email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                              <StatusIcon className="h-3 w-3 flex-shrink-0" />
                              <span className="hidden sm:inline">{formatStatus(request.status)}</span>
                              <span className="sm:hidden">{formatStatus(request.status).split(' ')[0]}</span>
                            </span>
                          </div>
                        </div>

                        {/* Workflow Status */}
                        <div className="mb-4 overflow-x-auto">
                          <WorkflowStatus status={request.status} className="justify-start min-w-max" />
                        </div>

                        {/* System & Role Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{request.department_name}</p>
                              <p className="text-xs text-gray-500">Department</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Shield className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{request.role_name}</p>
                              <p className="text-xs text-gray-500">Requested Role</p>
                            </div>
                          </div>
                        </div>

                        {/* Access Period */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
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
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg break-words">
                            {request.justification}
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 flex-shrink-0" />
                              <span className="hidden sm:inline">Submitted: {new Date(request.submitted_at).toLocaleDateString()}</span>
                              <span className="sm:hidden">Submitted: {new Date(request.submitted_at).toLocaleDateString()}</span>
                            </span>
                            {request.approved_at && (
                              <span className="flex items-center gap-1">
                                <Check className="h-3 w-3 flex-shrink-0" />
                                <span className="hidden sm:inline">Processed: {new Date(request.approved_at).toLocaleDateString()}</span>
                                <span className="sm:hidden">Processed: {new Date(request.approved_at).toLocaleDateString()}</span>
                              </span>
                            )}
                          </div>
                          {request.rejection_reason && (
                            <div className="text-xs text-red-600 bg-red-50 p-2 rounded break-words">
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">New Role Access Request</h2>
              </div>
              <button
                onClick={() => setShowRequestForm(false)}
                className="hidden lg:block text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitRequest} className="p-4 sm:p-6 space-y-6">
              {/* Department Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setSelectedRole(''); // Reset role when department changes
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a department...</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name} - {department.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Needed <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!selectedDepartment}
                  required
                >
                  <option value="">Select a role...</option>
                  {filteredRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
                {!selectedDepartment && (
                  <p className="text-sm text-gray-500 mt-1">Please select a department first</p>
                )}
                {selectedDepartment && filteredRoles.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">No roles available for this department</p>
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
                  placeholder="Explain why you need this role and what responsibilities you'll have..."
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
                    <InlineLoading size="sm" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'Submitting...' : 'Submit Role Request'}
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