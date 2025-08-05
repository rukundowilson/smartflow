"use client"
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  User, 
  Building, 
  Calendar,
  Search,
  Filter,
  Loader2,
  Eye
} from 'lucide-react';
import LineManagerLayout from '../components/LineManagerLayout';
import accessRequestService, { AccessRequest, ApprovalHistory } from '@/app/services/accessRequestService';
import { useAuth } from '@/app/contexts/auth-context';

interface ApprovalHistoryModalProps {
  request: AccessRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

const ApprovalHistoryModal: React.FC<ApprovalHistoryModalProps> = ({ request, isOpen, onClose }) => {
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'granted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'ready_for_assignment':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending_hod':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'pending_it_manager':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'pending_it_review':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'granted':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'ready_for_assignment':
        return 'Ready for Assignment';
      case 'pending_hod':
        return 'Pending HOD Approval';
      case 'pending_it_manager':
        return 'Pending IT Manager';
      case 'pending_it_review':
        return 'Pending IT Review';
      default:
        return status;
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Access Request Approval Details
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Complete information about the request you approved as Line Manager
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Request Details */}
            <div className="space-y-6">
              {/* Current Position in Workflow */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Your Approval Position</h4>
                <p className="text-sm text-blue-700">You approved this access request as the <strong>Line Manager</strong> in <strong>{request.department_name}</strong></p>
                <p className="text-sm text-blue-700 mt-1">Current Status: <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                  {getStatusText(request.status)}
                </span></p>
              </div>

              {/* Request Timeline */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Request Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Request Submitted</p>
                      <p className="text-xs text-gray-500">{formatDate(request.submitted_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">You Approved</p>
                      <p className="text-xs text-gray-500">{formatDate(request.approved_at)}</p>
                    </div>
                  </div>
                </div>
              </div>


            </div>

            {/* Right Column - Employee & Role Details */}
            <div className="space-y-6">
              {/* Requester Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">Requester Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-blue-700">Name</p>
                    <p className="text-sm text-blue-900 font-medium">{request.user_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">Email</p>
                    <p className="text-sm text-blue-900">{request.user_email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">Current Department</p>
                    <p className="text-sm text-blue-900">{request.department_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">Current Roles</p>
                    <p className="text-sm text-blue-900">User, Line Manager</p>
                  </div>
                </div>
              </div>

              {/* Requested Access */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-900 mb-3">Requested Access</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-green-700">Requesting Role</p>
                    <p className="text-sm text-green-900 font-medium">{request.role_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">In Department</p>
                    <p className="text-sm text-green-900">{request.department_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">Access Type</p>
                    <p className="text-sm text-green-900">{request.is_permanent ? 'Permanent Access' : 'Temporary Access'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">Access Period</p>
                    <p className="text-sm text-green-900">
                      {formatDate(request.start_date)} 
                      {request.end_date && ` to ${formatDate(request.end_date)}`}
                      {!request.end_date && ' (Permanent)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Justification */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Justification</h4>
                <p className="text-sm text-gray-900">{request.justification}</p>
              </div>

              {/* Your Decision */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-orange-900 mb-3">Your Line Manager Decision</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-orange-700">Decision</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-orange-700">Approved On</p>
                    <p className="text-sm text-orange-900">{formatDate(request.approved_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Approval History */}
          {approvalHistory.length > 0 && (
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Approval History</h4>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                </div>
              ) : (
                <div className="space-y-3">
                  {approvalHistory.map((approval, index) => (
                    <div key={approval.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${approval.action === 'approve' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{approval.approver_name}</p>
                          <p className="text-xs text-gray-500">{approval.approver_email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          approval.action === 'approve' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {approval.action === 'approve' ? 'Approved' : 'Rejected'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(approval.approved_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LineManagerApprovedPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const loadApprovalHistory = async () => {
    try {
      setIsLoading(true);
      const response = await accessRequestService.getApprovalHistory(user?.id || 0, 'Line Manager');
      
      if (response.success) {
        setRequests(response.requests);
      }
    } catch (error) {
      console.error('Error loading approval history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadApprovalHistory();
    }
  }, [user]);

  // Filter requests - show all requests you approved
  useEffect(() => {
    let filtered = requests;

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
  }, [requests, searchTerm]);

  const handleViewRequest = (request: AccessRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'granted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'ready_for_assignment':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending_hod':
      case 'pending_it_manager':
      case 'pending_it_review':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'granted':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'ready_for_assignment':
        return 'Ready for Assignment';
      case 'pending_hod':
        return 'Pending HOD Approval';
      case 'pending_it_manager':
        return 'Pending IT Manager';
      case 'pending_it_review':
        return 'Pending IT Review';
      default:
        return status;
    }
  };

  const approvedCount = requests.length;

  return (
    <LineManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requests You Approved</h1>
          <p className="text-gray-600">Track access requests you approved as Line Manager</p>
        </div>

        {/* Simple Stats */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Requests You Approved</p>
              <p className="text-xl font-semibold text-gray-900">{approvedCount}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests you approved..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Approval History Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests approved</h3>
            <p className="text-gray-500">You haven't approved any access requests yet.</p>
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
                       Your Decision
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       When You Approved
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
                            {request.approved_at ? new Date(request.approved_at).toLocaleDateString() : 'N/A'}
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

      <ApprovalHistoryModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
      />
    </LineManagerLayout>
  );
} 