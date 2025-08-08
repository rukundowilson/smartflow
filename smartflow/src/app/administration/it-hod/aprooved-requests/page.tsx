"use client"
import React, { useEffect, useState } from 'react';
import NavBarItHod from '../components/itHodNav';
import Sidebar from '../components/itHodSideBar';
import { CheckCircle, XCircle, Clock, Eye, Search, Building2, Calendar, Loader2, User, Mail } from 'lucide-react';
import systemAccessRequestService, { SystemAccessRequest as SARequest } from '@/app/services/systemAccessRequestService';
import { getSystemAccessRequestComments, Comment as AppComment } from '@/app/services/commentService';
import { useAuth } from '@/app/contexts/auth-context';

function DetailsModal({ request, isOpen, onClose }: { request: SARequest | null; isOpen: boolean; onClose: () => void }) {
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Approved Request</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
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

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Timeline</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"/> Submitted <span className="ml-auto text-gray-500">{formatDate(request.submitted_at)}</span></div>
              <div className="flex items-center"><div className="w-2 h-2 bg-blue-500 rounded-full mr-3"/> Line Manager Approved <span className="ml-auto text-gray-500">{formatDate(request.line_manager_at)}</span></div>
              <div className="flex items-center"><div className="w-2 h-2 bg-blue-500 rounded-full mr-3"/> HOD Approved <span className="ml-auto text-gray-500">{formatDate(request.hod_at)}</span></div>
              <div className="flex items-center"><div className="w-2 h-2 bg-sky-600 rounded-full mr-3"/> IT HOD Approved <span className="ml-auto text-gray-500">{formatDate((request as any).it_hod_at)}</span></div>
            </div>
          </div>

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
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                {request.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
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
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function ITHODApprovedRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SARequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SARequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SARequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) { setIsLoading(false); return; }
      try {
        setIsLoading(true);
        const res = await systemAccessRequestService.getApprovedBy({ approver_id: user.id, approver_role: 'IT HOD' });
        if (res.success) setRequests(res.requests);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.id]);

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
    <>
      <NavBarItHod />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex">
          <Sidebar />

          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl lg:text-3xl font-bold text-gray-900">Approved Requests</h1>
                <p className="text-sm text-gray-600 mt-1">System access requests you approved as IT HOD</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search approved by name, email, or system..."
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No approved requests yet</h3>
                <p className="text-gray-500">When you approve system access requests, they will show up here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                        <tr key={`${request.id}-${index}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-500" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{request.user_name || 'Employee'}</div>
                                {request.user_email && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Mail className="h-3 w-3 mr-1" />{request.user_email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{request.system_name}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
                              Approved
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDateShort(request.submitted_at)}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => { setSelectedRequest(request); setIsModalOpen(true); }} className="p-1 text-sky-600 hover:text-sky-900 hover:bg-sky-50 rounded transition-colors">
                              <Eye className="h-4 w-4" />
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
        </div>
      </div>

      {isModalOpen && selectedRequest && (
        <DetailsModal request={selectedRequest} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedRequest(null); }} />
      )}
    </>
  );
} 