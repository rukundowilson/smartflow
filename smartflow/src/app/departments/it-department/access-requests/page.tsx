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
  X,
  ChevronDown,
  Info,
  Settings,
  Bell,
  Activity
} from 'lucide-react';
import accessRequestService, { AccessRequest } from '@/app/services/accessRequestService';
import systemAccessRequestService, { SystemAccessRequest } from '@/app/services/systemAccessRequestService';
import { useAuth } from '@/app/contexts/auth-context';
import NavBar from '../components/navbar';
import Sidebar from '../components/sidebar';
import { getSystemAccessRequestComments, Comment as AppComment } from '@/app/services/commentService';

interface ApprovalModalProps {
  request: AccessRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (requestId: number, comment: string) => void;
  onReject: (requestId: number, reason: string, comment: string) => void;
  onAssign: (requestId: number, assignmentType: 'auto' | 'manual', assignedUserId?: number, comment?: string) => void;
  isProcessing: boolean;
  comments?: AppComment[];
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onAssign,
  isProcessing,
  comments = []
}) => {
  const [action, setAction] = useState<'approve' | 'reject' | 'assign'>('approve');
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [assignmentType, setAssignmentType] = useState<'auto' | 'manual'>('auto');
  const [assignedUserId, setAssignedUserId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) {
      setComment('');
      setRejectionReason('');
      setAssignedUserId(undefined);
      setAssignmentType('auto');
    }
  }, [isOpen]);

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
  const isReadOnly = ['access_granted', 'it_assigned', 'granted', 'rejected'].includes(request.status);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending_manager_approval': return <Clock className="h-4 w-4 text-amber-600" />;
      case 'pending_hod': return <Shield className="h-4 w-4 text-orange-600" />;
      case 'pending_it_manager': return <Building className="h-4 w-4 text-blue-600" />;
      case 'pending_it_review':
      case 'it_support_review': return <Users className="h-4 w-4 text-purple-600" />;
      case 'ready_for_assignment': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'granted':
      case 'access_granted': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending_manager_approval': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'pending_hod': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'pending_it_manager': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'pending_it_review':
      case 'it_support_review': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'ready_for_assignment': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'granted':
      case 'access_granted': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'rejected': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending_manager_approval': return 'Pending Line Manager';
      case 'pending_hod': return 'Pending HOD Approval';
      case 'pending_it_manager': return 'Pending IT Manager';
      case 'pending_it_review':
      case 'it_support_review': return 'Pending IT Review';
      case 'ready_for_assignment': return 'Ready for Assignment';
      case 'access_granted': return 'Access Granted';
      case 'it_assigned': return 'IT Assigned';
      case 'granted': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-full sm:max-w-xl md:max-w-3xl mx-0 sm:mx-4 p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
            {isReadOnly ? 'Request Details' : 'IT Support Review'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Status */}
        <div className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border mb-4 sm:mb-6 ${getStatusColor(request.status)}`}>
          {getStatusIcon(request.status)}
          <span className="ml-2">{getStatusText(request.status)}</span>
        </div>

        {/* Access Window */}
        <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-700">
          <span className="font-medium">System:</span> <span className="mr-3">{(request as any).system_name || request.role_name}</span>
          {request.start_date && (
            <>
              <span className="font-medium">From:</span> {new Date(request.start_date).toLocaleDateString()} {' '}
            </>
          )}
          {request.end_date && (
            <>
              <span className="font-medium ml-3">Until:</span> {new Date(request.end_date).toLocaleDateString()}
            </>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
              <User className="h-5 w-5 mr-2 text-blue-600" /> Requester
            </h3>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Name</span><span className="font-medium truncate max-w-[60%] text-right">{request.user_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Email</span><span className="font-medium truncate max-w-[60%] text-right">{request.user_email}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Submitted</span><span className="font-medium">{new Date(request.submitted_at).toLocaleDateString()}</span></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-6 rounded-xl border border-purple-100">
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
              <Key className="h-5 w-5 mr-2 text-purple-600" /> Access Details
            </h3>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between"><span className="text-gray-600">System</span><span className="font-medium truncate max-w-[60%] text-right">{(request as any).system_name || '—'}</span></div>
              {request.start_date && (<div className="flex justify-between"><span className="text-gray-600">Start</span><span className="font-medium">{new Date(request.start_date).toLocaleDateString()}</span></div>)}
              {request.end_date && (<div className="flex justify-between"><span className="text-gray-600">End</span><span className="font-medium">{new Date(request.end_date).toLocaleDateString()}</span></div>)}
              <div className="flex justify-between"><span className={`text-gray-600`}>Type</span><span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${request.is_permanent ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{request.is_permanent ? 'Permanent' : 'Temporary'}</span></div>
            </div>
          </div>
        </div>

        {/* Justification */}
        <div className="mb-6 sm:mb-8">
          <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
            <FileText className="h-5 w-5 mr-2 text-gray-600" /> Justification
          </h3>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base break-words">{request.justification}</p>
          </div>
        </div>

        {/* Past Approver Comments */}
        {comments.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Approval Comments</h3>
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{c.commented_by_name}</span>
                    <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {!isReadOnly && (
          <div className="mb-2 sm:mb-4">
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 mb-3 sm:mb-4">
              {canApprove && (
                <button onClick={() => setAction('approve')} className={`flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium ${action === 'approve' ? 'bg-green-100 text-green-700 border-2 border-green-300' : 'bg-gray-100 text-gray-700 border-2 border-gray-300'}`}>
                  <CheckCircle className="h-5 w-5 mr-2" /> Approve
                </button>
              )}
              {canReject && (
                <button onClick={() => setAction('reject')} className={`flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium ${action === 'reject' ? 'bg-red-100 text-red-700 border-2 border-red-300' : 'bg-gray-100 text-gray-700 border-2 border-gray-300'}`}>
                  <XCircle className="h-5 w-5 mr-2" /> Reject
                </button>
              )}
              {canAssign && (
                <button onClick={() => setAction('assign')} className={`flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium ${action === 'assign' ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' : 'bg-gray-100 text-gray-700 border-2 border-gray-300'}`}>
                  <Users className="h-5 w-5 mr-2" /> Assign
                </button>
              )}
            </div>

            {action === 'approve' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Approval Comment (Optional)</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment about this approval..." className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-sm sm:text-base" rows={3} />
              </div>
            )}
            {action === 'reject' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Rejection Reason *</label>
                  <select value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base" required>
                    <option value="">Select a reason</option>
                    <option value="insufficient_justification">Insufficient Justification</option>
                    <option value="role_not_appropriate">Role Not Appropriate</option>
                    <option value="security_concerns">Security Concerns</option>
                    <option value="department_mismatch">Department Mismatch</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Additional Comments (Optional)</label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Provide additional details about the rejection..." className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-sm sm:text-base" rows={3} />
                </div>
              </div>
            )}
            {action === 'assign' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Assignment Type *</label>
                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center"><input type="radio" value="auto" checked={assignmentType === 'auto'} onChange={(e) => setAssignmentType(e.target.value as 'auto' | 'manual')} className="mr-2" /><span className="text-sm">Auto-assign to requesting user</span></label>
                    <label className="flex items-center"><input type="radio" value="manual" checked={assignmentType === 'manual'} onChange={(e) => setAssignmentType(e.target.value as 'auto' | 'manual')} className="mr-2" /><span className="text-sm">Manually assign to specific user</span></label>
                  </div>
                </div>
                {assignmentType === 'manual' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Assign to User ID *</label>
                    <input type="number" value={assignedUserId || ''} onChange={(e) => setAssignedUserId(e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Enter user ID" className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" required />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Assignment Comment (Optional)</label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment about this assignment..." className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base" rows={3} />
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 pt-3 sm:pt-4 mt-4 pb-[env(safe-area-inset-bottom)] flex flex-col sm:flex-row justify-end sm:space-x-4 space-y-3 sm:space-y-0">
              <button onClick={onClose} className="px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-sm sm:text-base">{isReadOnly ? 'Close' : 'Cancel'}</button>
              {!isReadOnly && (
                <button onClick={handleSubmit} disabled={isProcessing || (action === 'reject' && !rejectionReason) || (action === 'assign' && assignmentType === 'manual' && !assignedUserId)} className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base ${action === 'approve' ? 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300' : action === 'reject' ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300' : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300'}`}>{isProcessing ? (<span className="inline-flex items-center"><Loader2 className="h-5 w-5 mr-2 animate-spin" />Processing...</span>) : (action === 'approve' ? 'Approve Request' : action === 'reject' ? 'Reject Request' : 'Assign Access')}</button>
              )}
            </div>
          </div>
        )}
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
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useAuth();
  const [sarQueue, setSarQueue] = useState<SystemAccessRequest[]>([]);
  const [sarComments, setSarComments] = useState<AppComment[]>([]);

  // Load requests
  const loadRequests = async () => {
    try {
      setIsLoading(true);
      console.log('Loading IT department requests for user:', user?.id);
      
      // System Access Requests queue for IT support (now shows all in queue)
      if (user?.id) {
        const sarRes = await systemAccessRequestService.getITSupportQueue({ user_id: user.id });
        if (sarRes.success) {
          setSarQueue(sarRes.requests || []);
        }
      }
      
      // Legacy Access Requests
      const allRequests = await accessRequestService.getAllRequests();
      const itRequests = allRequests.filter(request => 
        request.status === 'pending_it_review' || 
        request.status === 'ready_for_assignment' || 
        request.status === 'access_granted' || 
        request.status === 'it_assigned' || 
        request.status === 'rejected'
      );
      setRequests(itRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user?.id]);

  // Filter requests
  useEffect(() => {
    // Prefer SAR queue if available
    if (sarQueue.length > 0) {
      const review = sarQueue.filter(r => r.status === 'it_support_review');
      const completed = sarQueue.filter(r => r.status === 'granted');
      const rejected = sarQueue.filter(r => r.status === 'rejected');
      let combined: any[] = [...review, ...completed, ...rejected];
      
      if (filterStatus !== 'all') {
        combined = combined.filter(r => {
          if (filterStatus === 'pending') return r.status === 'it_support_review';
          if (filterStatus === 'approved') return r.status === 'granted';
          if (filterStatus === 'rejected') return r.status === 'rejected';
          return true;
        });
      }
      
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        combined = combined.filter(r =>
          (r.user_name || '').toLowerCase().includes(s) ||
          (r.user_email || '').toLowerCase().includes(s) ||
          (r.system_name || '').toLowerCase().includes(s) ||
          (r.department_name || '').toLowerCase().includes(s) ||
          (r.role_name || '').toLowerCase().includes(s)
        );
      }
      setFilteredRequests(combined as any);
      return;
    }

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
  }, [requests, sarQueue, filterStatus, searchTerm, user?.id]);

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

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 4000);
  };

  const handleApprove = async (requestId: number, comment: string) => {
    if (!user?.id) return;
    
    setIsProcessing(true);
    try {
      // If selected is SAR-mapped, grant via SAR endpoint
      const isSAR = sarQueue.some(r => r.id === requestId);
      if (isSAR) {
        await systemAccessRequestService.itSupportGrant(requestId, { user_id: user.id, comment });
        showSuccess('System access request approved successfully!');
      } else {
        await accessRequestService.approveRequest(requestId, {
          approver_id: user.id,
          comment,
          approver_role: 'IT Support'
        });
        showSuccess('Access request approved successfully!');
      }
      
      setIsModalOpen(false);
      setSelectedRequest(null);
      await loadRequests();
      
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
      const isSAR = sarQueue.some(r => r.id === requestId);
      if (isSAR) {
        await systemAccessRequestService.itSupportReject(requestId, { user_id: user.id, rejection_reason: reason, comment });
        showSuccess('System access request rejected.');
      } else {
        await accessRequestService.rejectRequest(requestId, {
          approver_id: user.id,
          rejection_reason: reason,
          comment
        });
        showSuccess('Access request rejected.');
      }
      
      await loadRequests();
      setIsModalOpen(false);
      setSelectedRequest(null);
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
      
      setIsModalOpen(false);
      setSelectedRequest(null);
      await loadRequests();
      showSuccess('Access assigned successfully!');
    } catch (error) {
      console.error('Error assigning request:', error);
      alert('Failed to assign request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSarComments = async (requestId: number) => {
    try {
      const resp = await getSystemAccessRequestComments(requestId);
      setSarComments(resp.comments || []);
    } catch {
      setSarComments([]);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending_manager_approval':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'pending_hod':
        return <Shield className="h-4 w-4 text-orange-600" />;
      case 'pending_it_manager':
        return <Building className="h-4 w-4 text-blue-600" />;
      case 'pending_it_review':
      case 'it_support_review':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'ready_for_assignment':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'granted':
      case 'access_granted':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending_manager_approval':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'pending_hod':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'pending_it_manager':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'pending_it_review':
      case 'it_support_review':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'ready_for_assignment':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'granted':
      case 'access_granted':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'rejected':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending_manager_approval':
        return 'Pending Line Manager';
      case 'pending_hod':
        return 'Pending HOD Approval';
      case 'pending_it_manager':
        return 'Pending IT Manager';
      case 'pending_it_review':
      case 'it_support_review':
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
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getPriorityLevel = (request: any) => {
    const daysOld = Math.floor((new Date().getTime() - new Date(request.submitted_at).getTime()) / (1000 * 60 * 60 * 24));
    if (daysOld > 7) return 'high';
    if (daysOld > 3) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Calculate metrics
  const pendingCount = sarQueue.length > 0 
    ? sarQueue.filter(r => r.status === 'it_support_review').length
    : requests.filter(r => r.status === 'pending_it_review').length;
  const readyCount = 0;
  const approvedCount = sarQueue.length > 0 
    ? sarQueue.filter(r => r.status === 'granted').length 
    : requests.filter(r => r.status === 'access_granted' || r.status === 'it_assigned').length;
  const rejectedCount = sarQueue.length > 0 
    ? sarQueue.filter(r => r.status === 'rejected').length 
    : requests.filter(r => r.status === 'rejected').length;
  const totalCount = sarQueue.length > 0 ? sarQueue.length : requests.length;

  const myAssignedCount = sarQueue.filter(r => r.it_support_id === user?.id).length;
  const unassignedCount = sarQueue.filter(r => r.status === 'it_support_review' && !r.it_support_id).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Access Requests</h3>
          <p className="text-slate-600">Fetching the latest requests for review...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar/>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-6 right-6 bg-white border border-emerald-200 shadow-lg rounded-2xl p-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="ml-3">
                <p className="font-semibold text-slate-900">{successMessage}</p>
                <p className="text-slate-600 text-sm">Action completed successfully</p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            <Sidebar/>
            
            <div className="flex-1 min-w-0">
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-2xl">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h1 className="text-3xl font-bold text-slate-900">IT Access Requests</h1>
                    <p className="text-slate-600 mt-1">Review and manage system access requests</p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Filters */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-slate-500" />
                      <label className="text-sm font-medium text-slate-700">Filter by Status</label>
                    </div>
                    <div className="relative">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="appearance-none bg-white border border-slate-300 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                                                 <option value="all">All Requests ({totalCount})</option>
                         <option value="pending">Pending Review ({pendingCount})</option>
                         <option value="approved">Approved ({approvedCount})</option>
                         <option value="rejected">Rejected ({rejectedCount})</option>
                      </select>
                      <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Search */}
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="h-5 w-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by user, email, system, or department..."
                        className="w-full pl-12 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                      />
                    </div>
                  </div>

                  {/* Refresh Button */}
                  <button
                    onClick={loadRequests}
                    className="flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 text-sm font-medium"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Quick Actions for SAR Queue */}
              {sarQueue.length > 0 && unassignedCount > 0 && (
                <div className="rounded-2xl p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Action Required</h3>
                      <p className='text-orange-500'>{unassignedCount} unassigned requests need any it attention</p>
                    </div>
                    <Bell className="h-8 w-8" />
                  </div>
                </div>
              )}

              {/* Main Content */}
                              {sarQueue.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                  <div className="px-8 py-6 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Key className="h-6 w-6 text-blue-600 mr-3" />
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">System Access Requests</h3>
                          <p className="text-slate-600 text-sm">IT Support Queue - Review and manage access requests</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">
                          {filteredRequests.length} of {sarQueue.length} requests
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    {filteredRequests.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-4">
                          <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Requests Found</h3>
                        <p className="text-slate-600">
                          {searchTerm || filterStatus !== 'all' 
                            ? 'Try adjusting your filters or search terms.' 
                            : 'No access requests are currently available for review.'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredRequests.map((r: any) => (
                          <div key={`sar-${r.id}`} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-start gap-3 min-w-0">
                              <Key className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate">{r.system_name}</div>
                                <div className="text-xs text-gray-600 truncate">
                                  <span className="sm:hidden">{r.user_name}</span>
                                  <span className="hidden sm:inline">{r.user_name} • {r.department_name} • {r.role_name}</span>
                                </div>
                                <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-600 truncate">
                                  <User className="h-3.5 w-3.5 text-slate-500" />
                                  <span>{r.it_support_name ? `Assigned to ${r.it_support_name}` : 'Unassigned'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                              <span className={`px-2 py-1 text-[10px] sm:text-xs font-semibold rounded-full ${r.status === 'it_support_review' ? 'text-purple-600 bg-purple-50' : r.status === 'granted' ? 'text-green-600 bg-green-50' : r.status === 'rejected' ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'}`}>
                                {String(r.status).replaceAll('_', ' ')}
                              </span>
                              <button
                                onClick={() => {
                                  const mapped: any = {
                                    id: r.id,
                                    user_id: r.user_id,
                                    department_id: 0,
                                    role_id: 0,
                                    justification: r.justification,
                                    start_date: r.start_date,
                                    end_date: r.end_date,
                                    is_permanent: r.is_permanent,
                                    status: r.status === 'it_support_review' ? 'pending_it_review' : r.status,
                                    submitted_at: r.submitted_at,
                                    department_name: r.department_name || '',
                                    role_name: r.role_name || '',
                                    system_name: r.system_name || '',
                                    user_name: r.user_name || '',
                                    user_email: r.user_email || ''
                                  };
                                  setSelectedRequest(mapped);
                                  setIsModalOpen(true);
                                  loadSarComments(r.id);
                                }}
                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-sky-700 bg-sky-100 hover:bg-sky-200"
                              >
                                <Eye className="h-4 w-4 mr-1" /> Review
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Help Section */}
              <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl p-6 mt-8">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">IT Support Guidelines</h3>
                    <div className="text-sm text-slate-700 space-y-1">
                      <p>• Review business justification carefully before approving access</p>
                      <p>• Verify that the requested role aligns with user's department and responsibilities</p>
                      <p>• For security-sensitive roles, consider additional verification steps</p>
                      <p>• Use comments to document your decision rationale for audit purposes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ApprovalModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        onAssign={handleAssign}
        isProcessing={isProcessing}
        comments={sarComments}
      />
    </>
  );
}