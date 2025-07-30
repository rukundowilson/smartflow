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
} from 'lucide-react';
import { 
  getAllItemRequisitions, 
  updateItemRequisitionStatus, 
  scheduleItemPickup,
  markItemAsDelivered,
  assignItemRequisition,
  ItemRequisition 
} from '../services/itemRequisitionService';
import { getITUsers, ITUser } from '../services/itTicketService';
import ItemRequestModal from './itemRequestModal';

// Independent Pickup Modal Component
const PickupModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading, 
  formData, 
  setFormData 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requisitionId: number) => void;
  loading: boolean;
  formData: { scheduledPickup: string; notes: string };
  setFormData: React.Dispatch<React.SetStateAction<{ scheduledPickup: string; notes: string }>>;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/10 pt-24" onClick={onClose}>
      <div 
        className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 animate-in slide-in-from-top-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#333]">Schedule Pickup</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(0); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-2">
                Scheduled Pickup Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledPickup}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledPickup: e.target.value }))}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333] mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none disabled:bg-gray-50 resize-none"
                placeholder="Any additional notes for pickup..."
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
                    Scheduling...
                  </>
                ) : (
                  'Schedule Pickup'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Independent Delivery Modal Component
const DeliveryModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading, 
  formData, 
  setFormData 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requisitionId: number) => void;
  loading: boolean;
  formData: { notes: string };
  setFormData: React.Dispatch<React.SetStateAction<{ notes: string }>>;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/10 pt-24" onClick={onClose}>
      <div 
        className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 animate-in slide-in-from-top-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#333]">Mark as Delivered</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(0); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-2">
                Delivery Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none disabled:bg-gray-50 resize-none"
                placeholder="Any notes about the delivery..."
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
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Marking...
                  </>
                ) : (
                  'Mark as Delivered'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Independent Assignment Modal Component
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

export default function RequisationComponent(){
      const [sidebarOpen, setSidebarOpen] = useState(false);
      const [itemRequests, setItemRequests] = useState<ItemRequisition[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
      const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
      const [viewModalOpen, setViewModalOpen] = useState(false);
      const [selectedRequisitionId, setSelectedRequisitionId] = useState<number | null>(null);
      const [pickupModalOpen, setPickupModalOpen] = useState(false);
      const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
      const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
      const [itUsers, setItUsers] = useState<ITUser[]>([]);
      const [pickupFormData, setPickupFormData] = useState({
        scheduledPickup: '',
        notes: ''
      });
      const [deliveryFormData, setDeliveryFormData] = useState({
        notes: ''
      });
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

      // Check if current user is super admin
      const isSuperAdmin = () => {
        const user = getCurrentUser();
        return user?.role === 'superadmin' || user?.role === 'admin';
      };

      // Check if current user is IT staff
      const isITStaff = () => {
        const user = getCurrentUser();
        const itDepartments = ['it_staff', 'IT Department', 'IT'];
        return user?.role === 'it_staff' || 
               itDepartments.includes(user?.department);
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

      const handleStatusUpdate = async (requisitionId: number, status: 'approved' | 'rejected') => {
        try {
          setUpdatingStatus(requisitionId);
          const user = getCurrentUser();
          if (!user?.id) {
            throw new Error('User not found');
          }

          await updateItemRequisitionStatus(requisitionId, status, user.id);
          
          // Refresh the list after update
          await fetchAllRequisitions();
        } catch (err: any) {
          setError(err.message);
          console.error('Error updating requisition status:', err);
        } finally {
          setUpdatingStatus(null);
        }
      };

      const handleSchedulePickup = async (requisitionId: number) => {
        try {
          setUpdatingStatus(requisitionId);
          await scheduleItemPickup(requisitionId, pickupFormData.scheduledPickup, pickupFormData.notes);
          
          // Reset form and close modal
          setPickupFormData({ scheduledPickup: '', notes: '' });
          setPickupModalOpen(false);
          
          // Refresh the list
          await fetchAllRequisitions();
        } catch (err: any) {
          setError(err.message);
          console.error('Error scheduling pickup:', err);
        } finally {
          setUpdatingStatus(null);
        }
      };

      const handleMarkAsDelivered = async (requisitionId: number) => {
        try {
          setUpdatingStatus(requisitionId);
          const user = getCurrentUser();
          if (!user?.id) {
            throw new Error('User not found');
          }

          await markItemAsDelivered(requisitionId, user.id, deliveryFormData.notes);
          
          // Reset form and close modal
          setDeliveryFormData({ notes: '' });
          setDeliveryModalOpen(false);
          
          // Refresh the list
          await fetchAllRequisitions();
        } catch (err: any) {
          setError(err.message);
          console.error('Error marking as delivered:', err);
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

      const handleOpenAssignmentModal = (requisitionId: number) => {
        setSelectedRequisitionId(requisitionId);
        setAssignmentModalOpen(true);
      };

      const handleAssignmentSubmit = (requisitionId: number) => {
        if (selectedRequisitionId) {
          handleAssignRequisition(selectedRequisitionId);
        } else if (selectedRequests.length > 0) {
          handleBulkAssignment();
        }
      };

      const handleSelectAll = (checked: boolean) => {
        if (checked) {
          // Only select approved requisitions for IT staff (can only assign approved)
          const selectableRequests = itemRequests.filter(req => req.status === 'approved');
          setSelectedRequests(selectableRequests.map(req => req.id));
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

      const handleBulkAction = async (action: 'approve' | 'reject') => {
        if (selectedRequests.length === 0) {
          setError('Please select at least one request');
          return;
        }

        try {
          const user = getCurrentUser();
          if (!user?.id) {
            throw new Error('User not found');
          }

          // Only approve/reject non-delivered requisitions for Super Admin
          const pendingRequests = itemRequests.filter(req => req.status !== 'delivered');

          // Update all selected requests
          for (const requisitionId of selectedRequests) {
            // Only update if the requisition is not delivered
            if (pendingRequests.some(req => req.id === requisitionId)) {
              await updateItemRequisitionStatus(requisitionId, action === 'approve' ? 'approved' : 'rejected', user.id);
            }
          }

          // Clear selection and refresh
          setSelectedRequests([]);
          await fetchAllRequisitions();
        } catch (err: any) {
          setError(err.message);
          console.error('Error performing bulk action:', err);
        }
      };

      const handleBulkAssignment = async () => {
        if (selectedRequests.length === 0) {
          setError('Please select at least one request');
          return;
        }

        if (!assignmentFormData.assignedTo) {
          setError('Please select an IT staff member to assign to');
          return;
        }

        try {
          const user = getCurrentUser();
          if (!user?.id) {
            throw new Error('User not found');
          }

          // Only assign approved requisitions for IT staff
          const pendingRequests = itemRequests.filter(req => req.status === 'approved');

          // Assign all selected requests
          for (const requisitionId of selectedRequests) {
            // Only assign if the requisition is not delivered
            if (pendingRequests.some(req => req.id === requisitionId)) {
              await assignItemRequisition(requisitionId, {
                assignedTo: parseInt(assignmentFormData.assignedTo),
                assignedBy: user.id
              });
            }
          }

          // Clear selection and refresh
          setSelectedRequests([]);
          setAssignmentFormData({ assignedTo: '', notes: '' });
          setAssignmentModalOpen(false);
          await fetchAllRequisitions();
        } catch (err: any) {
          setError(err.message);
          console.error('Error performing bulk assignment:', err);
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

      const handleOpenPickupModal = (requisitionId: number) => {
        setSelectedRequisitionId(requisitionId);
        setPickupModalOpen(true);
      };

      const handleOpenDeliveryModal = (requisitionId: number) => {
        setSelectedRequisitionId(requisitionId);
        setDeliveryModalOpen(true);
      };

      const handlePickupSubmit = (requisitionId: number) => {
        if (selectedRequisitionId) {
          handleSchedulePickup(selectedRequisitionId);
        }
      };

      const handleDeliverySubmit = (requisitionId: number) => {
        if (selectedRequisitionId) {
          handleMarkAsDelivered(selectedRequisitionId);
        }
      };

      // Wrapper functions for modal approve/reject
      const handleApprove = (requisitionId: number) => {
        handleStatusUpdate(requisitionId, 'approved');
      };

      const handleReject = (requisitionId: number) => {
        handleStatusUpdate(requisitionId, 'rejected');
      };
    
      const getStatusColor = (status: string, assignedTo?: string): string => {
        switch (status.toLowerCase()) {
          case 'pending': return 'text-orange-700 bg-orange-100 border-orange-200';
          case 'approved':
            // If approved and assigned, show a special color
            return assignedTo ? 'text-indigo-700 bg-indigo-100 border-indigo-200' : 'text-green-700 bg-green-100 border-green-200';
          case 'rejected': return 'text-red-700 bg-red-100 border-red-200';
          case 'assigned': return 'text-blue-700 bg-blue-100 border-blue-200';
          case 'scheduled': return 'text-purple-700 bg-purple-100 border-purple-200';
          case 'delivered': return 'text-green-700 bg-green-100 border-green-200';
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
        action?: string;
      }
    
      const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color = 'text-blue-600', action }) => (
        <div className="bg-white rounded-xl p-4 lg:p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-semibold text-gray-600 mb-1 truncate">{title}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">{value}</p>
              {action && <p className="text-xs text-gray-500 mt-1 truncate">{action}</p>}
            </div>
            <div className={`p-2 lg:p-3 rounded-xl flex-shrink-0 ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
              <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${color}`} />
            </div>
          </div>
        </div>
      );
    
      interface ActionButtonProps {
        icon: React.ElementType;
        label: string;
        onClick?: React.MouseEventHandler<HTMLButtonElement>;
        variant?: 'primary' | 'secondary' | 'danger' | 'success';
        size?: 'sm' | 'md' | 'lg';
        disabled?: boolean;
      }
    
      const ActionButton: React.FC<ActionButtonProps> = ({ 
        icon: Icon, 
        label, 
        onClick, 
        variant = 'primary', 
        size = 'md',
        disabled = false
      }) => {
        const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
        
        const sizeClasses = {
          sm: "px-3 py-2 text-sm",
          md: "px-4 py-2.5 text-sm",
          lg: "px-6 py-3 text-base"
        };
        
        const variants = {
          primary: "bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 focus:ring-sky-300 shadow-lg shadow-sky-500/25",
          secondary: "bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 focus:ring-gray-300 shadow-lg",
          danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-300 shadow-lg shadow-red-500/25",
          success: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-300 shadow-lg shadow-green-500/25"
        };
        
        return (
          <button 
            onClick={onClick} 
            disabled={disabled}
            className={`${baseClasses} ${sizeClasses[size]} ${variants[variant]} w-full sm:w-auto`}
          >
            <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        );
      };

      // Enhanced Mobile Card Component
      const MobileItemCard = ({ request }: { request: ItemRequisition }) => (
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0 mr-3">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900">#{request.id}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status, request.assigned_to_name)}`}>
                  {getStatusDisplay(request.status, request.assigned_to_name)}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium">{request.requested_by_name}</p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <input 
                type="checkbox" 
                checked={selectedRequests.includes(request.id)}
                onChange={(e) => handleSelectRequest(request.id, e.target.checked)}
                disabled={request.status !== 'approved'}
                className="w-5 h-5 rounded border-2 border-gray-300 text-sky-600 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-500">Item</span>
              <span className="text-sm font-semibold text-gray-900 text-right ml-3 break-words">{request.item_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Quantity</span>
              <span className="text-sm font-semibold text-gray-900">{request.quantity}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-500">Justification</span>
              <span className="text-sm font-semibold text-gray-900 text-right ml-3 break-words line-clamp-2">{request.justification}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Assigned To</span>
              <span className="text-sm font-semibold text-gray-900">{request.assigned_to_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Created</span>
              <span className="text-sm font-semibold text-gray-900">{formatDate(request.created_at)}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 pt-4 border-t border-gray-100">
                                {/* Approve/Reject buttons moved to modal header */}
            {/* Pickup Actions for Approved Requisitions */}
            {request.status === 'approved' && (
              <button 
                onClick={() => handleOpenPickupModal(request.id)}
                disabled={updatingStatus === request.id}
                className="flex items-center justify-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium transition-all hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                title="Schedule Pickup"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Pickup
                </button>
            )}
            
            {/* Delivery Actions for Approved and Scheduled Requisitions */}
            {(request.status === 'approved' || request.status === 'scheduled') && (
              <button 
                onClick={() => handleOpenDeliveryModal(request.id)}
                disabled={updatingStatus === request.id}
                className="flex items-center justify-center px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium transition-all hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                title="Mark as Delivered"
              >
                <Truck className="h-4 w-4 mr-1" />
                Deliver
              </button>
            )}
            {/* Individual assign button removed - use bulk assign instead */}
            <button 
              onClick={() => handleViewDetails(request.id)}
              className="flex items-center justify-center px-3 py-2 bg-sky-100 text-sky-700 rounded-lg font-medium transition-all hover:bg-sky-200 text-sm"
              title="View Details"
            >
              <Eye className="h-4 w-4 mr-1" />
              Details
            </button>
          </div>
        </div>
      );

      if (loading) {
        return (
          <div className="flex-1 lg:ml-6 xl:ml-8">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-6 w-6 animate-spin text-sky-600" />
                <span className="text-gray-600">Loading requisitions...</span>
              </div>
            </div>
          </div>
        );
      }

      if (error) {
        return (
          <div className="flex-1 lg:ml-6 xl:ml-8">
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
          </div>
        );
      }
    
    return(
        <>
                  {/* Main Content with proper margins */}
                  <main className="flex-1 lg:ml-6 xl:ml-8">
                    <div className="space-y-4 lg:space-y-6">
                      {/* Desktop Header */}
                      <div className="hidden lg:block">
                  <div className="mb-4">
                    <h2 className="text-2xl xl:text-3xl text-gray-900 mb-2">Item Requisitions</h2>
                          <p className="text-gray-600 lg:text-lg">Manage and track hardware and equipment requests</p>
                        </div>
                        
                        {/* Stats Cards Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6">
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
                      </div>

                      {/* Mobile Header with Stats */}
                      <div className="lg:hidden mb-4">
                        <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Item Requisitions</h2>
                    <p className="text-gray-600 text-sm">Manage and track hardware requests</p>
                        </div>
                        
                        {/* Mobile Stats Grid - Fixed overflow */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-500 truncate">Total</p>
                                <p className="text-xl font-bold text-gray-900">{itemRequests.length}</p>
                              </div>
                              <Package className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2" />
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-500 truncate">Pending</p>
                          <p className="text-xl font-bold text-gray-900">{itemRequests.filter(r => r.status === 'pending').length}</p>
                              </div>
                              <Clock className="h-5 w-5 text-orange-600 flex-shrink-0 ml-2" />
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 truncate">Approved</p>
                          <p className="text-xl font-bold text-gray-900">{itemRequests.filter(r => r.status === 'approved').length}</p>
                              </div>
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" />
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 truncate">Assigned</p>
                          <p className="text-xl font-bold text-gray-900">{itemRequests.filter(r => r.status === 'assigned').length}</p>
                              </div>
                        <User className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2" />
                            </div>
                          </div>
                        </div>

                  {/* Mobile Quick Actions - Only for approved requisitions */}
                  {selectedRequests.length > 0 && (
                    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        {selectedRequests.length} item{selectedRequests.length > 1 ? 's' : ''} selected
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {/* Super Admin Actions */}
                        {isSuperAdmin() && (
                          <>
                            <button 
                              onClick={() => handleBulkAction('approve')}
                              className="flex items-center justify-center px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium transition-all hover:bg-green-200 text-xs"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            <button 
                              onClick={() => handleBulkAction('reject')}
                              className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg font-medium transition-all hover:bg-red-200 text-xs"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                        {/* Bulk Assign Action - Only for approved requisitions */}
                        <button 
                          onClick={() => handleOpenAssignmentModal(0)}
                          className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium transition-all hover:bg-blue-200 text-xs"
                        >
                          <User className="h-4 w-4 mr-1" />
                          Assign
                        </button>
                      </div>
                    </div>
                  )}
                      </div>

                      {/* Enhanced Desktop Table */}
                      <div className="hidden lg:block">
                  <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
                          <div className="px-4 lg:px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">All Requests</h3>
                      <div className="flex flex-wrap gap-2">
                        {/* Super Admin Actions */}
                        {isSuperAdmin() && (
                          <>
                              <ActionButton 
                                icon={CheckCircle} 
                              label="Approve Selected" 
                                variant="success" 
                                size="sm"
                              onClick={() => handleBulkAction('approve')}
                              disabled={selectedRequests.length === 0}
                            />
                            <ActionButton 
                              icon={XCircle} 
                              label="Reject Selected" 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleBulkAction('reject')}
                              disabled={selectedRequests.length === 0}
                            />
                          </>
                        )}
                        {/* Bulk Assign Action - Only for approved requisitions */}
                        <ActionButton 
                          icon={User} 
                          label="Assign Selected" 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleOpenAssignmentModal(0)}
                          disabled={selectedRequests.length === 0}
                              />
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                      <table className="w-full min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                            <th className="px-3 py-3 text-left">
                                    <input 
                                      type="checkbox" 
                                  checked={selectedRequests.length === itemRequests.filter(req => req.status === 'approved').length && itemRequests.filter(req => req.status === 'approved').length > 0}
                                  onChange={(e) => handleSelectAll(e.target.checked)}
                                  className="w-4 h-4 rounded border-2 border-gray-300 text-sky-600 focus:ring-sky-500"
                                    />
                                  </th>
                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee</th>
                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Item</th>
                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Qty</th>
                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Assigned</th>
                            <th className="px-3 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-100">
                                {itemRequests.map(request => (
                                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 py-3">
                                      <input 
                                        type="checkbox" 
                                  checked={selectedRequests.includes(request.id)}
                                  onChange={(e) => handleSelectRequest(request.id, e.target.checked)}
                                  disabled={request.status !== 'approved'}
                                  className="w-4 h-4 rounded border-2 border-gray-300 text-sky-600 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                      />
                                    </td>
                              <td className="px-3 py-3 text-sm font-bold text-gray-900">#{request.id}</td>
                              <td className="px-3 py-3 text-sm font-medium text-gray-900 max-w-[120px] truncate" title={request.requested_by_name}>
                                {request.requested_by_name}
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-900 max-w-[150px] truncate" title={request.item_name}>
                                {request.item_name}
                              </td>
                              <td className="px-3 py-3 text-sm font-medium text-gray-900">{request.quantity}</td>
                              <td className="px-3 py-3">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status, request.assigned_to_name)}`}>
                                  {getStatusDisplay(request.status, request.assigned_to_name)}
                                      </span>
                                    </td>
                              <td className="px-3 py-3 text-sm font-medium text-gray-900 max-w-[120px] truncate" title={request.assigned_to_name || 'N/A'}>
                                {request.assigned_to_name || 'N/A'}
                              </td>
                              <td className="px-3 py-3 text-right">
                                <div className="flex justify-end space-x-1">
                                  {/* Approve/Reject buttons moved to modal header */}
                                  {/* Individual assign button removed - use bulk assign instead */}
                                  {/* Pickup Actions for Approved Requisitions */}
                                  {request.status === 'approved' && (
                                    <button 
                                      onClick={() => handleOpenPickupModal(request.id)}
                                      disabled={updatingStatus === request.id}
                                      className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
                                      title="Schedule Pickup"
                                    >
                                      <Calendar className="h-4 w-4" />
                                            </button>
                                  )}
                                  
                                  {/* Delivery Actions for Approved and Scheduled Requisitions */}
                                  {(request.status === 'approved' || request.status === 'scheduled') && (
                                    <button 
                                      onClick={() => handleOpenDeliveryModal(request.id)}
                                      disabled={updatingStatus === request.id}
                                      className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                                      title="Mark as Delivered"
                                    >
                                      <Truck className="h-4 w-4" />
                                          </button>
                                        )}
                                  {/* View Details Button for All Requisitions */}
                                  <button 
                                    onClick={() => handleViewDetails(request.id)}
                                    className="p-1.5 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors" 
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Mobile Card View - Fixed spacing */}
                <div className="lg:hidden space-y-3">
                  {itemRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No item requisitions found</p>
                    </div>
                  ) : (
                    itemRequests.map(request => (
                      <MobileItemCard key={request.id} request={request} />
                    ))
                  )}
                </div>
              </div>
            </main>

            {/* Independent Modal Components */}
            <AssignmentModal 
              isOpen={assignmentModalOpen}
              onClose={() => setAssignmentModalOpen(false)}
              onSubmit={handleAssignmentSubmit}
              loading={updatingStatus === selectedRequisitionId}
              formData={assignmentFormData}
              setFormData={setAssignmentFormData}
              itUsers={itUsers}
              isBulk={selectedRequests.length > 0 && !selectedRequisitionId}
            />

            <PickupModal 
              isOpen={pickupModalOpen}
              onClose={() => setPickupModalOpen(false)}
              onSubmit={handlePickupSubmit}
              loading={updatingStatus === selectedRequisitionId}
              formData={pickupFormData}
              setFormData={setPickupFormData}
            />

            <DeliveryModal 
              isOpen={deliveryModalOpen}
              onClose={() => setDeliveryModalOpen(false)}
              onSubmit={handleDeliverySubmit}
              loading={updatingStatus === selectedRequisitionId}
              formData={deliveryFormData}
              setFormData={setDeliveryFormData}
            />

            {/* Detail View Modal */}
            <ItemRequestModal
              isModalOpen={viewModalOpen}
              onClose={handleCloseViewModal}
              mode="view"
              requisitionId={selectedRequisitionId}
              onApprove={handleApprove}
              onReject={handleReject}
              updatingStatus={updatingStatus}
            />
        </>
    )
}