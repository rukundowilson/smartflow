"use client"
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Shield, Building2, User, X, AlertCircle } from 'lucide-react';
import accessRequestService, { AccessRequest } from '../../../services/accessRequestService';
import ITManagerLayout from './components/ITManagerLayout';



interface ApprovalModalProps {
  request: AccessRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (requestId: number, data: any) => void;
  onReject: (requestId: number, data: any) => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ request, isOpen, onClose, onApprove, onReject }) => {
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
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'pending_hod':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'pending_it_manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ready_for_assignment':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'granted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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

  const handleApprove = async () => {
    if (!comment.trim()) {
      alert('Please provide a comment for approval.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onApprove(request.id, {
        approver_id: 27, // Sami IT Manager
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
        approver_id: 27, // Sami IT Manager
        rejection_reason: rejectionReason,
        comment
      });
      setRejectionReason('');
      setComment('');
      onClose();
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">IT Manager Review - Access Request</h2>
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
              <h3 className="text-sm font-medium text-gray-500">System</h3>
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
                <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                  {getStatusText(request.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Justification */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Justification</h3>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add your approval comment..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Provide a reason for rejection..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Add any additional comments..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
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
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const response = await accessRequestService.getPendingRequests({
        approver_id: 27, // Sami IT Manager
        approver_role: 'IT Manager'
      });
      
      if (response.success) {
        setRequests(response.requests);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter requests
  useEffect(() => {
    let filtered = requests;

    // Filter by tab (since we only have pending_it_manager requests, most will be in pending tab)
    if (activeTab !== 'all') {
      filtered = filtered.filter(request => {
        if (activeTab === 'pending') return request.status === 'pending_it_manager';
        if (activeTab === 'ready') return request.status === 'ready_for_assignment';
        if (activeTab === 'approved') return request.status === 'granted';
        if (activeTab === 'rejected') return request.status === 'rejected';
        return true;
      });
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
  }, [requests, activeTab, searchTerm]);

  const handleApprove = async (requestId: number, data: any) => {
    try {
      await accessRequestService.approveRequest(requestId, data);
      
      // Update the request in the list
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'ready_for_assignment' as any }
          : req
      ));
      
      alert('Request approved successfully! Ready for assignment.');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request. Please try again.');
    }
  };

  const handleReject = async (requestId: number, data: any) => {
    try {
      await accessRequestService.rejectRequest(requestId, data);
      
      // Update the request in the list
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' as any }
          : req
      ));
      
      alert('Request rejected successfully.');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    }
  };

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
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'pending_hod':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'pending_it_manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ready_for_assignment':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'granted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading IT Manager dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ITManagerLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">IT Manager Approvals</h1>
          <p className="mt-2 text-gray-600">Review and approve access requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Approval</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {requests.filter(r => r.status === 'pending_it_manager').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ready for Assignment</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {requests.filter(r => r.status === 'ready_for_assignment').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {requests.filter(r => r.status === 'granted').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {requests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex space-x-4 mb-4 sm:mb-0">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'pending' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setActiveTab('ready')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'ready' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Ready for Assignment
                </button>
                <button
                  onClick={() => setActiveTab('approved')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'approved' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setActiveTab('rejected')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'rejected' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Rejected
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Access Requests ({filteredRequests.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredRequests.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'pending' ? 'No pending requests for IT Manager approval.' : 'No requests match your filters.'}
                </p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {request.user_name} - {request.department_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.role_name} • {request.user_email}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Submitted: {new Date(request.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>

                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowApprovalModal(true);
                        }}
                        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
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
  );
} 