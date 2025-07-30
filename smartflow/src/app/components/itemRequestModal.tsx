"use client"
import React, { useState, useEffect } from 'react';
import { XCircle, CheckCircle, Clock, User, Package, Calendar, Truck, MessageSquare } from 'lucide-react';
import { createItemRequisition, getItemRequisitionById, getPickupDetails, getStatusHistory, ItemRequisition, PickupDetails, StatusHistoryEntry } from '../services/itemRequisitionService';

export interface ItemRequestModalProps {
  isModalOpen: boolean;
  onClose: () => void;
  title?: string;
  mode?: 'create' | 'view';
  requisitionId?: number | null;
  onApprove?: (requisitionId: number) => void;
  onReject?: (requisitionId: number) => void;
  updatingStatus?: number | null;
}

export default function ItemRequestModal({ 
  isModalOpen, 
  onClose, 
  title = "Request New Equipment",
  mode = 'create',
  requisitionId,
  onApprove,
  onReject,
  updatingStatus
}: ItemRequestModalProps) {
  const [formData, setFormData] = useState({
    item_name: '',
    quantity: 1,
    justification: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requisitionDetails, setRequisitionDetails] = useState<ItemRequisition | null>(null);
  const [pickupDetails, setPickupDetails] = useState<PickupDetails | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [loadingPickup, setLoadingPickup] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  useEffect(() => {
    if (isModalOpen && mode === 'view' && requisitionId) {
      // Reset states when modal opens
      setRequisitionDetails(null);
      setPickupDetails(null);
      setStatusHistory([]);
      setError(null);
      setLoadingPickup(false);
      setLoadingHistory(false);
      
      // Fetch all data in parallel
      Promise.all([
        fetchRequisitionDetails(),
        fetchPickupDetails(),
        fetchStatusHistory()
      ]).catch(err => {
        console.error('Error fetching modal data:', err);
      });
    }
  }, [isModalOpen, mode, requisitionId]);

  const fetchRequisitionDetails = async () => {
    try {
      setLoading(true);
      const response = await getItemRequisitionById(requisitionId!);
      setRequisitionDetails(response.requisition);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching requisition details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPickupDetails = async () => {
    try {
      setLoadingPickup(true);
      const response = await getPickupDetails(requisitionId!);
      setPickupDetails(response.pickupDetails);
    } catch (err) {
      console.error('Error fetching pickup details:', err);
      setPickupDetails(null);
    } finally {
      setLoadingPickup(false);
    }
  };

  const fetchStatusHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await getStatusHistory('item_requisition', requisitionId!);
      setStatusHistory(response.history);
    } catch (err) {
      console.error('Error fetching status history:', err);
      setStatusHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = getCurrentUser();
      if (!user?.id) {
        throw new Error('User not found');
      }

      const response = await createItemRequisition({
        ...formData,
        requested_by: user.id
      });

      // Reset form
      setFormData({
        item_name: '',
        quantity: 1,
        justification: ''
      });

      onClose();
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating requisition:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    // Only close if not loading
    if (!loading) {
      onClose();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'assigned': return <User className="h-4 w-4 text-blue-500" />;
      case 'scheduled': return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'delivered': return <Truck className="h-4 w-4 text-green-600" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'approved': return 'text-green-700 bg-green-100 border-green-200';
      case 'rejected': return 'text-red-700 bg-red-100 border-red-200';
      case 'assigned': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'scheduled': return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'delivered': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/10 pt-24" onClick={handleCloseModal}>
      <div 
        className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl border border-gray-200 animate-in slide-in-from-top-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#333]">
            {mode === 'view' ? '' : 'New Item Request'}
          </h2>
          <div className="flex items-center space-x-2">
            {/* Approve/Reject buttons for view mode */}
            {mode === 'view' && requisitionDetails && requisitionDetails.status !== 'delivered' && onApprove && onReject && (
              <>
                <button 
                  onClick={() => onApprove(requisitionDetails.id)}
                  disabled={updatingStatus === requisitionDetails.id}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg font-medium transition-all hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  title="Approve Requisition"
                >
                  {updatingStatus === requisitionDetails.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <span>Approve</span>
                </button>
                <button 
                  onClick={() => onReject(requisitionDetails.id)}
                  disabled={updatingStatus === requisitionDetails.id}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-medium transition-all hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  title="Reject Requisition"
                >
                  {updatingStatus === requisitionDetails.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <span>Reject</span>
                </button>
              </>
            )}
            <button 
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(80vh-72px)] min-h-[200px]">
          {mode === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.item_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, item_name: e.target.value }))}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none disabled:bg-gray-50"
                  placeholder="e.g., Laptop, Monitor, Keyboard"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">
                  Justification *
                </label>
                <textarea
                  value={formData.justification}
                  onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
                  required
                  rows={4}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none disabled:bg-gray-50 resize-none"
                  placeholder="Please explain why you need this item..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
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
                      Creating...
                    </>
                  ) : (
                    'Create Request'
                  )}
                </button>
              </div>
            </form>
          ) : (
            // View Mode
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                  <span className="ml-2 text-gray-600">Loading details...</span>
                </div>
              ) : requisitionDetails ? (
                <>
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">#{requisitionDetails.id}</h3>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(requisitionDetails.status)}`}>
                        {getStatusIcon(requisitionDetails.status)}
                        <span className="ml-1">{requisitionDetails.status.charAt(0).toUpperCase() + requisitionDetails.status.slice(1)}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Item:</span>
                        <p className="text-gray-900 break-words">{requisitionDetails.item_name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Quantity:</span>
                        <p className="text-gray-900">{requisitionDetails.quantity}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="font-medium text-gray-700">Justification:</span>
                        <p className="text-gray-900 break-words whitespace-pre-line">{requisitionDetails.justification}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Requested by:</span>
                        <p className="text-gray-900">{requisitionDetails.requested_by_name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Created:</span>
                        <p className="text-gray-900">{formatDate(requisitionDetails.created_at)}</p>
                      </div>
                      {requisitionDetails.reviewed_by_name && (
                        <div>
                          <span className="font-medium text-gray-700">Reviewed by:</span>
                          <p className="text-gray-900">{requisitionDetails.reviewed_by_name}</p>
                        </div>
                      )}
                      {requisitionDetails.assigned_to_name && (
                        <div>
                          <span className="font-medium text-gray-700">Assigned to:</span>
                          <p className="text-gray-900">{requisitionDetails.assigned_to_name}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pickup Information */}
                  {(pickupDetails || loadingPickup) && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Pickup Information
                      </h4>
                      {loadingPickup ? (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-600"></div>
                          <span>Loading pickup details...</span>
                        </div>
                      ) : pickupDetails ? (
                        <div className="space-y-2 text-sm">
                          {pickupDetails.scheduled_pickup && (
                            <div>
                              <span className="font-medium text-gray-700">Scheduled Pickup:</span>
                              <p className="text-gray-900">{formatDate(pickupDetails.scheduled_pickup)}</p>
                            </div>
                          )}
                          {pickupDetails.picked_up_at && (
                            <div>
                              <span className="font-medium text-gray-700">Picked up:</span>
                              <p className="text-gray-900">{formatDate(pickupDetails.picked_up_at)}</p>
                            </div>
                          )}
                          {pickupDetails.delivered_at && (
                            <div>
                              <span className="font-medium text-gray-700">Delivered:</span>
                              <p className="text-gray-900">{formatDate(pickupDetails.delivered_at)}</p>
                            </div>
                          )}
                          {pickupDetails.delivered_by_name && (
                            <div>
                              <span className="font-medium text-gray-700">Delivered by:</span>
                              <p className="text-gray-900">{pickupDetails.delivered_by_name}</p>
                            </div>
                          )}
                          {pickupDetails.notes && (
                            <div>
                              <span className="font-medium text-gray-700">Notes:</span>
                              <p className="text-gray-900 break-words whitespace-pre-line">{pickupDetails.notes}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No pickup information available</p>
                      )}
                    </div>
                  )}

                  {/* Status History */}
                  {(statusHistory.length > 0 || loadingHistory) && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Status History
                      </h4>
                      {loadingHistory ? (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-600"></div>
                          <span>Loading status history...</span>
                        </div>
                      ) : statusHistory.length > 0 ? (
                        <div className="space-y-3">
                          {statusHistory.map((entry, index) => (
                            <div key={entry.id} className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-2 h-2 bg-sky-500 rounded-full mt-2"></div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(entry.new_status)}
                                  <span className="font-medium text-gray-900">
                                    {entry.new_status.charAt(0).toUpperCase() + entry.new_status.slice(1)}
                                  </span>
                                  {entry.previous_status && (
                                    <>
                                      <span className="text-gray-400">from</span>
                                      <span className="text-gray-600">
                                        {entry.previous_status.charAt(0).toUpperCase() + entry.previous_status.slice(1)}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {entry.changed_by_name && (
                                    <span>by {entry.changed_by_name} • </span>
                                  )}
                                  {formatDate(entry.changed_at)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No status history available</p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No details available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}