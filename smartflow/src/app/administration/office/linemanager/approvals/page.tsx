"use client"
import React, { useState, useEffect } from 'react';
import LineManagerLayout from '../components/LineManagerLayout';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search, 
  Filter,
  AlertCircle,
  Shield,
  User,
  Building2,
  Calendar,
  Loader2
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

interface ApprovalHistory {
  id: number;
  request_id: number;
  approver_id: number;
  action: 'approve' | 'reject';
  comment?: string;
  approved_at: string;
  approver_name: string;
  approver_email: string;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ request, isOpen, onClose, onApprove, onReject }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');

  // Fetch approval history when modal opens
  useEffect(() => {
    if (isOpen && request) {
      fetchApprovalHistory();
    }
  }, [isOpen, request]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending_manager_approval':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending_hod':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'pending_it_manager':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'pending_it_review':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
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

  if (!request || !isOpen) return null;

  const fetchApprovalHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await accessRequestService.getRequestById(request.id);
      if (response.success && response.request.approval_history) {
        setApprovalHistory(response.request.approval_history);
      }
    } catch (error) {
      console.error('Error fetching approval history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSubmit = () => {
    if (action === 'approve') {
      handleApprove();
    } else {
      handleReject();
    }
  };

  const handleApprove = async () => {
    if (!user?.id) {
      console.error('User ID not found');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onApprove({
        approver_id: user.id,
        comment,
        approver_role: 'Line Manager'
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
      console.error('User ID not found');
      return;
    }
    
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setIsSubmitting(true);
    try {
      await onReject({
        approver_id: user.id,
        rejection_reason: rejectionReason,
        comment,
        approver_role: 'Line Manager'
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
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Line Manager Approval Decision</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Position in Workflow */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-sm font-medium text-blue-800">Current Position: Line Manager Review</h3>
            </div>
            <p className="text-sm text-blue-700 mt-1">You are reviewing this access request as the Line Manager in {request.department_name}</p>
          </div>

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
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-600 font-medium">Currently at: Line Manager Review</span>
                <span className="text-blue-600 ml-auto">You are here</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                <span className="text-gray-400">Next: HOD Review</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                <span className="text-gray-400">IT Manager Review</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                <span className="text-gray-400">IT Assignment</span>
              </div>
            </div>
          </div>

          {/* Request Details */}
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
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                {request.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Justification */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Justification for Access</h3>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{request.justification || 'No justification provided'}</p>
          </div>

          {/* Line Manager Decision */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-800 mb-3">Your Decision as Line Manager</h3>
            
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleReject}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 flex items-center"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Reject
          </button>
          
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-orange-500 transition-colors disabled:opacity-50 flex items-center"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

const LineManagerApprovalsPage: React.FC = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AccessRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchPendingRequests();
    }
  }, [user?.id]);

  useEffect(() => {
    const filtered = requests.filter(request => 
      request.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.department_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [requests, searchTerm]);

  const fetchPendingRequests = async () => {
    try {
      setIsLoading(true);
      
      const response = await accessRequestService.getPendingRequests({
        approver_id: user?.id, // Use user's ID as approver_id
        approver_role: 'Line Manager'
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

  const handleApprove = async (approvalData: ApprovalData) => {
    if (!selectedRequest) return;

    try {
      await accessRequestService.approveRequest(selectedRequest.id, approvalData);
      
      // Update the local state
      setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
      
      // Show success message
      alert('Request approved successfully!');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request. Please try again.');
    }
  };

  const handleReject = async (rejectionData: ApprovalData) => {
    if (!selectedRequest) return;

    try {
      await accessRequestService.rejectRequest(selectedRequest.id, rejectionData);
      
      // Update the local state
      setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
      
      // Show success message
      alert('Request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    }
  };

  const handleViewRequest = (request: AccessRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending_manager_approval':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <LineManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Pending Approvals</h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and approve access requests from your department: <span className="font-medium text-sky-600">{user?.department || 'Loading...'}</span>
            </p>
          </div>
        </div>

        {/* Department Info Card */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Building2 className="h-5 w-5 text-sky-600" />
            <div>
              <h3 className="font-medium text-sky-900">Department-Specific Approvals</h3>
              <p className="text-sm text-sky-700">
                You can only see and approve requests from users in your department: <span className="font-semibold">{user?.department || 'Loading...'}</span>
              </p>
            </div>
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
                <p className="text-lg font-semibold text-gray-900">Line Manager</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
            <p className="text-gray-500 mb-4">All access requests from your department have been reviewed.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Department Filter</span>
              </div>
              <p className="text-xs text-blue-700">
                You can only see requests from users in your department: <span className="font-semibold">{user?.department || 'Loading...'}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request, index) => (
                      <tr key={`${request.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{request.user_name}</div>
                          <div className="text-xs text-gray-500">{request.user_email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{request.department_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{request.role_name}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                            {request.status === 'pending_manager_approval' ? 'Pending' : request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(request.submitted_at)}</td>
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

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredRequests.map((request, index) => (
                <div 
                  key={`mobile-${request.id}-${index}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.user_name}</h3>
                        <p className="text-sm text-gray-500">{request.user_email}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {request.status === 'pending_manager_approval' ? 'Pending' : request.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{request.department_name}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Shield className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{request.role_name}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{formatDate(request.submitted_at)}</span>
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
    </LineManagerLayout>
  );
};

export default LineManagerApprovalsPage; 