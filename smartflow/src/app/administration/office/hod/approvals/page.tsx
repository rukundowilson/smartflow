"use client"
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
  User,
  Building,
  Key,
  TrendingUp,
  Activity,
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X
} from 'lucide-react';
import accessRequestService, { AccessRequest, ApprovalData } from '@/app/services/accessRequestService';
import { useAuth } from '@/app/contexts/auth-context';

interface ApprovalModalProps {
  request: AccessRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (approvalData: ApprovalData) => void;
  onReject: (rejectionData: ApprovalData) => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ request, isOpen, onClose, onApprove, onReject }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!request || !isOpen) return null;

  const handleApprove = async () => {
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onApprove({
        approver_id: user.id, // Use current user's ID
        comment,
        approver_role: 'HOD'
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
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }
    
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setIsSubmitting(true);
    try {
      await onReject({
        approver_id: user.id, // Use current user's ID
        rejection_reason: rejectionReason,
        comment,
        approver_role: 'HOD'
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">HOD Review - Access Request</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Request Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Employee</h3>
              <p className="text-lg font-semibold text-gray-900">{request.user_name}</p>
              <p className="text-sm text-gray-600">{request.user_email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Department & Role</h3>
              <p className="text-lg font-semibold text-gray-900">{request.department_name}</p>
              <p className="text-sm text-gray-600">{request.role_name}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Justification</h3>
            <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{request.justification}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Access Period</h3>
              <p className="text-gray-900">
                {new Date(request.start_date).toLocaleDateString()}
                {request.is_permanent ? (
                  <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Permanent</span>
                ) : (
                  <span className="ml-2 text-sm text-gray-600">
                    to {request.end_date ? new Date(request.end_date).toLocaleDateString() : 'TBD'}
                  </span>
                )}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Submitted</h3>
              <p className="text-gray-900">{new Date(request.submitted_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Approval Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Add a comment about this request..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason (Required if rejecting)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Provide a reason for rejection..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Rejecting...' : 'Reject'}
            </button>
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Approving...' : 'Approve'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HODApprovalsDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Load all pending requests that HOD can approve
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setIsLoading(true);
        const response = await accessRequestService.getPendingRequests({
          approver_id: user?.id, // Use current user's ID
          approver_role: 'HOD'
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

    loadRequests();
  }, []);

  const handleApprove = async (approvalData: ApprovalData) => {
    if (!selectedRequest) return;
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }
    
    try {
      await accessRequestService.approveRequest(selectedRequest.id, {
        ...approvalData,
        approver_id: user.id // Use current user's ID
      });
      
      // Update the request in the list
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: 'granted' as any }
          : req
      ));
      
      alert('Request approved successfully! Access granted.');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  const handleReject = async (rejectionData: ApprovalData) => {
    if (!selectedRequest) return;
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }
    
    try {
      await accessRequestService.rejectRequest(selectedRequest.id, {
        ...rejectionData,
        approver_id: user.id // Use current user's ID
      });
      
      // Update the request in the list
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: 'rejected' as any }
          : req
      ));
      
      alert('Request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_hod': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pending_it_manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'granted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_hod': return Shield;
      case 'pending_it_manager': return Building;
      case 'granted': return CheckCircle;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending_hod': return 'Pending HOD';
      case 'pending_it_manager': return 'Pending IT Manager';
      case 'granted': return 'Granted';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HOD approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">HOD Approvals</h1>
          <p className="text-gray-600 mt-2">Review access requests approved by Line Managers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending HOD Approval</p>
                <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
              </div>
              <div className="p-3 bg-orange-500 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Pending HOD Reviews</h2>
          </div>

          {requests.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending HOD approvals</h3>
              <p className="text-gray-500">All requests have been processed or are still with Line Managers</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {requests.map((request) => {
                const StatusIcon = getStatusIcon(request.status);
                return (
                  <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{request.user_name}</h3>
                            <p className="text-sm text-gray-500">{request.user_email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                          <StatusIcon className="h-3 w-3" />
                          {formatStatus(request.status)}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowApprovalModal(true);
                          }}
                          className="px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          Review
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Department</h3>
                        <p className="text-lg font-semibold text-gray-900">{request.department_name}</p>
                        <p className="text-xs text-gray-500">{request.department_description}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Role</p>
                        <p className="text-gray-900">{request.role_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Submitted</p>
                        <p className="text-gray-900">{new Date(request.submitted_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Justification</p>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{request.justification}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
    </div>
  );
};

export default HODApprovalsDashboard; 