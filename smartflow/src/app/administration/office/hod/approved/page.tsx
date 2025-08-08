"use client"
import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  User,
  Building2,
  Calendar,
  Search,
  Loader2,
  Eye
} from 'lucide-react';
import HODLayout from '../components/HODLayout';
import systemAccessRequestService, { SystemAccessRequest as SARequest } from '@/app/services/systemAccessRequestService';
import { useAuth } from '@/app/contexts/auth-context';
import { getSystemAccessRequestComments, Comment as AppComment } from '@/app/services/commentService';

export default function HODApprovedPage() {
  const [requests, setRequests] = useState<SARequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SARequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SARequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comments, setComments] = useState<AppComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const loadApproved = async () => {
    try {
      setIsLoading(true);
      const response = await systemAccessRequestService.getApprovedBy({ approver_id: user?.id || 0, approver_role: 'HOD' });
      if (response.success) {
        setRequests(response.requests);
      }
    } catch (error) {
      console.error('Error loading HOD approval history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadApproved();
    }
  }, [user?.id]);

  useEffect(() => {
    let filtered = requests;
    if (searchTerm) {
      filtered = filtered.filter(request =>
        (request.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.user_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.system_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredRequests(filtered);
  }, [requests, searchTerm]);

  const handleViewRequest = (request: SARequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
    (async () => {
      try {
        setIsLoadingComments(true);
        const res = await getSystemAccessRequestComments(request.id);
        if (res.success) setComments(res.comments);
      } finally {
        setIsLoadingComments(false);
      }
    })();
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'granted':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const approvedCount = requests.length;

  return (
    <HODLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requests You Approved</h1>
          <p className="text-gray-600">Track system access requests you approved as HOD</p>
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
              placeholder="Search approved requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        {/* Approved Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests approved</h3>
            <p className="text-gray-500">You haven't approved any system access requests yet.</p>
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
                      System
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approved On
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
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{request.user_name || 'Employee'}</p>
                            <p className="text-sm text-gray-500">{request.user_email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{request.system_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {request.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {request.hod_at ? new Date(request.hod_at as unknown as string).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewRequest(request)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-sky-600 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100"
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

      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Approved Request Details</h2>
              <button onClick={() => { setIsModalOpen(false); setSelectedRequest(null); }} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">You approved this system access request as HOD.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Employee</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedRequest.user_name || 'Employee'}</p>
                  <p className="text-sm text-gray-600">{selectedRequest.user_email || ''}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">System</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedRequest.system_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Access Period</h3>
                  <div className="space-y-1 text-sm text-gray-900">
                    <p><span className="font-medium">Start:</span> {selectedRequest.start_date ? new Date(selectedRequest.start_date).toLocaleDateString() : 'N/A'}</p>
                    <p><span className="font-medium">End:</span> {selectedRequest.end_date ? new Date(selectedRequest.end_date).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-gray-600">{selectedRequest.is_permanent ? 'Permanent access' : 'Temporary access'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Request Status</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <div className="mt-2 text-sm text-gray-700">
                    <p><span className="font-medium">Approved on:</span> {selectedRequest.hod_at ? new Date(selectedRequest.hod_at as unknown as string).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Approval</h3>
                  <div className="text-sm text-gray-900">
                    <p>
                      <span className="font-medium">Approved by:</span> {selectedRequest.hod_name || (comments.find(c => c.commented_by === (selectedRequest.hod_id as number))?.commented_by_name) || 'HOD'}
                    </p>
                    {(() => {
                      const approvalComment = comments.find(c => c.commented_by === (selectedRequest.hod_id as number));
                      return approvalComment ? (
                        <p className="mt-1"><span className="font-medium">Note:</span> {approvalComment.content}</p>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Justification</h3>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRequest.justification || 'No justification provided'}</p>
              </div>

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
            </div>

            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => { setIsModalOpen(false); setSelectedRequest(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </HODLayout>
  );
} 