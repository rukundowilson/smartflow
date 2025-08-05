"use client"
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Shield, Building2, User, X, AlertCircle, Users, Settings } from 'lucide-react';
import accessRequestService, { AccessRequest } from '../../../../services/accessRequestService';
import ITManagerLayout from '../components/ITManagerLayout';
import { useAuth } from '@/app/contexts/auth-context';



interface AssignmentModalProps {
  request: AccessRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (requestId: number, assignedTo: number, comment: string) => void;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({ request, isOpen, onClose, onAssign }) => {
  const [assignedTo, setAssignedTo] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!request || !isOpen) return null;

  const handleAssign = async () => {
    if (!assignedTo.trim()) {
      alert('Please select an IT guy to assign this request to.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAssign(request.id, parseInt(assignedTo), comment);
      setAssignedTo('');
      setComment('');
      onClose();
    } catch (error) {
      console.error('Error assigning request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Assign Request to IT Team</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Request Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Employee</h3>
              <p className="text-sm text-gray-900">{request.user_name}</p>
              <p className="text-xs text-gray-500">{request.user_email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">System</h3>
              <p className="text-sm text-gray-900">{request.department_name}</p>
              <p className="text-xs text-gray-500">{request.department_description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Role</h3>
              <p className="text-sm text-gray-900">{request.role_name}</p>
              <p className="text-xs text-gray-500">{request.role_description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-xs px-2 py-1 rounded-full border bg-green-50 text-green-700 border-green-200">
                  Ready for Assignment
                </span>
              </div>
            </div>
          </div>

          {/* Justification */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Justification</h3>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
              {request.justification}
            </p>
          </div>

          {/* Assignment Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to IT Team Member <span className="text-red-500">*</span>
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select IT team member...</option>
                {/* TODO: Fetch IT team members dynamically */}
                <option value="1">IT Support (itsupport@company.com)</option>
                <option value="2">Developer (developer@company.com)</option>
                <option value="3">IT Admin (itadmin@company.com)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Notes
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Add any specific instructions or notes for the IT team member..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleAssign}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Assigning...' : 'Assign Request'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ITManagerAssignments() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ready');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      // Get only requests ready for assignment
      const response = await accessRequestService.getPendingRequests({
        approver_id: user?.id, // Use current user's ID
        approver_role: 'IT Manager'
      });
      
      if (response.success) {
        const readyRequests = response.requests.filter(request => request.status === 'ready_for_assignment');
        console.log('Loaded ready requests:', readyRequests);
        setRequests(readyRequests);
        setFilteredRequests(readyRequests);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter requests
  useEffect(() => {
    let filtered = requests;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(request => {
        if (activeTab === 'ready') return request.status === 'ready_for_assignment';
        if (activeTab === 'completed') return request.status === 'granted';
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

  const handleAssign = async (requestId: number, assignedTo: number, comment: string) => {
    try {
      // TODO: Implement assignment API call
      console.log('Assigning request', requestId, 'to', assignedTo, 'with comment:', comment);
      
      // For now, just update the status locally
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'granted' as const }
          : req
      ));
      
      alert('Request assigned successfully!');
    } catch (error) {
      console.error('Error assigning request:', error);
      alert('Failed to assign request. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'ready_for_assignment':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'granted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ready_for_assignment':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'granted':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'ready_for_assignment':
        return 'Ready for Assignment';
      case 'granted':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <ITManagerLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">IT Manager Assignments</h1>
          <p className="mt-2 text-gray-600">Assign approved requests to IT team members</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ready for Assignment</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {requests.filter(r => r.status === 'ready_for_assignment').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {requests.filter(r => r.status === 'granted').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {requests.filter(r => r.status === 'granted').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex space-x-4 mb-4 sm:mb-0">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('ready')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'ready' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Ready for Assignment
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'completed' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'completed' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Completed
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Assignment Requests ({filteredRequests.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredRequests.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'ready' ? 'No requests ready for assignment.' : 'No requests match your filters.'}
                </p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {request.user_name} - {request.department_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.role_name} • {request.user_email}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Ready since: {new Date(request.approved_at || request.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>

                      {request.status === 'ready_for_assignment' && (
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowAssignmentModal(true);
                          }}
                          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Assign
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      <AssignmentModal
        request={selectedRequest}
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setSelectedRequest(null);
        }}
        onAssign={handleAssign}
      />
    </ITManagerLayout>
  );
} 