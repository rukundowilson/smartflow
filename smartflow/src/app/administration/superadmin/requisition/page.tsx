"use client"
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  MoreVertical,
  Menu,
  AlertCircle,
  RefreshCw,
  Calendar,
  User,
  MessageSquare,
  Send,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { 
  getAllItemRequisitions, 
  updateItemRequisitionStatus, 
  scheduleItemPickup,
  markItemAsDelivered,
  assignItemRequisition,
  ItemRequisition 
} from '@/app/services/itemRequisitionService';
import { getITUsers, ITUser } from '@/app/services/itTicketService';
import ItemRequestModal from '@/app/components/itemRequestModal';
import NavBar from '../components/nav';
import SideBar from '../components/sidebar';

// Comment Modal Component
const CommentModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading, 
  comment, 
  setComment,
  requisitionId,
  action
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requisitionId: number, comment: string) => void;
  loading: boolean;
  comment: string;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  requisitionId: number | null;
  action: 'approve' | 'reject' | 'assign';
}) => {
  if (!isOpen) return null;

  const getActionColor = () => {
    switch (action) {
      case 'approve': return 'bg-green-600 hover:bg-green-700';
      case 'reject': return 'bg-red-600 hover:bg-red-700';
      case 'assign': return 'bg-blue-600 hover:bg-blue-700';
      default: return 'bg-sky-600 hover:bg-sky-700';
    }
  };

  const getActionTitle = () => {
    switch (action) {
      case 'approve': return 'Approve Requisition';
      case 'reject': return 'Reject Requisition';
      case 'assign': return 'Assign Requisition';
      default: return 'Add Comment';
    }
  };

  const getActionButton = () => {
    switch (action) {
      case 'approve': return 'Approve';
      case 'reject': return 'Reject';
      case 'assign': return 'Assign';
      default: return 'Submit';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/10 pt-24" onClick={onClose}>
      <div 
        className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 animate-in slide-in-from-top-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#333]">{getActionTitle()}</h2>
                                        <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
                                        </button>
                                    </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            if (requisitionId) {
              onSubmit(requisitionId, comment);
            }
          }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-2">
                {action === 'assign' ? 'Assignment Notes' : 'Review Comment'} *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none disabled:bg-gray-50 resize-none"
                placeholder={action === 'assign' ? 
                  "Explain why you're assigning this requisition..." : 
                  "Provide a reason for your decision..."
                }
                style={{ minHeight: '100px' }}
              />
                                </div>
                                
            <div className="flex gap-3 pt-4">
                                        <button 
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
                                        </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-4 py-2 ${getActionColor()} text-white rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center justify-center`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {getActionButton()}
                  </>
                )}
              </button>
            </div>
          </form>
                                </div>
                            </div>
                        </div>
  );
};

// Assignment Modal Component
const AssignmentModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading, 
  formData, 
  setFormData,
  itUsers,
  isBulk = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requisitionId: number) => void;
  loading: boolean;
  formData: { assignedTo: string; notes: string };
  setFormData: React.Dispatch<React.SetStateAction<{ assignedTo: string; notes: string }>>;
  itUsers: ITUser[];
  isBulk?: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/10 pt-24" onClick={onClose}>
      <div 
        className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 animate-in slide-in-from-top-2 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#333]">
            {isBulk ? 'Assign Multiple Requisitions' : 'Assign Requisition'}
          </h2>
        <button 
            onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="h-6 w-6" />
        </button>
      </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(0); }} className="space-y-6">
            {isBulk && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  This will assign all selected requisitions to the chosen IT staff member.
                </p>
        </div>
            )}

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
                Assign To *
          </label>
          <select
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
            required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none disabled:bg-gray-50"
              >
                <option value="">Select IT Staff Member</option>
                {itUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </option>
                ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
                Assignment Notes
          </label>
          <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none disabled:bg-gray-50 resize-none"
                placeholder="Any notes about this assignment..."
                style={{ minHeight: '100px' }}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#00AEEF] hover:bg-[#00CEEB] text-white rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Assigning...
                  </>
                ) : (
                  isBulk ? 'Assign All Selected' : 'Assign Requisition'
                )}
          </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function SuperAdminRequisition(){
  const [itemRequests, setItemRequests] = useState<ItemRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<number | null>(null);
  const [itUsers, setItUsers] = useState<ITUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [ticketsPerPage] = useState<number>(10);

  // Modal states
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [commentAction, setCommentAction] = useState<'approve' | 'reject' | 'assign'>('approve');
  const [comment, setComment] = useState('');
  const [assignmentFormData, setAssignmentFormData] = useState({
    assignedTo: '',
    notes: ''
  });

  // Get current user from localStorage
  const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  };

  const fetchAllRequisitions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllItemRequisitions();
      setItemRequests(response.requisitions);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching requisitions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchITUsers = async () => {
    try {
      const response = await getITUsers();
      setItUsers(response.users);
    } catch (err: any) {
      console.error('Error fetching IT users:', err);
    }
  };

  useEffect(() => {
    fetchAllRequisitions();
    fetchITUsers();
  }, []);

  // Filter requisitions based on search and filters
  const filteredRequisitions = itemRequests.filter((requisition) => {
    const matchesSearch = 
      requisition.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requisition.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      requisition.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requisition.requested_by_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || requisition.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastRequisition = currentPage * ticketsPerPage;
  const indexOfFirstRequisition = indexOfLastRequisition - ticketsPerPage;
  const currentRequisitions = filteredRequisitions.slice(indexOfFirstRequisition, indexOfLastRequisition);
  const totalPages = Math.ceil(filteredRequisitions.length / ticketsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleStatusUpdate = async (requisitionId: number, status: 'approved' | 'rejected') => {
    try {
      setUpdatingStatus(requisitionId);
      const user = getCurrentUser();
      if (!user?.id) {
        throw new Error('User not found');
      }

      await updateItemRequisitionStatus(requisitionId, status, user.id);
      
      // Reset comment modal
      setComment('');
      setCommentModalOpen(false);
      
      // Refresh the list after update
      await fetchAllRequisitions();
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating requisition status:', err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleAssignRequisition = async (requisitionId: number) => {
    try {
      setUpdatingStatus(requisitionId);
      const user = getCurrentUser();
      if (!user?.id) {
        throw new Error('User not found');
      }

      await assignItemRequisition(requisitionId, {
        assignedTo: parseInt(assignmentFormData.assignedTo),
        assignedBy: user.id
      });
      
      // Reset form and close modal
      setAssignmentFormData({ assignedTo: '', notes: '' });
      setAssignmentModalOpen(false);
      
      // Refresh the list
      await fetchAllRequisitions();
    } catch (err: any) {
      setError(err.message);
      console.error('Error assigning requisition:', err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleOpenCommentModal = (requisitionId: number, action: 'approve' | 'reject' | 'assign') => {
    setSelectedRequisitionId(requisitionId);
    setCommentAction(action);
    setComment('');
    setCommentModalOpen(true);
  };

  const handleCommentSubmit = async (requisitionId: number, comment: string) => {
    if (commentAction === 'assign') {
      // For assignment, we'll use the assignment modal instead
      setCommentModalOpen(false);
      setAssignmentModalOpen(true);
      return;
    }

    // For approve/reject, proceed with status update
    await handleStatusUpdate(requisitionId, commentAction === 'approve' ? 'approved' : 'rejected');
  };

  const handleOpenAssignmentModal = (requisitionId: number) => {
    setSelectedRequisitionId(requisitionId);
    setAssignmentModalOpen(true);
  };

  const handleAssignmentSubmit = (requisitionId: number) => {
    if (selectedRequisitionId) {
      handleAssignRequisition(selectedRequisitionId);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select non-delivered requisitions
      const nonDeliveredRequests = itemRequests.filter(req => req.status !== 'delivered');
      setSelectedRequests(nonDeliveredRequests.map(req => req.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (requisitionId: number, checked: boolean) => {
    if (checked) {
      setSelectedRequests(prev => [...prev, requisitionId]);
    } else {
      setSelectedRequests(prev => prev.filter(id => id !== requisitionId));
    }
  };

  const handleViewDetails = (requisitionId: number) => {
    setSelectedRequisitionId(requisitionId);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedRequisitionId(null);
  };

  const getStatusColor = (status: string, assignedTo?: string): string => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'approved': 
        return assignedTo ? 'text-indigo-700 bg-indigo-100 border-indigo-200' : 'text-green-700 bg-green-100 border-green-200';
      case 'rejected': return 'text-red-700 bg-red-100 border-red-200';
      case 'assigned': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'delivered': return 'text-purple-700 bg-purple-100 border-purple-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusDisplay = (status: string, assignedTo?: string): string => {
    if (status === 'approved' && assignedTo) {
      return 'Approved & Assigned';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color?: string;
  }

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color = 'text-blue-600' }) => (
    <div className="bg-white rounded-xl p-4 lg:p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs lg:text-sm font-semibold text-gray-600 mb-1 truncate">{title}</p>
          <p className="text-xl lg:text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 lg:p-3 rounded-xl flex-shrink-0 ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F8F8]">
        <NavBar/>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex">
            <SideBar/>
            <main className="flex-1">
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-sky-600" />
                  <span className="text-gray-600">Loading requisitions...</span>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F0F8F8]">
        <NavBar/>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex">
            <SideBar/>
            <main className="flex-1">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-600">{error}</span>
                </div>
              </div>
              <button 
                onClick={fetchAllRequisitions}
                className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
              >
                Retry
              </button>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div className="min-h-screen bg-[#F0F8F8]">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          <SideBar />
          <main className="flex-1 min-w-0">
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Super Admin Requisition Management</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredRequisitions.length} requisition{filteredRequisitions.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                <StatCard 
                  title="Total Requests" 
                  value={itemRequests.length} 
                  icon={Package} 
                  color="text-blue-600" 
                />
                <StatCard 
                  title="Pending Review" 
                  value={itemRequests.filter(r => r.status === 'pending').length} 
                  icon={Clock} 
                  color="text-orange-600" 
                />
                <StatCard 
                  title="Approved" 
                  value={itemRequests.filter(r => r.status === 'approved').length} 
                  icon={CheckCircle} 
                  color="text-green-600" 
                />
                <StatCard 
                  title="Assigned" 
                  value={itemRequests.filter(r => r.status === 'assigned').length} 
                  icon={User} 
                  color="text-blue-600" 
                />
              </div>

              {/* Search and Filters */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search requisitions by ID, item name, status, or requester..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                  </div>
                  
                  {/* Status Filter */}
                  <div className="lg:w-48">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="assigned">Assigned</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block bg-white shadow-sm rounded-lg border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentRequisitions?.map((requisition) => (
                        <tr key={requisition.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-sky-600">#{requisition.id}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[120px] truncate" title={requisition.requested_by_name}>
                            {requisition.requested_by_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-[150px] truncate" title={requisition.item_name}>
                            {requisition.item_name}
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                            {requisition.quantity}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(requisition.status, requisition.assigned_to_name)}`}>
                              {getStatusDisplay(requisition.status, requisition.assigned_to_name)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[120px] truncate" title={requisition.assigned_to_name || 'N/A'}>
                            {requisition.assigned_to_name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(requisition.created_at)}
                          </td>
                          <td className="px-6 py-4 text-center space-x-2">
                            {/* Approve/Reject buttons moved to modal header */}
                            {requisition.status === 'approved' && (
                              <button 
                                onClick={() => handleOpenAssignmentModal(requisition.id)}
                                disabled={updatingStatus === requisition.id}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                                title="Assign to IT Staff"
                              >
                                {updatingStatus === requisition.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <User className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            <button 
                              onClick={() => handleViewDetails(requisition.id)}
                              className="p-1.5 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors" 
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards View */}
              <div className="block lg:hidden space-y-4">
                {currentRequisitions?.map((requisition) => (
                  <div key={requisition.id} className="bg-white shadow-sm rounded-lg border border-gray-100 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="h-6 w-6 rounded-full bg-sky-100 flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-sky-600">#{requisition.id}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{requisition.item_name}</h3>
                            <p className="text-xs text-gray-500">by {requisition.requested_by_name}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">Created: {formatDate(requisition.created_at)}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewDetails(requisition.id)}
                          className="text-sky-600 hover:text-sky-900 p-1" 
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(requisition.status, requisition.assigned_to_name)}`}>
                        {getStatusDisplay(requisition.status, requisition.assigned_to_name)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Quantity: {requisition.quantity}</p>
                      <p>Assigned to: {requisition.assigned_to_name || 'Unassigned'}</p>
                    </div>
                    
                    {/* Mobile Actions */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                      {/* Approve/Reject buttons moved to modal header */}
                      {requisition.status === 'approved' && (
                        <button 
                          onClick={() => handleOpenAssignmentModal(requisition.id)}
                          disabled={updatingStatus === requisition.id}
                          className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium transition-all hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          title="Assign to IT Staff"
                        >
                          {updatingStatus === requisition.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <User className="h-4 w-4 mr-1" />
                          )}
                          Assign
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {filteredRequisitions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Results info */}
                    <div className="text-sm text-gray-700">
                      Showing {indexOfFirstRequisition + 1} to {Math.min(indexOfLastRequisition, filteredRequisitions.length)} of {filteredRequisitions.length} requisitions
                    </div>
                    
                    {/* Pagination controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      
                      {/* Page numbers */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = index + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = index + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + index;
                          } else {
                            pageNumber = currentPage - 2 + index;
                          }
                          
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`px-3 py-2 text-sm font-medium rounded-md ${
                                currentPage === pageNumber
                                  ? 'bg-sky-600 text-white'
                                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
    </div>
  </div>
)}

              {/* Empty state */}
              {filteredRequisitions.length === 0 && !loading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <Package className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No requisitions found</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Try adjusting your search or filters.' 
                      : 'No requisitions have been created yet.'}
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modal Components */}
      <CommentModal 
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        onSubmit={handleCommentSubmit}
        loading={updatingStatus === selectedRequisitionId}
        comment={comment}
        setComment={setComment}
        requisitionId={selectedRequisitionId}
        action={commentAction}
      />

      <AssignmentModal 
        isOpen={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        onSubmit={handleAssignmentSubmit}
        loading={updatingStatus === selectedRequisitionId}
        formData={assignmentFormData}
        setFormData={setAssignmentFormData}
        itUsers={itUsers}
      />

      {/* Detail View Modal */}
      <ItemRequestModal
        isModalOpen={viewModalOpen}
        onClose={handleCloseViewModal}
        mode="view"
        requisitionId={selectedRequisitionId}
        onApprove={(requisitionId) => handleStatusUpdate(requisitionId, 'approved')}
        onReject={(requisitionId) => handleStatusUpdate(requisitionId, 'rejected')}
        updatingStatus={updatingStatus}
      />
    </div>
  );
}