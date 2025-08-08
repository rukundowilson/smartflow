"use client"
import React, { useEffect, useState } from 'react';
import HODLayout from '../components/HODLayout';
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Shield,
  Building2,
  Calendar,
  Loader2
} from 'lucide-react';
import systemAccessRequestService, {
  SystemAccessRequest as SARequest,
  ApprovalData as SAApprovalData
} from '@/app/services/systemAccessRequestService';
import { getSystemAccessRequestComments, Comment as AppComment } from '@/app/services/commentService';
import { useAuth } from '@/app/contexts/auth-context';

interface ApprovalModalProps {
  request: SARequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (approvalData: SAApprovalData) => void;
  onReject: (rejectionData: SAApprovalData) => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ request, isOpen, onClose, onApprove, onReject }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<AppComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const isReadOnly = request?.status !== 'hod_pending';

  useEffect(() => {
    if (isOpen && request) {
      (async () => {
        try {
          setIsLoadingComments(true);
          const res = await getSystemAccessRequestComments(request.id);
          if (res.success) setComments(res.comments);
        } finally {
          setIsLoadingComments(false);
        }
      })();
    }
  }, [isOpen, request]);

  if (!request || !isOpen) return null;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'request_pending':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'hod_pending':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'it_hod_pending':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'granted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleApprove = async () => {
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      await onApprove({ approver_id: user.id, comment, approver_role: 'HOD' });
      setComment('');
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!user?.id) return;
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setIsSubmitting(true);
    try {
      await onReject({ approver_id: user.id, rejection_reason: rejectionReason, comment, approver_role: 'HOD' });
      setRejectionReason('');
      setComment('');
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">HOD Approval Decision</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Position */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-orange-600 mr-2" />
              <h3 className="text-sm font-medium text-orange-800">Current Position: HOD Review</h3>
            </div>
            <p className="text-sm text-orange-700 mt-1">You are reviewing this system access request</p>
          </div>

          {/* Request Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Employee</h3>
              <p className="text-lg font-semibold text-gray-900">{request.user_name || 'Employee'}</p>
              <p className="text-sm text-gray-600">{request.user_email || ''}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">System</h3>
              <p className="text-lg font-semibold text-gray-900">{request.system_name}</p>
            </div>
          </div>

          {/* Request Timeline */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Request Timeline</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Request submitted</span>
                <span className="text-gray-400 ml-auto">{formatDate(request.submitted_at)}</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-gray-600 font-medium">Currently at: HOD Review</span>
                <span className="text-orange-600 ml-auto">You are here</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                <span className="text-gray-400">Next: IT HOD Review</span>
              </div>
            </div>
          </div>

          {/* Status & Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Access Period</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Start:</span> {formatDate(request.start_date)}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">End:</span> {formatDate(request.end_date)}
                </p>
                <p className="text-sm text-gray-600">
                  {request.is_permanent ? 'Permanent access' : 'Temporary access'}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Request Status</h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                {request.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Comments (after decision) */}
          {isReadOnly && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Comments</h3>
              {isLoadingComments ? (
                <div className="text-sm text-gray-500">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="text-sm text-gray-500">No comments</div>
              ) : (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{c.commented_by_name}</span>
                        <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* HOD Decision */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-800 mb-3">Your Decision as HOD</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Comment (Optional)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  placeholder="Add your comment about this request..."
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (Required if rejecting)
                </label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  placeholder="Provide a reason for rejection..."
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          {!isReadOnly && (
            <button
              onClick={handleReject}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject
            </button>
          )}
          {!isReadOnly && (
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function HODRequestsPage() {
  const [requests, setRequests] = useState<SARequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SARequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SARequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchPendingRequests();
    }
  }, [user?.id]);

  useEffect(() => {
    const filtered = requests.filter(request =>
      (request.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.user_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.system_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [requests, searchTerm]);

  const fetchPendingRequests = async () => {
    try {
      setIsLoading(true);
      const response = await systemAccessRequestService.getPending({
        approver_id: user?.id!,
        approver_role: 'HOD'
      });
      if (response.success) {
        setRequests(response.requests);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (approvalData: SAApprovalData) => {
    if (!selectedRequest) return;
    try {
      const res = await systemAccessRequestService.approve(selectedRequest.id, approvalData);
      await fetchPendingRequests();
      setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
      setSelectedRequest(prev => prev ? { ...prev, status: res?.next_status || 'it_hod_pending', hod_at: new Date().toISOString() } as SARequest : prev);
      alert('Request approved successfully!');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request. Please try again.');
    }
  };

  const handleReject = async (rejectionData: SAApprovalData) => {
    if (!selectedRequest) return;
    try {
      await systemAccessRequestService.reject(selectedRequest.id, rejectionData);
      await fetchPendingRequests();
      setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
      setSelectedRequest(prev => prev ? { ...prev, status: 'rejected', hod_at: new Date().toISOString() } as SARequest : prev);
      alert('Request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    }
  };

  const handleViewRequest = (request: SARequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'request_pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'hod_pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'it_hod_pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'granted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <HODLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Pending Approvals</h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and approve system access requests in your department.
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Department</p>
                <p className="text-lg font-semibold text-gray-900">{user?.department || 'Loading...'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Your Role</p>
                <p className="text-lg font-semibold text-gray-900">Head of Department</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full"
              />
            </div>
          </div>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
            <p className="text-gray-500 mb-4">All system access requests have been reviewed.</p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Department Filter</span>
              </div>
              <p className="text-xs text-orange-700">
                You can only see requests from users in your department.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request, index) => (
                      <tr key={`${request.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{request.user_name || 'Employee'}</div>
                          <div className="text-xs text-gray-500">{request.user_email || ''}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{request.system_name}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusChipColor(request.status)}`}>
                            {request.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(request.submitted_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleViewRequest(request)}
                            className="p-1 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {filteredRequests.map((request, index) => (
                <div key={`mobile-${request.id}-${index}`} className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.user_name || 'Employee'}</h3>
                        <p className="text-sm text-gray-500">{request.user_email || ''}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusChipColor(request.status)}`}>
                        {request.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{request.system_name}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{new Date(request.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewRequest(request)}
                        className="p-2 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && selectedRequest && (
          <ApprovalModal
            request={selectedRequest}
            isOpen={isModalOpen}
            onClose={closeModal}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </div>
    </HODLayout>
  );
}