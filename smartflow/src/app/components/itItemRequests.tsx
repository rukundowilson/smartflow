"use client"
import { useState, useEffect } from 'react';

import { 
  Package, 
  Plus,
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Truck,
  MessageSquare
} from 'lucide-react';
import ItemRequestModal from './itemRequestModal';
import { getUserItemRequisitions, createItemRequisition, ItemRequisition, getPickupDetails, PickupDetails } from '../services/itemRequisitionService';
import { useAuth } from "@/app/contexts/auth-context";

export default function ITItemRequests(){
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requests, setRequests] = useState<ItemRequisition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedRequisitionId, setSelectedRequisitionId] = useState<number | null>(null);
    const [pickupDetails, setPickupDetails] = useState<PickupDetails | null>(null);

    const fetchUserRequisitions = async () => {
        try {
            setLoading(true);
            if (!user?.id) {
                throw new Error('User not found');
            }
            
            const response = await getUserItemRequisitions(user.id);
            setRequests(response.requisitions);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching requisitions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (requisitionId: number) => {
        setSelectedRequisitionId(requisitionId);
        setViewModalOpen(true);
        
        // Fetch pickup details for this requisition
        try {
            const pickupData = await getPickupDetails(requisitionId);
            setPickupDetails(pickupData.pickupDetails);
        } catch (err) {
            console.error('Error fetching pickup details:', err);
            setPickupDetails(null);
        }
    };

    const handleCloseViewModal = () => {
        setViewModalOpen(false);
        setSelectedRequisitionId(null);
        setPickupDetails(null);
    };

    useEffect(() => {
        fetchUserRequisitions();
    }, [user?.id]);

    const getStatusIcon = (status: any) => {
        switch(status) {
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-blue-500" />;
            case 'delivered':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'assigned':
                return <User className="h-4 w-4 text-indigo-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status : any) => {
        switch(status) {
            case 'pending':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'approved':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'delivered':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'assigned':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
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

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading your requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Item Requests</h1>
                    <p className="text-gray-600 mt-2">Track your hardware and equipment requests</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Request
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-600">{error}</span>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Requests</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{requests.length}</p>
                        </div>
                        <Package className="h-8 w-8 text-sky-600" />
                    </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {requests.filter(r => r.status === 'pending').length}
                            </p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Approved</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {requests.filter(r => r.status === 'approved').length}
                            </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Delivered</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {requests.filter(r => r.status === 'delivered').length}
                            </p>
                        </div>
                        <Truck className="h-8 w-8 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Requests List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
                </div>
                
                {requests.length === 0 ? (
                    <div className="p-6 text-center">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No requests found</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-4 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
                        >
                            Create Your First Request
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {requests.map((request) => (
                            <div key={request.id} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {request.item_name}
                                            </h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                                                {getStatusIcon(request.status)}
                                                <span className="ml-1 capitalize">{request.status}</span>
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mt-1">{request.justification}</p>
                                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                            <span>Requested: {formatDate(request.created_at)}</span>
                                            {request.assigned_to_name && (
                                                <span>Assigned to: {request.assigned_to_name}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleViewDetails(request.id)}
                                            className="p-2 text-gray-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                            title="View details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Request Modal */}
            <ItemRequestModal
                isModalOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchUserRequisitions();
                }}
            />

            {/* View Details Modal */}
            {viewModalOpen && selectedRequisitionId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Request Details</h3>
                        </div>
                        
                        <div className="p-6">
                            {requests.find(r => r.id === selectedRequisitionId) && (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Item Name</h4>
                                        <p className="text-gray-600">{requests.find(r => r.id === selectedRequisitionId)?.item_name}</p>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-medium text-gray-900">Justification</h4>
                                        <p className="text-gray-600">{requests.find(r => r.id === selectedRequisitionId)?.justification}</p>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-medium text-gray-900">Status</h4>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(requests.find(r => r.id === selectedRequisitionId)?.status)}`}>
                                            {getStatusIcon(requests.find(r => r.id === selectedRequisitionId)?.status)}
                                            <span className="ml-1 capitalize">{requests.find(r => r.id === selectedRequisitionId)?.status}</span>
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-medium text-gray-900">Requested On</h4>
                                        <p className="text-gray-600">{formatDate(requests.find(r => r.id === selectedRequisitionId)?.created_at || '')}</p>
                                    </div>
                                    
                                    {pickupDetails && (
                                        <div>
                                            <h4 className="font-medium text-gray-900">Pickup Details</h4>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-gray-600">
                                                    <strong>Scheduled Pickup:</strong> {formatDate(pickupDetails.scheduled_pickup)}
                                                </p>
                                                {pickupDetails.notes && (
                                                    <p className="text-gray-600 mt-2">
                                                        <strong>Notes:</strong> {pickupDetails.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div className="px-6 py-4 border-t border-gray-200">
                            <button
                                onClick={handleCloseViewModal}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 