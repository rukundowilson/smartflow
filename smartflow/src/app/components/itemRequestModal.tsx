"use client"
import { useState } from 'react';
import { 
  Plus, 
  Eye,
  Laptop,
  Printer,
  Cable,
  XCircle,
  User,
  Calendar,
  Package,
  CheckCircle,
  XCircle as XCircleIcon,
  Clock,
  Truck,
  MessageSquare,
} from 'lucide-react';
import { createItemRequisition, getItemRequisitionById, getPickupDetails, ItemRequisition, PickupDetails } from '../services/itemRequisitionService';
import React from 'react'; // Added missing import for React.useEffect

interface ItemRequestModalProps {
  isModalOpen: boolean;
  onClose: () => void;
  title?: string;
  mode?: 'create' | 'view';
  requisitionId?: number | null;
}

export default function ItemRequestModal({ 
  isModalOpen, 
  onClose, 
  title = "Request New Equipment",
  mode = 'create',
  requisitionId
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

    const handleInputChange = (e:any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getCurrentUser = () => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        }
        return null;
    };

    const handleSubmit = async (e:any) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const user = getCurrentUser();
            if (!user?.id) {
                throw new Error('User not found');
            }

            await createItemRequisition({
                requested_by: user.id,
                item_name: formData.item_name,
                quantity: formData.quantity,
                justification: formData.justification
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
        } finally {
            setLoading(false);
        }
    };

    const fetchRequisitionDetails = async () => {
        if (!requisitionId) return;
        
        try {
            setLoading(true);
            setError(null);
            const [requisitionResponse, pickupResponse] = await Promise.all([
                getItemRequisitionById(requisitionId),
                getPickupDetails(requisitionId)
            ]);
            setRequisitionDetails(requisitionResponse.requisition);
            setPickupDetails(pickupResponse.pickupDetails);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch details when modal opens in view mode
    React.useEffect(() => {
        if (isModalOpen && mode === 'view' && requisitionId) {
            fetchRequisitionDetails();
        }
    }, [isModalOpen, mode, requisitionId]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4 text-orange-500" />;
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'rejected':
                return <XCircleIcon className="h-4 w-4 text-red-500" />;
            case 'delivered':
                return <Truck className="h-4 w-4 text-purple-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-orange-700 bg-orange-100 border-orange-200';
            case 'approved':
                return 'text-green-700 bg-green-100 border-green-200';
            case 'rejected':
                return 'text-red-700 bg-red-100 border-red-200';
            case 'delivered':
                return 'text-purple-700 bg-purple-100 border-purple-200';
            default:
                return 'text-gray-700 bg-gray-100 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
  if (!isModalOpen) return null;

  interface ActionButtonProps {
    icon: React.ElementType;
    label: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    variant?: 'primary' | 'secondary';
  }

  const ActionButton: React.FC<ActionButtonProps> = ({ 
    icon: Icon, 
    label, 
    onClick, 
    variant = 'primary'
  }) => {
    const baseClasses = "inline-flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto";
    const variants = {
      primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
      secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-sky-500"
    };
    
    return (
      <button 
        onClick={onClick} 
        className={`${baseClasses} ${variants[variant]}`}
      >
        <Icon className="h-4 w-4 mr-2" />
        {label}
      </button>
    );
  };

  return (
  <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/10 pt-24" onClick={onClose}>
    <div 
      className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl border border-gray-200 animate-in slide-in-from-top-2 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-[#333]">
          {mode === 'view' ? 'Requisition Details' : 'New Item Request'}
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="h-6 w-6" />
        </button>
      </div>

      <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {mode === 'view' ? (
          // View Mode - Display Requisition Details
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                <span className="ml-2 text-gray-600">Loading details...</span>
              </div>
            ) : requisitionDetails ? (
              <>
                {/* Header with ID and Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-sky-600" />
                    <span className="text-lg font-semibold text-gray-900">#{requisitionDetails.id}</span>
                  </div>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full border flex items-center space-x-1 ${getStatusColor(requisitionDetails.status)}`}>
                    {getStatusIcon(requisitionDetails.status)}
                    <span>{requisitionDetails.status.charAt(0).toUpperCase() + requisitionDetails.status.slice(1)}</span>
                  </span>
                </div>

                {/* Details Grid */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-600">Item Name</label>
                      <p className="text-sm font-semibold text-gray-900">{requisitionDetails.item_name}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-600">Quantity</label>
                      <p className="text-sm font-semibold text-gray-900">{requisitionDetails.quantity}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">Requested By</label>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <p className="text-sm font-semibold text-gray-900">{requisitionDetails.requested_by_name}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">Created At</label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-sm font-semibold text-gray-900">{formatDate(requisitionDetails.created_at)}</p>
                    </div>
                  </div>

                  {requisitionDetails.reviewed_by_name && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-600">Reviewed By</label>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-semibold text-gray-900">{requisitionDetails.reviewed_by_name}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">Justification</label>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">
                      {requisitionDetails.justification}
                    </p>
                  </div>

                  {/* Pickup and Delivery Information */}
                  {pickupDetails && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <Truck className="h-5 w-5 text-purple-600" />
                        <span>Pickup & Delivery Information</span>
                      </h3>
                      
                      {pickupDetails.scheduled_pickup && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-600">Scheduled Pickup</label>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-900">{formatDate(pickupDetails.scheduled_pickup)}</p>
                          </div>
                        </div>
                      )}

                      {pickupDetails.picked_up_at && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-600">Picked Up At</label>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-900">{formatDate(pickupDetails.picked_up_at)}</p>
                          </div>
                        </div>
                      )}

                      {pickupDetails.delivered_at && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-600">Delivered At</label>
                          <div className="flex items-center space-x-2">
                            <Truck className="h-4 w-4 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-900">{formatDate(pickupDetails.delivered_at)}</p>
                          </div>
                        </div>
                      )}

                      {pickupDetails.delivered_by_name && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-600">Delivered By</label>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-900">{pickupDetails.delivered_by_name}</p>
                          </div>
                        </div>
                      )}

                      {pickupDetails.notes && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-600">Notes</label>
                          <div className="flex items-start space-x-2">
                            <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border flex-1">
                              {pickupDetails.notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Requisition not found</p>
              </div>
            )}
          </div>
        ) : (
          // Create Mode - Form
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-2">
                Item Name *
              </label>
              <input
                type="text"
                name="item_name"
                value={formData.item_name}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none disabled:bg-gray-50"
                placeholder="e.g., MacBook Pro, Wireless Mouse"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333] mb-2">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
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
                name="justification"
                value={formData.justification}
                onChange={handleInputChange}
                required
                disabled={loading}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none disabled:bg-gray-50"
                placeholder="Please explain why you need this item..."
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
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  </div>
  );
}