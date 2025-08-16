"use client"
import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, XCircle, Clock, User, AlertCircle, Search, RefreshCw, Calendar, Building } from 'lucide-react';
import ITManagerLayout from '../components/ITManagerLayout';
import { useAuth } from '@/app/contexts/auth-context';
import systemAccessRequestService, { SystemAccessRequest } from '@/app/services/systemAccessRequestService';
import { getITUsers, ITUser } from '@/app/services/itTicketService';
import API from '@/app/utils/axios';

type TabType = 'pending' | 'assigned' | 'all';
type RequestStatus = 'it_manager_pending' | 'it_support_review' | 'granted' | 'rejected';
type ViewScope = 'me' | 'department' | 'all';

interface AssignmentModalProps {
  request: SystemAccessRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onAssigned: () => void;
  itUsers: ITUser[];
  approverId: number | null | undefined;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({ 
  request, 
  isOpen, 
  onClose, 
  onAssigned, 
  itUsers, 
  approverId 
}) => {
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && request) {
      setAssignedTo('');
      setComment('');
      setIsSubmitting(false);
    }
  }, [isOpen, request?.id]);

  if (!request || !isOpen) return null;

  const handleAssign = async () => {
    if (!approverId) {
      alert('Unable to assign: User information not available');
      return;
    }

    // Validate assignment if a specific user is selected
    if (assignedTo && !itUsers.find(u => u.id.toString() === assignedTo)) {
      alert('Selected user is not available. Please choose a valid IT team member.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        approver_id: approverId,
        assigned_user_id: assignedTo ? parseInt(assignedTo) : null,
        comment: comment.trim() || undefined
      };

      await API.put(`/api/system-access-requests/${request.id}/assign`, payload);
      onAssigned();
      onClose();
    } catch (error) {
      console.error('Failed to assign:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to assign request: ${errorMessage}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const isPending = request.status === 'it_manager_pending';

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-200 rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900">
            {isPending ? 'Assign Request' : 'Request Details'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Employee Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Employee Information</h3>
                <p className="text-sm text-gray-600">Request submitted by</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Full Name
                </label>
                <p className="text-sm font-medium text-gray-900">{request.user_name || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Email Address
                </label>
                <p className="text-sm font-medium text-gray-900 break-all">{request.user_email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Department
                </label>
                <p className="text-sm font-medium text-gray-900">{request.department_name || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Role
                </label>
                <p className="text-sm font-medium text-gray-900">{request.role_name || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Access Request Details</h3>
                <p className="text-sm text-gray-600">System access information</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    System Name
                  </label>
                  <p className="text-sm font-medium text-gray-900">{request.system_name || 'Unknown System'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Submitted Date
                  </label>
                  <p className="text-sm font-medium text-gray-900">{formatDate(request.submitted_at)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Access Duration
                  </label>
                  <p className="text-sm font-medium text-gray-900">
                    {request.is_permanent ? (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Permanent Access
                      </span>
                    ) : (
                      request.end_date ? `Until ${formatDate(request.end_date)}` : 'Not specified'
                    )}
                  </p>
                </div>
                <div>
                                     <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                     Current Status
                   </label>
                   <div className="flex items-center gap-2">
                     <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${
                       isPending ? 'text-blue-700 bg-blue-100' : 'text-indigo-700 bg-indigo-100'
                     }`}>
                       <Clock className="h-4 w-4" />
                       {isPending ? 'Pending IT Manager Review' : 'Assigned to IT Support'}
                     </span>
                     {!isPending && (
                       <span className="text-sm text-gray-700">
                         Assigned to: <span className="font-medium">{request.it_support_name || 'Unassigned'}</span>
                       </span>
                     )}
                   </div>
                 </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Business Justification
                </label>
                <div className="bg-white p-3 rounded-md border border-gray-200">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {request.justification || 'No justification provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Section (only for pending requests) */}
          {isPending && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Assignment & Approval</h3>
                  <p className="text-sm text-gray-600">Assign to IT support team member</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to IT Team Member (Optional)
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={isSubmitting}
                  >
                    <option value="">🔄 Unassigned (Any available team member can handle)</option>
                    {itUsers.length === 0 ? (
                      <option disabled>No IT team members available</option>
                    ) : (
                      itUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          👤 {user.full_name || `User ${user.id}`}
                        </option>
                      ))
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave unassigned to allow any IT team member to handle this request
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Notes (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Add any special instructions or notes for the IT team..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    maxLength={500}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {comment.length}/500 characters
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-xl">
          <div className="flex gap-3 justify-end">
            <button 
              onClick={onClose} 
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              {isPending ? 'Cancel' : 'Close'}
            </button>
            {isPending && (
              <button 
                onClick={handleAssign} 
                disabled={isSubmitting} 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Approve & Assign
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ITManagerAssignments() {
  const { user } = useAuth();
  const [pending, setPending] = useState<SystemAccessRequest[]>([]);
  const [assigned, setAssigned] = useState<SystemAccessRequest[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [viewScope, setViewScope] = useState<ViewScope>('me');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<SystemAccessRequest | null>(null);
  const [itUsers, setItUsers] = useState<ITUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      refresh();
      loadITUsers();
    }
  }, [user?.id, viewScope]); // Add viewScope to dependencies

  const loadITUsers = async () => {
    try {
      const response = await getITUsers();
      const users = response?.users || [];
      setItUsers(users);
      
      if (users.length === 0) {
        console.warn('No IT users found');
      }
    } catch (error) {
      console.error('Failed to load IT users:', error);
      setItUsers([]);
    }
  };

  const refresh = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let pendingResponse, assignedResponse;
      
      // Always get pending requests for current IT Manager
      pendingResponse = await systemAccessRequestService.getPending({ 
          approver_id: user.id, 
          approver_role: 'IT Manager' 
      });
      
      // Get assigned/acted upon requests based on view scope
      if (viewScope === 'me') {
        // Show requests acted upon by the current IT Manager
        assignedResponse = await systemAccessRequestService.getApprovedBy({ 
          approver_id: user.id, 
          approver_role: 'IT Manager' 
        });
      } else if (viewScope === 'department') {
        // Show requests acted upon by any IT Manager in the department
        // We'll use getCompleted() and filter for IT Manager actions
        assignedResponse = await systemAccessRequestService.getCompleted();
      } else {
        // Show all completed requests
        assignedResponse = await systemAccessRequestService.getCompleted();
      }
      
      // Pending requests that need IT Manager action
      const pendingRequests = (pendingResponse?.requests || []).filter(r => r.status === 'it_manager_pending');
      
      // All requests that have been acted upon
      let allActedUponRequests = assignedResponse?.requests || [];
      
      // Filter based on view scope
      if (viewScope === 'me') {
        // Only show requests acted upon by current IT Manager
        allActedUponRequests = allActedUponRequests.filter(r => r.it_manager_at);
      } else if (viewScope === 'department') {
        // Show requests acted upon by any IT Manager in the same department
        allActedUponRequests = allActedUponRequests.filter(r => r.it_manager_at);
        // Note: We'll need to filter by department in the frontend since the API doesn't provide department filtering
        // This is a limitation - ideally the backend would support department filtering
      }
      // For 'all' scope, we show all completed requests
      
      setPending(pendingRequests);
      setAssigned(allActedUponRequests);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load requests: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    const getRequests = () => {
      switch (activeTab) {
        case 'pending':
          return pending;
        case 'assigned':
          return assigned;
        case 'all':
        default:
          return [...pending, ...assigned];
      }
    };

    const requests = getRequests();
    
    if (!search.trim()) return requests;
    
    const searchTerm = search.toLowerCase().trim();
    return requests.filter(request => {
      const searchableFields = [
        request.user_name || '',
        request.system_name || '',
        request.user_email || '',
        request.department_name || '',
        request.role_name || '',
        request.justification || ''
      ];
      
      return searchableFields.some(field => 
        field.toLowerCase().includes(searchTerm)
      );
    });
  }, [pending, assigned, activeTab, search]);

  const getStatusBadge = (status: RequestStatus) => {
    const configs = {
      'it_manager_pending': {
        label: 'Pending Review',
        className: 'text-blue-700 bg-blue-100',
        icon: Clock
      },
      'it_support_review': {
        label: 'Assigned to IT',
        className: 'text-indigo-700 bg-indigo-100',
        icon: User
      },
      'granted': {
        label: 'Granted',
        className: 'text-green-700 bg-green-100',
        icon: CheckCircle
      },
      'rejected': {
        label: 'Rejected',
        className: 'text-red-700 bg-red-100',
        icon: XCircle
      }
    };

    const config = configs[status] || {
      label: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      className: 'text-gray-700 bg-gray-100',
      icon: AlertCircle
    };

    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${config.className}`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const tabConfigs = [
    { key: 'pending' as const, label: 'Pending Review', count: pending.length },
    { key: 'assigned' as const, label: viewScope === 'me' ? 'My Assignments' : viewScope === 'department' ? 'Department Assignments' : 'All Assignments', count: assigned.length },
    { key: 'all' as const, label: 'All Requests', count: pending.length + assigned.length }
  ];

  if (error && !loading) {
    return (
      <ITManagerLayout>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Assignments</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={refresh}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </ITManagerLayout>
    );
  }

  return (
    <ITManagerLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
              Request Assignments
            </h1>
            <p className="text-sm text-gray-600 mt-1 break-words">
              {viewScope === 'me' 
                ? 'Manage and track all system access requests you\'ve assigned or acted upon'
                : viewScope === 'department'
                ? 'View all system access requests assigned by IT Managers in your department'
                : 'View all system access requests across the organization'
              }
            </p>
          </div>
          <button 
            onClick={refresh} 
            className="flex-shrink-0 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
            title="Refresh assignments"
            aria-label="Refresh assignments"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="p-4 space-y-4">
            {/* View Scope Toggle */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">View Scope</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setViewScope('me')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  viewScope === 'me'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                By Me
              </button>
              <button
                onClick={() => setViewScope('department')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  viewScope === 'department'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                By Department
              </button>
              <button
                onClick={() => setViewScope('all')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  viewScope === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tab Navigation */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1 overflow-x-auto">
              {tabConfigs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.key
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">
                      {tab.key === 'pending' ? 'Pending' : tab.key === 'assigned' ? 'Assigned' : 'All'}
                    </span>
                    <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
              <div className="relative w-full lg:w-auto">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, system, or department..."
                className="w-full lg:w-80 pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
              {activeTab === 'pending' && 'Pending Review'}
              {activeTab === 'assigned' && (viewScope === 'me' ? 'My Assignments' : viewScope === 'department' ? 'Department Assignments' : 'All Assignments')} 
              {activeTab === 'all' && 'All Requests'}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'})
              </span>
            </h3>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="px-6 py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-500">Loading requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium mb-1">
                  {search.trim() ? 'No matching requests found' : 'No requests found'}
                </p>
                <p className="text-gray-400 text-sm">
                  {search.trim() ? 'Try adjusting your search terms' : 'New requests will appear here when submitted'}
                </p>
                {search.trim() && (
                  <button
                    onClick={() => setSearch('')}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div key={request.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {request.user_name || 'Unknown User'}
                          </h4>
                          <span className="hidden sm:inline text-gray-300">•</span>
                          <p className="text-sm text-gray-600 truncate">
                            {request.system_name || 'Unknown System'}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          Submitted {formatDate(request.submitted_at)}
                        </p>
                        {(viewScope === 'department' || viewScope === 'all') && request.it_manager_at && (
                          <div className="flex items-center text-gray-500 mt-1">
                            <span className="truncate">Reviewed by: {request.it_manager_name || 'IT Manager'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-shrink-0">
                      <div className="flex items-center gap-2">
                       {getStatusBadge(request.status as RequestStatus)}
                       {request.status === 'it_support_review' && (
                          <span className="text-xs sm:text-sm text-gray-600">
                            <span className="hidden sm:inline">Assigned to: </span>
                            <span className="font-medium">{request.it_support_name || 'Unassigned'}</span>
                         </span>
                       )}
                      </div>
                       <button
                         onClick={() => {
                           setSelected(request);
                           setModalOpen(true);
                         }}
                        className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                           request.status === 'it_manager_pending'
                             ? 'bg-blue-600 text-white hover:bg-blue-700'
                             : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                         }`}
                       >
                         {request.status === 'it_manager_pending' ? 'Assign' : 'View'}
                       </button>
                     </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AssignmentModal
        request={selected}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        onAssigned={refresh}
        itUsers={itUsers}
        approverId={user?.id}
      />
    </ITManagerLayout>
  );
}