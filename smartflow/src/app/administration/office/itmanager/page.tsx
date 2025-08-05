"use client"
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  Building2, 
  User, 
  X, 
  AlertCircle,
  Eye,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import accessRequestService, { AccessRequest } from '../../../services/accessRequestService';
import ITManagerLayout from './components/ITManagerLayout';
import { useAuth } from '@/app/contexts/auth-context';

interface ApprovalModalProps {
  request: AccessRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (requestId: number, data: any) => void;
  onReject: (requestId: number, data: any) => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ request, isOpen, onClose, onApprove, onReject }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!request || !isOpen) return null;

  const canApprove = request.status === 'pending_it_manager';
  const canReject = request.status === 'pending_it_manager';

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending_manager_approval':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'pending_hod':
        return <Shield className="h-4 w-4 text-orange-500" />;
      case 'pending_it_manager':
        return <Building2 className="h-4 w-4 text-blue-500" />;
      case 'ready_for_assignment':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'access_granted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'it_assigned':
        return <Building2 className="h-4 w-4 text-blue-500" />;
      case 'granted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending_manager_approval':
        return 'text-yellow-600 bg-yellow-50';
      case 'pending_hod':
        return 'text-orange-600 bg-orange-50';
      case 'pending_it_manager':
        return 'text-blue-600 bg-blue-50';
      case 'ready_for_assignment':
        return 'text-green-600 bg-green-50';
      case 'access_granted':
        return 'text-green-600 bg-green-50';
      case 'it_assigned':
        return 'text-blue-600 bg-blue-50';
      case 'granted':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending_manager_approval':
        return 'Pending Line Manager';
      case 'pending_hod':
        return 'Pending HOD';
      case 'pending_it_manager':
        return 'Pending IT Manager';
      case 'ready_for_assignment':
        return 'Ready for Assignment';
      case 'access_granted':
        return 'Access Granted';
      case 'it_assigned':
        return 'IT Assigned';
      case 'granted':
        return 'Granted';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const handleApprove = async () => {
    if (!comment.trim()) {
      alert('Please provide a comment for approval.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onApprove(request.id, {
        approver_id: user?.id,
        comment
      });
      setComment('');
      onClose();
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onReject(request.id, {
        approver_id: user?.id,
        rejection_reason: rejectionReason
      });
      setRejectionReason('');
      onClose();
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">IT Manager Review</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Request Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Employee</h3>
              <p className="text-sm text-gray-900">{request.user_name}</p>
              <p className="text-xs text-gray-500">{request.user_email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Department</h3>
              <p className="text-sm text-gray-900">{request.department_name}</p>
              <p className="text-xs text-gray-500">{request.department_description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Role</h3>
              <p className="text-sm text-gray-900">{request.role_name}</p>
              <p className="text-xs text-gray-500">{request.role_description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <div className="flex items-center space-x-2">
                {getStatusIcon(request.status)}
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
                  {getStatusText(request.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Justification */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Justification</h3>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
              {request.justification}
            </p>
          </div>

          {/* Access Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
              <p className="text-sm text-gray-900">
                {new Date(request.start_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Duration</h3>
              <p className="text-sm text-gray-900">
                {request.is_permanent ? 'Permanent' : 'Temporary'}
              </p>
            </div>
          </div>

          {/* Approval Actions */}
          {canApprove && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add your approval comment..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          )}

          {/* Rejection Actions */}
          {canReject && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Provide a reason for rejection..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ITManagerDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      
      // Get all requests and filter for IT Manager relevant ones
      const allRequests = await accessRequestService.getAllRequests();
      
      // Filter to show IT Manager relevant requests (pending, ready for assignment, etc.)
      const itManagerRequests = allRequests.filter(request => 
        request.status === 'pending_it_manager' || 
        request.status === 'ready_for_assignment' || 
        request.status === 'access_granted' || 
        request.status === 'it_assigned' || 
        request.status === 'rejected'
      );
      
      setRequests(itManagerRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter requests
  useEffect(() => {
    let filtered = requests;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => request.status === filterStatus);
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.user_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [requests, filterStatus, searchTerm]);

  const handleApprove = async (requestId: number, data: any) => {
    try {
      await accessRequestService.approveRequest(requestId, data);
      
      // Refresh the entire list to get updated data
      await loadRequests();
      
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request. Please try again.');
    }
  };

  const handleReject = async (requestId: number, data: any) => {
    try {
      await accessRequestService.rejectRequest(requestId, data);
      
      // Refresh the entire list to get updated data
      await loadRequests();
      
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending_manager_approval':
        return 'text-yellow-600 bg-yellow-50';
      case 'pending_hod':
        return 'text-orange-600 bg-orange-50';
      case 'pending_it_manager':
        return 'text-blue-600 bg-blue-50';
      case 'ready_for_assignment':
        return 'text-green-600 bg-green-50';
      case 'granted':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending_manager_approval':
        return 'Pending Line Manager';
      case 'pending_hod':
        return 'Pending HOD';
      case 'pending_it_manager':
        return 'Pending IT Manager';
      case 'ready_for_assignment':
        return 'Ready for Assignment';
      case 'granted':
        return 'Granted';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  // Calculate stats
  const pendingCount = requests.filter(r => r.status === 'pending_it_manager').length;
  const readyCount = requests.filter(r => r.status === 'ready_for_assignment').length;
  const approvedCount = requests.filter(r => r.status === 'access_granted' || r.status === 'it_assigned').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F8F8]">
        <ITManagerLayout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ITManagerLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F8F8]">
      <ITManagerLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">Action completed successfully!</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">IT Manager Approvals</h2>
                <p className="text-sm text-gray-600 mt-1">Review and manage access requests</p>
              </div>
              <button 
                onClick={loadRequests}
                disabled={isLoading}
                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Approval</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-blue-600 font-medium">Awaiting review</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Ready for Assignment</p>
                    <p className="text-2xl font-bold text-gray-900">{readyCount}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">Ready to assign</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">Access granted</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-red-600 font-medium">Requests denied</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
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
                      <option value="pending_it_manager">Pending IT Manager</option>
                      <option value="ready_for_assignment">Ready for Assignment</option>
                      <option value="access_granted">Access Granted</option>
                      <option value="it_assigned">IT Assigned</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Requests List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-900">
                  Access Requests ({filteredRequests.length})
                </h3>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredRequests.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {filterStatus === 'pending_it_manager' ? 'No pending requests for IT Manager approval.' : 'No requests match your filters.'}
                    </p>
                  </div>
                ) : (
                  filteredRequests.map((request) => (
                    <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {request.user_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {request.department_name} • {request.role_name}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {request.user_email} • {new Date(request.submitted_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>

                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowApprovalModal(true);
                            }}
                            className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="text-sm font-medium">Review</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Approval Modal */}
        <ApprovalModal
          request={selectedRequest}
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedRequest(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </ITManagerLayout>
    </div>
  );
} 