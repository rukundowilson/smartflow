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

export default function Requisition(){
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requests, setRequests] = useState<ItemRequisition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedRequisitionId, setSelectedRequisitionId] = useState<number | null>(null);
    const [pickupDetails, setPickupDetails] = useState<PickupDetails | null>(null);

    // Get current user from localStorage
    const getCurrentUser = () => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        }
        return null;
    };

    const fetchUserRequisitions = async () => {
        try {
            setLoading(true);
            const user = getCurrentUser();
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
    }, []);

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
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'assigned':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'delivered':
                return 'bg-green-50 text-green-700 border-green-200';
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

    return(
        <>
        <main className="flex-1">
            {/* Header Section */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Left side - Title and description */}
                    <div className="flex items-center">
                        <Package className="h-8 w-8 text-sky-400 mr-3" />
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Item Requisitions</h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">Track your IT equipment and asset requests</p>
                        </div>
                    </div>
                    
                    {/* Right side - Button */}
                    <div className="w-full sm:w-auto">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            style={{
                                backgroundColor: '#00AEEF',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            
                        >
                            <Plus className="h-4 w-4" />
                            New Request
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-2xl font-bold text-[#333]">{requests.length}</div>
                    <div className="text-sm text-gray-600">Total Requests</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-2xl font-bold text-yellow-600">{requests.filter(r => r.status === 'pending').length}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-2xl font-bold text-blue-600">{requests.filter(r => r.status === 'approved').length}</div>
                    <div className="text-sm text-gray-600">Approved</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-2xl font-bold text-green-600">{requests.filter(r => r.status === 'delivered').length}</div>
                    <div className="text-sm text-gray-600">Delivered</div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-[#333]">My Requests</h2>
            </div>

            {/* Loading and Error States */}
            {loading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading your requisitions...</p>
                </div>
            )}

            {error && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600">{error}</p>
                    <button 
                        onClick={fetchUserRequisitions}
                        className="mt-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Requests List */}
            {!loading && !error && (
                <div className="divide-y divide-gray-200">
                    {requests.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No item requisitions found.</p>
                            <p className="text-sm">Create your first request using the button above.</p>
                        </div>
                    ) : (
                        requests.map((request) => (
                            <div key={request.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-150">
                                {/* Better Column Layout */}
                                <div className="space-y-4">
                                    {/* Main Header Row with proper spacing */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base sm:text-lg font-medium text-[#333] mb-2 sm:mb-0">
                                                {request.item_name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                                            <span className={`px-3 py-1 text-xs sm:text-sm rounded-full border flex items-center gap-1.5 whitespace-nowrap ${getStatusColor(request.status)}`}>
                                                {getStatusIcon(request.status)}
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                            <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                                                #{request.id}
                                            </span>
                                            <button
                                                onClick={() => handleViewDetails(request.id)}
                                                className="flex items-center justify-center px-3 py-1.5 bg-sky-100 text-sky-700 rounded-lg font-medium transition-all hover:bg-sky-200 text-sm"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                Details
                                            </button>
                                        </div>
                                    </div>

                                    {/* Details Grid - Responsive */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <Package className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                            <span className="truncate">Qty: {request.quantity}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                            <span className="truncate">{formatDate(request.created_at)}</span>
                                        </div>
                                        {request.reviewed_by_name && (
                                            <div className="flex items-center">
                                                <User className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                                <span className="truncate">Reviewed by: {request.reviewed_by_name}</span>
                                            </div>
                                        )}
                                        {request.assigned_to_name && (
                                            <div className="flex items-center">
                                                <User className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                                <span className="truncate">Assigned to: {request.assigned_to_name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Justification Section */}
                                    <div className="pt-2 border-t border-gray-100 sm:border-t-0 sm:pt-2">
                                        <div className="text-sm">
                                            <span className="font-medium text-gray-700 block sm:inline">Justification: </span>
                                            <span className="text-gray-700 mt-1 sm:mt-0 block sm:inline">
                                                {request.justification}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>                         
        </main>
        
        {/* Create New Request Modal */}
        <ItemRequestModal
            isModalOpen={isModalOpen}
            onClose={() => {
                setIsModalOpen(false);
                // Refresh the data when modal is closed
                fetchUserRequisitions();
            }}
            title="Request New Equipment"
        />

        {/* View Details Modal */}
        <ItemRequestModal
            isModalOpen={viewModalOpen}
            onClose={handleCloseViewModal}
            mode="view"
            requisitionId={selectedRequisitionId}
        />
        </>
    )
}