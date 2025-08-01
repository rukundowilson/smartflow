"use client"
import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Eye, 
  Clock, 
  User, 
  Building2, 
  Shield,
  Loader2,
  MessageSquare
} from 'lucide-react';
import accessRequestService, { AccessRequest, ApproveRequestData, RejectRequestData } from '@/app/services/accessRequestService';
import { useAuth } from '@/app/contexts/auth-context';

const AccessRequestApproval = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    setIsLoading(true);
    try {
      const response = await accessRequestService.getPendingAccessRequests();
      if (response.success) {
        setPendingRequests(response.requests);
      }
    } catch (error) {
      console.error('Error loading pending requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRequest = (request: AccessRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
    setComment('');
    setRejectionReason('');
  };

  const handleAction = async () => {
    if (!selectedRequest || !user?.id) return;

    setIsProcessing(true);
    try {
      if (action === 'approve') {
        const approveData: ApproveRequestData = {
          approver_id: user.id,
          comment: comment || undefined
        };
        await accessRequestService.approveAccessRequest(selectedRequest.id, approveData);
      } else {
        const rejectData: RejectRequestData = {
          approver_id: user.id,
          rejection_reason: rejectionReason,
          comment: comment || undefined
        };
        await accessRequestService.rejectAccessRequest(selectedRequest.id, rejectData);
      }

      alert(`Request ${action}d successfully!`);
      setShowModal(false);
      setSelectedRequest(null);
      loadPendingRequests(); // Refresh the list
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      alert(`Failed to ${action} request. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_manager_approval': return 'bg-yellow-100 text-yellow-800';
      case 'pending_system_owner': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending_manager_approval': return 'Pending Manager';
      case 'pending_system_owner': return 'Pending System Owner';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading pending requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Request Approvals</h1>
          <p className="text-gray-600">Review and approve pending access requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Manager</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingRequests.filter(r => r.status === 'pending_manager_approval').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending System Owner</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingRequests.filter(r => r.status === 'pending_system_owner').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
              </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.user_name}</div>
                        <div className="text-sm text-gray-500">{request.user_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.system_name}</div>
                        <div className="text-sm text-gray-500">{request.role_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(request.start_date).toLocaleDateString()}
                        {request.is_permanent ? (
                          <div className="text-xs text-green-600">Permanent</div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            to {request.end_date ? new Date(request.end_date).toLocaleDateString() : 'TBD'}
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
                      {new Date(request.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewRequest(request)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {pendingRequests.length === 0 && (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                All access requests have been processed.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Review Access Request</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Request Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Requestor</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{selectedRequest.user_name}</p>
                    <p className="text-sm text-gray-500">{selectedRequest.user_email}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">System & Role</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{selectedRequest.system_name}</p>
                    <p className="text-sm text-gray-500">{selectedRequest.role_name}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Access Period</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">
                      {new Date(selectedRequest.start_date).toLocaleDateString()}
                      {selectedRequest.is_permanent ? ' - Permanent' : 
                        selectedRequest.end_date ? ` to ${new Date(selectedRequest.end_date).toLocaleDateString()}` : ' - TBD'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                      {formatStatus(selectedRequest.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Justification */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Justification</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm">{selectedRequest.justification}</p>
                </div>
              </div>

              {/* Action Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Action</h3>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="approve"
                      checked={action === 'approve'}
                      onChange={(e) => setAction(e.target.value as 'approve' | 'reject')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Approve</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="reject"
                      checked={action === 'reject'}
                      onChange={(e) => setAction(e.target.value as 'approve' | 'reject')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Reject</span>
                  </label>
                </div>
              </div>

              {/* Rejection Reason */}
              {action === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Explain why this request is being rejected..."
                    required
                  />
                </div>
              )}

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any additional comments..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={isProcessing || (action === 'reject' && !rejectionReason)}
                  className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 ${
                    action === 'approve' 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : action === 'approve' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  {isProcessing ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessRequestApproval; 