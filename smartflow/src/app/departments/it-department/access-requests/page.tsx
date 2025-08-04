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
  Menu
} from 'lucide-react';
import accessRequestService, { AccessRequest, ApprovalHistory } from '@/app/services/accessRequestService';
import { useAuth } from '@/app/contexts/auth-context';
import NavBar from "../components/navbar";
import SideBar from "../components/sidebar";

interface ApprovalModalProps {
  request: AccessRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (requestId: number, comment: string) => void;
  onReject: (requestId: number, reason: string, comment: string) => void;
  isProcessing: boolean;
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

  const fetchApprovalHistory = async () => {
    if (!request) return;
    
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

  if (!isOpen || !request) return null;

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(request.id, comment);
    } else {
      onReject(request.id, rejectionReason, comment);
    }
  };

  const canApprove = request.status === 'pending_it_review';
  const canReject = request.status === 'pending_it_review';
  const isApproved = request.status === 'ready_for_assignment' || request.status === 'granted';
  const isRejected = request.status === 'rejected';

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending_manager_approval':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'pending_hod':
        return <Shield className="h-4 w-4 text-orange-500" />;
      case 'pending_it_manager':
        return <Building className="h-4 w-4 text-blue-500" />;
      case 'pending_it_review':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'ready_for_assignment':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'granted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
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
      case 'pending_it_review':
        return 'bg-purple-50 text-purple-700 border-purple-200';
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
      case 'pending_it_review':
        return 'Pending IT Review';
      case 'ready_for_assignment':
        return 'Ready for Assignment';
      case 'granted':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isApproved ? 'Approved Access Request' : 
             isRejected ? 'Rejected Access Request' : 
             'Review Access Request'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Request Details */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Request Details</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Request ID:</span> #{request.id}</div>
                <div><span className="font-medium">User:</span> {request.user_name}</div>
                <div><span className="font-medium">Email:</span> {request.user_email}</div>
                <div><span className="font-medium">Department:</span> {request.department_name}</div>
                <div><span className="font-medium">Requested Role:</span> {request.role_name}</div>
                <div><span className="font-medium">Justification:</span> {request.justification}</div>
                <div><span className="font-medium">Submitted:</span> {new Date(request.submitted_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Current Status</h3>
              <div className="space-y-2 text-sm">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="ml-1">{getStatusText(request.status)}</span>
                </div>
                {request.approved_at && (
                  <div><span className="font-medium">Approved:</span> {new Date(request.approved_at).toLocaleDateString()}</div>
                )}
                {request.rejection_reason && (
                  <div><span className="font-medium">Rejection Reason:</span> {request.rejection_reason}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Approval History */}
        {approvalHistory.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Approval History</h3>
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="space-y-3">
                {approvalHistory.map((approval, index) => (
                  <div key={approval.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                    <div className={`p-2 rounded-full ${
                      approval.action === 'approve' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {approval.action === 'approve' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{approval.approver_name}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(approval.approved_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {approval.action === 'approve' ? 'Approved' : 'Rejected'} the request
                      </p>
                      {approval.comment && (
                        <p className="text-sm text-gray-500 mt-1 italic">"{approval.comment}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Selection - Only show for pending requests */}
        {!isApproved && !isRejected && (
          <div className="mb-6">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setAction('approve')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  action === 'approve'
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </button>
              <button
                onClick={() => setAction('reject')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  action === 'reject'
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </button>
            </div>

          {action === 'approve' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment about this approval..."
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                rows={3}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Provide additional details about the rejection..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          {isApproved || isRejected ? (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              Close
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isProcessing || (action === 'reject' && !rejectionReason)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  action === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300'
                    : 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  action === 'approve' ? 'Approve Request' : 'Reject Request'
                )}
              </button>
            </>
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
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Load requests
  const loadRequests = async () => {
    try {
      setIsLoading(true);
      console.log('Loading IT department requests for user:', user?.id);
      
      // Fetch all requests and filter for IT department relevant ones
      const allRequests = await accessRequestService.getAllRequests();
      
      console.log('IT Department API Response:', allRequests);
      
      // Filter to only show requests that have reached IT department stage
      const itRelevantRequests = allRequests.filter(request => 
        request.status === 'pending_it_review' || 
        request.status === 'ready_for_assignment' || 
        request.status === 'granted' || 
        request.status === 'rejected'
      );
      setRequests(itRelevantRequests);
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

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(request => {
        if (activeTab === 'pending') return request.status === 'pending_it_review';
        if (activeTab === 'approved') return request.status === 'ready_for_assignment' || request.status === 'granted';
        if (activeTab === 'rejected') return request.status === 'rejected';
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
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'ready_for_assignment' as const }
          : req
      ));
      
      // Refresh the selected request to get updated approval history
      if (selectedRequest?.id === requestId) {
        const response = await accessRequestService.getRequestById(requestId);
        if (response.success) {
          setSelectedRequest(response.request);
        }
      }
      
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
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending_manager_approval':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'pending_hod':
        return <Shield className="h-4 w-4 text-orange-500" />;
      case 'pending_it_manager':
        return <Building className="h-4 w-4 text-blue-500" />;
      case 'pending_it_review':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'ready_for_assignment':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'granted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
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
      case 'pending_it_review':
        return 'bg-purple-50 text-purple-700 border-purple-200';
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
      case 'pending_it_review':
        return 'Pending IT Review';
      case 'ready_for_assignment':
        return 'Ready for Assignment';
      case 'granted':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending_it_review').length;
  const approvedCount = requests.filter(r => r.status === 'ready_for_assignment' || r.status === 'granted').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

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
    <div className="min-h-screen bg-[#F0F8F8]">
      <NavBar/>
      
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-white p-2 rounded-lg shadow-lg border border-gray-200"
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SideBar />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="flex">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <SideBar/>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 w-full">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Requests</h1>
              <p className="text-gray-600">Review and approve access requests for IT department</p>
            </div>

            {/* Simple Stats */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500">Total Requests</p>
                      <p className="text-xl font-semibold text-gray-900">{requests.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500">Pending Review</p>
                      <p className="text-xl font-semibold text-gray-900">{pendingCount}</p>
                    </div>
                  </div>
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
                <button
                  onClick={loadRequests}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Filter Tabs */}
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
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                      <span className="ml-1 bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-xs">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Access Requests</h3>
              </div>
              
              {filteredRequests.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                  <p className="text-gray-500">There are no access requests matching your current filters.</p>
                </div>
              ) : (
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
              )}
            </div>
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
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}