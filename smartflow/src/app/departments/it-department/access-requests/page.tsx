"use client"
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Package, 
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
  User,
  Building,
  Key,
  Filter,
  Search,
  MessageSquare,
  Loader2,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  FileText,
  Check,
  X
} from 'lucide-react';
import accessRequestService, { AccessRequest } from '@/app/services/accessRequestService';
import { useAuth } from '@/app/contexts/auth-context';
import NavBar from '../components/navbar';
import Sidebar from '../components/sidebar';

interface ApprovalModalProps {
  request: AccessRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (requestId: number, comment: string) => void;
  onReject: (requestId: number, reason: string, comment: string) => void;
  onAssign: (requestId: number, assignmentType: 'auto' | 'manual', assignedUserId?: number, comment?: string) => void;
  isProcessing: boolean;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onAssign,
  isProcessing
}) => {
  const [action, setAction] = useState<'approve' | 'reject' | 'assign'>('approve');
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [assignmentType, setAssignmentType] = useState<'auto' | 'manual'>('auto');
  const [assignedUserId, setAssignedUserId] = useState<number | undefined>(undefined);

  if (!isOpen || !request) return null;

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(request.id, comment);
    } else if (action === 'reject') {
      onReject(request.id, rejectionReason, comment);
    } else if (action === 'assign') {
      onAssign(request.id, assignmentType, assignedUserId, comment);
    }
  };

  const canApprove = request.status === 'pending_it_review';
  const canReject = request.status === 'pending_it_review';
  const canAssign = request.status === 'ready_for_assignment';
  const isReadOnly = request.status === 'access_granted' || request.status === 'it_assigned' || request.status === 'rejected';

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending_manager_approval':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending_hod':
        return <Shield className="h-4 w-4 text-orange-600" />;
      case 'pending_it_manager':
        return <Building className="h-4 w-4 text-blue-600" />;
      case 'pending_it_review':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'ready_for_assignment':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'granted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
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
      case 'pending_it_review':
        return 'text-purple-600 bg-purple-50';
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
      case 'pending_it_review':
        return 'Pending IT Review';
      case 'ready_for_assignment':
        return 'Ready for Assignment';
      case 'access_granted':
        return 'Access Granted';
      case 'it_assigned':
        return 'IT Assigned';
      case 'granted':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {isReadOnly ? 'Request Details' : 'IT Manager Review'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Request Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Request Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Request ID:</span>
                <span className="font-semibold text-gray-900">#{request.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">User:</span>
                <span className="font-semibold text-gray-900">{request.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Email:</span>
                <span className="font-semibold text-gray-900">{request.user_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Department:</span>
                <span className="font-semibold text-gray-900">{request.department_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Requested Role:</span>
                <span className="font-semibold text-gray-900">{request.role_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Submitted:</span>
                <span className="font-semibold text-gray-900">{new Date(request.submitted_at).toLocaleDateString()}</span>
              </div>
              </div>
            </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-600" />
              Current Status
            </h3>
            <div className="space-y-4">
              <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                <span className="ml-2">{getStatusText(request.status)}</span>
              </div>
              {request.approved_at && (
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Approved:</span>
                  <span className="ml-2 font-semibold text-gray-900">{new Date(request.approved_at).toLocaleDateString()}</span>
                </div>
                )}
                {request.rejection_reason && (
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Rejection Reason:</span>
                  <span className="ml-2 font-semibold text-gray-900">{request.rejection_reason}</span>
                </div>
                )}
            </div>
          </div>
        </div>

        {/* Justification */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-600" />
            Justification
          </h3>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <p className="text-gray-700 leading-relaxed">{request.justification}</p>
          </div>
        </div>

        {/* Approval Comments */}
        {request.approval_history && request.approval_history.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-gray-600" />
              Approval History
            </h3>
            <div className="space-y-3">
              {request.approval_history.map((history, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{history.approver_name}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                      history.action === 'approve' 
                        ? 'text-green-600 bg-green-50' 
                        : 'text-red-600 bg-red-50'
                    }`}>
                      {history.action === 'approve' ? 'Approved' : 'Rejected'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(history.approved_at).toLocaleDateString()} at {new Date(history.approved_at).toLocaleTimeString()}
                  </p>
                  {history.comment && (
                    <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border">
                      "{history.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Selection - Only show for pending requests */}
        {!isReadOnly && (
          <div className="mb-8">
                      <div className="flex space-x-4 mb-6">
            {canApprove && (
              <button
                onClick={() => setAction('approve')}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  action === 'approve'
                    ? 'bg-green-100 text-green-700 border-2 border-green-300 shadow-sm'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                }`}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Approve Request
              </button>
            )}
            {canReject && (
              <button
                onClick={() => setAction('reject')}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  action === 'reject'
                    ? 'bg-red-100 text-red-700 border-2 border-red-300 shadow-sm'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                }`}
              >
                <XCircle className="h-5 w-5 mr-2" />
                Reject Request
              </button>
            )}
            {canAssign && (
              <button
                onClick={() => setAction('assign')}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  action === 'assign'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 shadow-sm'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                }`}
              >
                <Users className="h-5 w-5 mr-2" />
                Assign Access
              </button>
            )}
          </div>

            {action === 'approve' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Approval Comment (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment about this approval..."
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
                  rows={3}
                />
              </div>
            ) : action === 'reject' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Rejection Reason *
                  </label>
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="insufficient_justification">Insufficient Justification</option>
                    <option value="role_not_appropriate">Role Not Appropriate</option>
                    <option value="security_concerns">Security Concerns</option>
                    <option value="department_mismatch">Department Mismatch</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Additional Comments (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Provide additional details about the rejection..."
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            ) : action === 'assign' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Assignment Type *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="auto"
                        checked={assignmentType === 'auto'}
                        onChange={(e) => setAssignmentType(e.target.value as 'auto' | 'manual')}
                        className="mr-2"
                      />
                      <span className="text-sm">Auto-assign to requesting user</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="manual"
                        checked={assignmentType === 'manual'}
                        onChange={(e) => setAssignmentType(e.target.value as 'auto' | 'manual')}
                        className="mr-2"
                      />
                      <span className="text-sm">Manually assign to specific user</span>
                    </label>
                  </div>
                </div>
                
                {assignmentType === 'manual' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Assign to User ID *
                    </label>
                    <input
                      type="number"
                      value={assignedUserId || ''}
                      onChange={(e) => setAssignedUserId(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Enter user ID"
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Assignment Comment (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment about this assignment..."
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            {isReadOnly ? 'Close' : 'Cancel'}
          </button>
          {!isReadOnly && (
            <button
              onClick={handleSubmit}
              disabled={isProcessing || (action === 'reject' && !rejectionReason) || (action === 'assign' && assignmentType === 'manual' && !assignedUserId)}
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
                action === 'approve'
                  ? 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300 shadow-lg hover:shadow-xl'
                  : action === 'reject'
                  ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300 shadow-lg hover:shadow-xl'
                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 shadow-lg hover:shadow-xl'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  {action === 'approve' ? <Check className="h-5 w-5 mr-2" /> : action === 'reject' ? <X className="h-5 w-5 mr-2" /> : <Users className="h-5 w-5 mr-2" />}
                  {action === 'approve' ? 'Approve Request' : action === 'reject' ? 'Reject Request' : 'Assign Access'}
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ITDepartmentAccessRequestsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { user } = useAuth();

  // Load requests
  const loadRequests = async () => {
    try {
      setIsLoading(true);
      console.log('Loading IT department requests for user:', user?.id);
      
      // Get all requests and filter for IT-related ones
      const allRequests = await accessRequestService.getAllRequests();
      
      console.log('All requests:', allRequests);
      
      // Filter to show only IT-related requests (pending review, ready for assignment, etc.)
      const itRequests = allRequests.filter(request => 
        request.status === 'pending_it_review' || 
        request.status === 'ready_for_assignment' || 
        request.status === 'access_granted' || 
        request.status === 'it_assigned' || 
        request.status === 'rejected'
      );
      
      console.log('IT Department requests:', itRequests);
      setRequests(itRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Filter requests
  useEffect(() => {
    let filtered = requests;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => {
        if (filterStatus === 'pending') return request.status === 'pending_it_review';
        if (filterStatus === 'ready') return request.status === 'ready_for_assignment';
        if (filterStatus === 'approved') return request.status === 'access_granted' || request.status === 'it_assigned';
        if (filterStatus === 'rejected') return request.status === 'rejected';
        return true;
      });
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.department_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.user_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [requests, filterStatus, searchTerm]);

  const handleViewRequest = async (request: AccessRequest) => {
    try {
      // Fetch the request with approval history
      const response = await accessRequestService.getRequestById(request.id);
      if (response.success) {
        setSelectedRequest(response.request);
      } else {
        setSelectedRequest(request);
      }
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching request details:', error);
      setSelectedRequest(request);
      setIsModalOpen(true);
    }
  };

  const handleApprove = async (requestId: number, comment: string) => {
    if (!user?.id) return;
    
    setIsProcessing(true);
    try {
      await accessRequestService.approveRequest(requestId, {
        approver_id: user.id,
        comment,
        approver_role: 'IT Support'
      });
      
      // Close the modal first
      setIsModalOpen(false);
      setSelectedRequest(null);
      
      // Refresh the entire list to get updated data
      await loadRequests();
      
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
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
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' as const, rejection_reason: reason }
          : req
      ));
      
      setIsModalOpen(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssign = async (requestId: number, assignmentType: 'auto' | 'manual', assignedUserId?: number, comment?: string) => {
    if (!user?.id) return;
    
    setIsProcessing(true);
    try {
      await accessRequestService.assignRequest(requestId, {
        approver_id: user.id,
        assignment_type: assignmentType,
        assigned_user_id: assignedUserId,
        comment
      });
      
      // Close the modal first
      setIsModalOpen(false);
      setSelectedRequest(null);
      
      // Refresh the entire list to get updated data
      await loadRequests();
      
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error assigning request:', error);
      alert('Failed to assign request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending_manager_approval':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending_hod':
        return <Shield className="h-4 w-4 text-orange-600" />;
      case 'pending_it_manager':
        return <Building className="h-4 w-4 text-blue-600" />;
      case 'pending_it_review':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'ready_for_assignment':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'granted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
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
      case 'pending_it_review':
        return 'text-purple-600 bg-purple-50';
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
      case 'pending_it_review':
        return 'Pending IT Review';
      case 'ready_for_assignment':
        return 'Ready for Assignment';
      case 'access_granted':
        return 'Access Granted';
      case 'it_assigned':
        return 'IT Assigned';
      case 'granted':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending_it_review').length;
  const readyCount = requests.filter(r => r.status === 'ready_for_assignment').length;
  const approvedCount = requests.filter(r => r.status === 'access_granted' || r.status === 'it_assigned').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;
  const totalCount = requests.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F8F8] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-sky-600" />
          <p className="text-gray-600">Loading access requests...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <NavBar/>
    <div className="min-h-screen bg-[#F0F8F8]">
      
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-in slide-in-from-right">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Action completed successfully!</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex">
        <Sidebar/>
        <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">IT Department Access Requests</h1>
                <p className="text-gray-600">Review and manage access requests for IT department</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadRequests}
                  className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>



        {/* Enhanced Filters Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Enhanced Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by employee, department, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                />
              </div>

                {/* Enhanced Status Filter */}
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Filter by:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                  >
                    <option value="all">All Requests ({totalCount})</option>
                    <option value="pending">Pending Review ({pendingCount})</option>
                    <option value="ready">Ready for Assignment ({readyCount})</option>
                    <option value="approved">Approved ({approvedCount})</option>
                    <option value="rejected">Rejected ({rejectedCount})</option>
                  </select>
                </div>
            </div>
          </div>
        </div>

          {/* Requests Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Access Requests</h3>
          </div>
          
          {filteredRequests.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-500">There are no access requests matching your current filters.</p>
            </div>
          ) : (
              <div className="divide-y divide-gray-100">
                  {filteredRequests.map((request) => (
                  <div key={request.id} className="p-6 hover:bg-gray-50 transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          </div>
                          <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{request.user_name}</h4>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                #{request.id}
                              </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1">{getStatusText(request.status)}</span>
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                              <span className="font-medium text-gray-600">Email:</span>
                              <span className="ml-2 text-gray-900">{request.user_email}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Department:</span>
                              <span className="ml-2 text-gray-900">{request.department_name}</span>
                          </div>
                          <div>
                              <span className="font-medium text-gray-600">Role:</span>
                              <span className="ml-2 text-gray-900">{request.role_name}</span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="font-medium text-gray-600">Justification:</span>
                            <p className="mt-1 text-gray-700 leading-relaxed">{request.justification}</p>
                        </div>
                          <div className="mt-3 text-xs text-gray-500">
                            Submitted: {new Date(request.submitted_at).toLocaleDateString()} at {new Date(request.submitted_at).toLocaleTimeString()}
                        </div>
                        </div>
                        </div>
                      <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleViewRequest(request)}
                          className="flex items-center px-4 py-2 text-sm font-medium text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-all duration-200"
                          >
                          <Eye className="h-4 w-4 mr-2" />
                            Review
                          </button>
                        </div>
                    </div>
                  </div>
                  ))}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {isModalOpen && (
        <ApprovalModal
          request={selectedRequest}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onApprove={handleApprove}
          onReject={handleReject}
          onAssign={handleAssign}
          isProcessing={isProcessing}
        />
      )}
                       
      </div>
    </div>

      

      
    </div>
    </>
  );
}
