"use client"
import React, { useEffect, useState } from 'react';
import NavBarItHod from '../components/itHodNav';
import Sidebar from '../components/itHodSideBar';
import { CheckCircle, XCircle, Clock, Eye, Search, Building2, Calendar, Loader2, User, Mail } from 'lucide-react';
import systemAccessRequestService, { SystemAccessRequest as SARequest } from '@/app/services/systemAccessRequestService';
import { getSystemAccessRequestComments, Comment as AppComment } from '@/app/services/commentService';
import { useAuth } from '@/app/contexts/auth-context';


interface DetailsModalProps {
  request: SARequest | null;
  isOpen: boolean;
  onClose: () => void;
}

// Configuration
const MODAL_CONFIG = {
  maxWidth: 'max-w-3xl',
  maxHeight: 'max-h-[90vh]',
  zIndex: 'z-50'
};

const STATUS_CONFIG = {
  approved: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200'
  },
  pending: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200'
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200'
  }
};

const TIMELINE_STEPS = [
  { key: 'submitted_at', label: 'Submitted', color: 'bg-green-500' },
  { key: 'line_manager_at', label: 'Line Manager Approved', color: 'bg-blue-500' },
  { key: 'hod_at', label: 'HOD Approved', color: 'bg-blue-500' },
  { key: 'it_hod_at', label: 'IT HOD Approved', color: 'bg-sky-600' }
];

// Utility functions
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusConfig = (status: string) => {
  const normalizedStatus = status.toLowerCase().replace(/_/g, ' ');
  if (normalizedStatus.includes('approved')) return STATUS_CONFIG.approved;
  if (normalizedStatus.includes('pending')) return STATUS_CONFIG.pending;
  if (normalizedStatus.includes('rejected')) return STATUS_CONFIG.rejected;
  return STATUS_CONFIG.approved; // default
};

const formatStatusText = (status: string) => {
  return status.replace(/_/g, ' ').toUpperCase();
};


// Sub-components
const ModalHeader = ({ onClose }: { onClose: () => void }) => (
  <div className="flex items-center justify-between p-6 border-b border-gray-200">
    <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
    <button 
      onClick={onClose} 
      className="text-gray-400 hover:text-gray-600 transition-colors"
      aria-label="Close modal"
    >
      <XCircle className="w-6 h-6" />
    </button>
  </div>
);

const RequestorInfo = ({ request }: { request: SARequest }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <h3 className="text-sm font-medium text-gray-500 mb-2">Requester</h3>
      <p className="text-lg font-semibold text-gray-900">
        {request.user_name || 'Unknown User'}
      </p>
      {request.user_email && (
        <p className="text-sm text-gray-600">{request.user_email}</p>
      )}
    </div>
    <div>
      <h3 className="text-sm font-medium text-gray-500 mb-2">System</h3>
      <p className="text-lg font-semibold text-gray-900">{request.system_name}</p>
    </div>
  </div>
);

const Timeline = ({ request }: { request: SARequest }) => (
  <div>
    <h3 className="text-sm font-medium text-gray-500 mb-3">Timeline</h3>
    <div className="space-y-2 text-sm">
      {TIMELINE_STEPS.map((step) => {
        const dateValue = request[step.key as keyof SARequest] as string;
        return (
          <div key={step.key} className="flex items-center">
            <div className={`w-2 h-2 ${step.color} rounded-full mr-3`} />
            <span>{step.label}</span>
            <span className="ml-auto text-gray-500">{formatDate(dateValue)}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const AccessDetails = ({ request }: { request: SARequest }) => {
  const statusConfig = getStatusConfig(request.status);
  
  return (
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
        <h3 className="text-sm font-medium text-gray-500 mb-2">Current Status</h3>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
          {formatStatusText(request.status)}
        </span>
      </div>
    </div>
  );
};

const CommentsSection = ({ 
  comments, 
  isLoading 
}: { 
  comments: AppComment[]; 
  isLoading: boolean; 
}) => (
  <div>
    <h3 className="text-sm font-medium text-gray-500 mb-2">Comments</h3>
    {isLoading ? (
      <div className="text-sm text-gray-500 p-3 text-center">Loading comments...</div>
    ) : comments.length === 0 ? (
      <div className="text-sm text-gray-500 p-3 text-center bg-gray-50 rounded-lg">
        No comments available
      </div>
    ) : (
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">
                {comment.commented_by_name}
              </span>
              <span className="text-xs text-gray-500">
                {formatDateTime(comment.created_at)}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {comment.content}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
);

const ModalFooter = ({ onClose }: { onClose: () => void }) => (
  <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
    <button 
      onClick={onClose}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
    >
      Close
    </button>
  </div>
);

// Main component
function DetailsModal({ request, isOpen, onClose }: DetailsModalProps) {
  const [comments, setComments] = useState<AppComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !request) return;

    const loadComments = async () => {
      try {
        setIsLoadingComments(true);
        setError(null);
                 const response = await getSystemAccessRequestComments(Number(request.id));
         
         if (response.success) {
           setComments((response.comments || []) as unknown as AppComment[]);
        } else {
          setError('Failed to load comments');
        }
      } catch (err) {
        setError('Error loading comments');
        console.error('Error loading comments:', err);
      } finally {
        setIsLoadingComments(false);
      }
    };

    loadComments();
  }, [isOpen, request]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setComments([]);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !request) return null;

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/60 flex items-center justify-center p-4 ${MODAL_CONFIG.zIndex}`}
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-lg ${MODAL_CONFIG.maxWidth} w-full ${MODAL_CONFIG.maxHeight} overflow-y-auto`}>
        <ModalHeader onClose={onClose} />
        
        <div className="p-6 space-y-6">
          <RequestorInfo request={request} />
          <Timeline request={request} />
          <AccessDetails request={request} />
          
          {error ? (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          ) : (
            <CommentsSection comments={comments} isLoading={isLoadingComments} />
          )}
        </div>

        <ModalFooter onClose={onClose} />
      </div>
    </div>
  );
}

export default function ITHODReviewedRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SARequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SARequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SARequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewScope, setViewScope] = useState<'me' | 'department'>('me');

  const loadReviewed = async () => {
      if (!user?.id) { setIsLoading(false); return; }
      try {
        setIsLoading(true);
      let res;
      if (viewScope === 'me') {
        // Show requests reviewed by the current IT HOD
        res = await systemAccessRequestService.getApprovedBy({ approver_id: user.id, approver_role: 'IT HOD' });
      } else {
        // For "All IT HOD Reviewed" view, get all completed requests and filter for IT HOD reviewed ones
        res = await systemAccessRequestService.getCompleted();
      }
      if (res.success) {
        let filtered;
        if (viewScope === 'me') {
          // Filter to only show requests that have been acted upon by current IT HOD
          filtered = res.requests.filter(request => request.it_hod_at);
        } else {
          // Filter to show all requests that have been reviewed by any IT HOD
          filtered = res.requests.filter(request => request.it_hod_at);
        }
        setRequests(filtered);
      }
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    loadReviewed();
  }, [user?.id, viewScope]);

  useEffect(() => {
    const s = searchTerm.toLowerCase();
    setFilteredRequests(
      requests.filter(r =>
        (r.user_name || '').toLowerCase().includes(s) ||
        (r.user_email || '').toLowerCase().includes(s) ||
        (r.system_name || '').toLowerCase().includes(s)
      )
    );
  }, [requests, searchTerm]);

  const formatDateShort = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <div className='min-h-screen bg-[#F0F8F8]'>
      <NavBarItHod />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex">
          <Sidebar />

          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl lg:text-3xl font-bold text-gray-900">Reviewed Requests</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {viewScope === 'me' 
                    ? 'System access requests you reviewed as IT HOD'
                    : 'All system access requests reviewed by IT HODs'
                  }
                </p>
              </div>
            </div>

            {/* Scope Toggle */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">View Scope</h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewScope('me')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    viewScope === 'me'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Reviewed by me
                </button>
                <button
                  onClick={() => setViewScope('department')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    viewScope === 'department'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All IT HOD Reviewed
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviewed requests by name, email, or system..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviewed requests yet</h3>
                <p className="text-gray-500">When you review system access requests, they will show up here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed On</th>
                        {viewScope === 'department' && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed By</th>
                        )}
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRequests.map((request, index) => (
                        <tr key={`${request.id}-${index}`} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-500" />
                              </div>
                              <div className="ml-3 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{request.user_name || 'Employee'}</div>
                                {request.user_email && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                                    <span className="truncate">{request.user_email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 truncate">{request.system_name}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                              request.status === 'granted' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                            }`}>
                              {request.status === 'granted' ? 'Approved' : 'Rejected'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">{formatDateShort(request.it_hod_at || '')}</td>
                          {viewScope === 'department' && (
                            <td className="px-4 py-4 text-sm text-gray-500 truncate">
                              {request.it_hod_name || 'IT HOD'}
                            </td>
                          )}
                          <td className="px-4 py-4 text-right">
                            <button onClick={() => { setSelectedRequest(request); setIsModalOpen(true); }} className="p-1 text-sky-600 hover:text-sky-900 hover:bg-sky-50 rounded transition-colors flex-shrink-0">
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {filteredRequests.map((request, index) => (
                    <div key={`m-${request.id}-${index}`} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{request.user_name || 'Employee'}</p>
                            {request.user_email && <p className="text-xs text-gray-500 truncate">{request.user_email}</p>}
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${
                          request.status === 'granted' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {request.status === 'granted' ? 'Approved' : 'Rejected'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        <div className="flex items-center"><Building2 className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" /><span className="truncate">{request.system_name}</span></div>
                        <div className="flex items-center text-gray-500 mt-1"><Calendar className="h-4 w-4 mr-1 flex-shrink-0" />{formatDateShort(request.it_hod_at || '')}</div>
                        {viewScope === 'department' && (
                          <div className="flex items-center text-gray-500 mt-1">
                            <span className="truncate">Reviewed by: {request.it_hod_name || 'IT HOD'}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button onClick={() => { setSelectedRequest(request); setIsModalOpen(true); }} className="px-3 py-1.5 bg-sky-600 text-white text-xs rounded-lg hover:bg-sky-700">View</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && selectedRequest && (
        <DetailsModal request={selectedRequest} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedRequest(null); }} />
      )}
    </div>
  );
} 