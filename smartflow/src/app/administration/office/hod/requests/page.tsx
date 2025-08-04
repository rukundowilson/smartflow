"use client"
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  Loader2,
  User,
  Building,
  Calendar
} from 'lucide-react';
import HODLayout from '../components/HODLayout';
import accessRequestService, { AccessRequest } from '@/app/services/accessRequestService';
import { useAuth } from '@/app/contexts/auth-context';

interface ApprovalModalProps {
  request: AccessRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (requestId: number, comment: string) => void;
  onReject: (requestId: number, reason: string, comment: string) => void;
  isProcessing: boolean;
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

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isProcessing
}) => {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch approval history when modal opens
  useEffect(() => {
    if (isOpen && request) {
      fetchApprovalHistory();
    }
  }, [isOpen, request]);

  if (!isOpen || !request) return null;

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
      onApprove(request.id, comment);
    } else {
      onReject(request.id, rejectionReason, comment);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending_hod':
        return 'bg-orange-50 text-orange-700 border-orange-200';
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
      case 'pending_hod':
        return 'Pending HOD Approval';
      case 'granted':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                HOD Review - Access Request
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Review and make decision on access request
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Request Details */}
            <div className="space-y-6">
              {/* Current Position */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="text-sm font-medium text-blue-800">Current Position: HOD Review</h4>
                </div>
                <p className="text-sm text-blue-700 mt-1">You are reviewing this access request as the Head of Department</p>
              </div>

              {/* Request Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Request Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Employee</p>
                    <p className="text-sm text-gray-900">{request.user_name}</p>
                    <p className="text-xs text-gray-600">{request.user_email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Department & Role</p>
                    <p className="text-sm text-gray-900">{request.department_name}</p>
                    <p className="text-xs text-gray-600">{request.role_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Access Period</p>
                    <p className="text-sm text-gray-900">
                      {new Date(request.start_date).toLocaleDateString()} - {request.end_date ? new Date(request.end_date).toLocaleDateString() : 'Permanent'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {request.is_permanent ? 'Permanent access' : 'Temporary access'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Justification */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Justification for Access</h4>
                <p className="text-sm text-gray-900 bg-white p-3 rounded border">
                  {request.justification || 'No justification provided'}
                </p>
              </div>
            </div>

            {/* Right Column - Approval History & Decision */}
            <div className="space-y-6">
              {/* Approval History */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Approval History</h4>
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-500 ml-2">Loading history...</span>
                  </div>
                ) : approvalHistory.length > 0 ? (
                  <div className="space-y-3">
                    {approvalHistory.map((approval, index) => (
                      <div key={approval.id} className="bg-white rounded border p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            {approval.action === 'approve' ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {approval.approver_name}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            approval.action === 'approve' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {approval.action === 'approve' ? 'Approved' : 'Rejected'}
                          </span>
                        </div>
                        {approval.comment && (
                          <p className="text-xs text-gray-600 mb-1">
                            "{approval.comment}"
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(approval.approved_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No approval history available</p>
                  </div>
                )}
              </div>

              {/* HOD Decision */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-orange-800 mb-3">Your Decision as HOD</h4>
                
                <div className="space-y-4">
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setAction('approve')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        action === 'approve'
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setAction('reject')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        action === 'reject'
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}
                    >
                      Reject
                    </button>
                  </div>

                  {/* Rejection Reason */}
                  {action === 'reject' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason (Required)
                      </label>
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Enter rejection reason..."
                      />
                    </div>
                  )}

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Comment (Optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Add your comment about this request..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isProcessing || (action === 'reject' && !rejectionReason.trim())}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                action === 'approve'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              } disabled:opacity-50`}
            >
              {isProcessing ? 'Processing...' : action === 'approve' ? 'Approve Request' : 'Reject Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HODRequestsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      // Get all requests for HOD (pending, approved, and rejected)
      const response = await accessRequestService.getApprovalHistory(user?.id || 0);
      
      if (response.success) {
        setRequests(response.requests);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadRequests();
    }
  }, [user?.id]);

  // Filter requests
  useEffect(() => {
    let filtered = requests;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(request => {
        if (activeTab === 'pending') return request.status === 'pending_hod';
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

  const handleViewRequest = (request: AccessRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleApprove = async (requestId: number, comment: string) => {
    if (!user?.id) return;
    
    setIsProcessing(true);
    try {
      await accessRequestService.approveRequest(requestId, {
        approver_id: user.id,
        comment
      });
      
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'granted' as const }
          : req
      ));
      
      setIsModalOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (requestId: number, reason: string, comment: string) => {
    if (!user?.id) return;
    
    setIsProcessing(true);
    try {
      await accessRequestService.rejectRequest(requestId, {
        approver_id: user.id,
        rejection_reason: reason,
        comment
      });
      
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' as const, rejection_reason: reason }
          : req
      ));
      
      setIsModalOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending_hod':
        return 'bg-orange-50 text-orange-700 border-orange-200';
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
      case 'pending_hod':
        return 'Pending HOD';
      case 'granted':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending_hod').length;
  const approvedCount = requests.filter(r => r.status === 'granted').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <HODLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Access Requests</h1>
          <p className="text-gray-600">Review and manage access requests</p>
        </div>

        {/* Clean Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-semibold text-gray-900">{requests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-semibold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-xl font-semibold text-gray-900">{approvedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-xl font-semibold text-gray-900">{rejectedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {[
                { id: 'all', label: 'All', count: requests.length },
                { id: 'pending', label: 'Pending', count: pendingCount },
                { id: 'approved', label: 'Approved', count: approvedCount },
                { id: 'rejected', label: 'Rejected', count: rejectedCount }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Requests Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500">No access requests match your current filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department & Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{request.user_name}</p>
                              <p className="text-sm text-gray-500">{request.user_email}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{request.department_name}</span>
                          </div>
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{request.role_name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {new Date(request.submitted_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleViewRequest(request)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ApprovalModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        isProcessing={isProcessing}
      />
    </HODLayout>
  );
}