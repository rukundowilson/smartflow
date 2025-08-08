"use client"
import React, { useEffect, useState, useCallback } from 'react';
import NavBarItHod from '../components/itHodNav';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search, 
  Shield, 
  Building2, 
  Calendar, 
  Loader2,
  Filter,
  RefreshCw,
  User,
  Mail,
  AlertTriangle
} from 'lucide-react';
import systemAccessRequestService, { 
  SystemAccessRequest as SARequest, 
  ApprovalData as SAApprovalData 
} from '@/app/services/systemAccessRequestService';
import { 
  getSystemAccessRequestComments, 
  Comment as AppComment 
} from '@/app/services/commentService';
import { useAuth } from '@/app/contexts/auth-context';
import Sidebar from '../components/itHodSideBar';

type FilterStatus = 'all' | 'it_hod_pending' | 'granted' | 'rejected';

interface ApprovalModalProps {
  request: SARequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (data: SAApprovalData) => Promise<void>;
  onReject: (data: SAApprovalData) => Promise<void>;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ request, isOpen, onClose, onApprove, onReject }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<AppComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

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

  if (!isOpen || !request) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleApprove = async () => {
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      await onApprove({ approver_id: user.id, approver_role: 'IT HOD', comment });
      setComment('');
      onClose();
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
      await onReject({ approver_id: user.id, approver_role: 'IT HOD', rejection_reason: rejectionReason, comment });
      setRejectionReason('');
      setComment('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">IT HOD Review</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Requester & System */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Requester</h3>
              <p className="text-lg font-semibold text-gray-900">{request.user_name || 'Employee'}</p>
              <p className="text-sm text-gray-600">{request.user_email || ''}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">System</h3>
              <p className="text-lg font-semibold text-gray-900">{request.system_name}</p>
            </div>
          </div>

          {/* Timeline */}
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
                <span className="text-gray-600">Line Manager Approved</span>
                <span className="text-gray-400 ml-auto">{formatDate(request.line_manager_at)}</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-600">HOD Approved</span>
                <span className="text-gray-400 ml-auto">{formatDate(request.hod_at)}</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-sky-600 rounded-full mr-3"></div>
                <span className="text-gray-900 font-medium">Currently: IT HOD Review</span>
                <span className="text-sky-600 font-medium ml-auto">You are here</span>
              </div>
            </div>
          </div>

          {/* Period & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Access Period</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-900"><span className="font-medium">Start:</span> {formatDate(request.start_date)}</p>
                <p className="text-sm text-gray-900"><span className="font-medium">End:</span> {formatDate(request.end_date)}</p>
                <p className="text-sm text-gray-600">{request.is_permanent ? 'Permanent access' : 'Temporary access'}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Current Status</h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200`}>
                {request.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Comments */}
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

          {/* Decision */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-3">Your Decision</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment (optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                  placeholder="Add a note..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason (required if rejecting)</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  placeholder="Provide a reason if rejecting..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
          <button onClick={handleReject} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center">
            {isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <XCircle className="h-4 w-4 mr-2" />}Reject
          </button>
          <button onClick={handleApprove} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center">
            {isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <CheckCircle className="h-4 w-4 mr-2" />}Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ITHODPage() {
  const [requests, setRequests] = useState<SARequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SARequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('it_hod_pending');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SARequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPending = useCallback(async (refresh = false) => {
    if (!user?.id) return;
    
    try {
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);
      
      setError(null);
      
      const res = await systemAccessRequestService.getPending({ 
        approver_id: user.id, 
        approver_role: 'IT HOD' 
      });
      
      if (res.success) {
        setRequests(res.requests);
      } else {
        setError('Failed to fetch requests. Please try again.');
      }
    } catch (e) {
      console.error('IT HOD pending fetch failed:', e);
      setError('An error occurred while fetching requests.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  // Avoid hanging spinner when user context isn't ready
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      setRequests([]);
      return;
    }
    fetchPending();
  }, [user?.id, fetchPending]);

  useEffect(() => {
    let filtered = requests;

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(request =>
        (request.user_name || '').toLowerCase().includes(searchLower) ||
        (request.user_email || '').toLowerCase().includes(searchLower) ||
        (request.system_name || '').toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [requests, searchTerm, statusFilter]);

  const getStatusConfig = (status: string) => {
    const configs = {
      it_hod_pending: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Clock,
        label: 'Pending Review'
      },
      granted: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: 'Approved'
      },
      rejected: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        label: 'Rejected'
      }
    };
    
    return configs[status as keyof typeof configs] || {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Clock,
      label: status.replace(/_/g, ' ').toUpperCase()
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const handleViewRequest = (request: SARequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    fetchPending(true);
  };

  const handleApprove = async (data: SAApprovalData) => {
    if (!selectedRequest) return;
    try {
      await systemAccessRequestService.approve(selectedRequest.id, data);
      await fetchPending(true);
      alert('Approved successfully');
    } catch (e) {
      console.error(e);
      alert('Failed to approve');
    }
  };

  const handleReject = async (data: SAApprovalData) => {
    if (!selectedRequest) return;
    try {
      await systemAccessRequestService.reject(selectedRequest.id, data);
      await fetchPending(true);
      alert('Rejected successfully');
    } catch (e) {
      console.error(e);
      alert('Failed to reject');
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const pendingCount = requests.filter(req => req.status === 'it_hod_pending').length;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <NavBarItHod/>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
    <div className="flex">
    <Sidebar/>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl lg:text-3xl font-bold text-gray-900">
              REQUIRES YOUR APPROVAL
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <p className="text-sm text-gray-600">
                System access requests awaiting your approval
              </p>
              {pendingCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  {pendingCount} pending
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or system..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              />
            </div>
            
            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="it_hod_pending">Pending</option>
                <option value="granted">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={clearSearch}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No matching requests' : 'Good work! No pending requests'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'All requests have been processed or are still under review by other approvers.'
              }
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={clearSearch}
                className="mt-4 text-sky-600 hover:text-sky-700 font-medium transition-colors"
              >
                Clear filters to see all requests
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      System Access
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
                  {filteredRequests.map((request, index) => {
                    const statusConfig = getStatusConfig(request.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr key={`${request.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {request.user_name || 'Employee'}
                              </div>
                              {request.user_email && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {request.user_email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {request.system_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(request.submitted_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleViewRequest(request)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-sky-700 bg-sky-50 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {filteredRequests.length > 0 && (
          <div className="flex justify-between items-center text-sm text-gray-600 px-1">
            <span>
              Showing {filteredRequests.length} of {requests.length} requests
            </span>
            <span>
              {pendingCount > 0 && `${pendingCount} require your attention`}
            </span>
          </div>
        )}
      </div>
      </div>
    </div>
    {/* Modal */}
    {isModalOpen && selectedRequest && (
      <ApprovalModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedRequest(null); }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    )}
    </>
  );
}