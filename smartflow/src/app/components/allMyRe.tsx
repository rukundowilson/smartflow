"use client"
import { useState } from 'react';

import { 
  Package, 
  Plus,
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import ItemRequestModal from './itemRequestModal';

export default function Requisition(){
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requests, setRequests] = useState([
        {
            id: 'REQ-001',
            item: 'MacBook Pro 16"',
            category: 'Laptop',
            quantity: 1,
            reason: 'New employee onboarding - Software Development',
            requestedBy: 'John Doe',
            requestDate: '2025-01-15',
            status: 'pending',
            priority: 'high'
        },
        {
            id: 'REQ-002',
            item: 'Wireless Mouse',
            category: 'Accessories',
            quantity: 2,
            reason: 'Current mouse is malfunctioning',
            requestedBy: 'Sarah Wilson',
            requestDate: '2025-01-18',
            status: 'approved',
            priority: 'medium'
        },
        {
            id: 'REQ-003',
            item: 'HP LaserJet Printer',
            category: 'Printer',
            quantity: 1,
            reason: 'Marketing department printer replacement',
            requestedBy: 'Mike Johnson',
            requestDate: '2025-01-20',
            status: 'delivered',
            priority: 'low'
        }
    ]);

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
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getPriorityColor = (priority : any) => {
        switch(priority) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
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
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Item Requisition</h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">Request and track IT equipment and assets</p>
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
                
                {/* Modal state indicator */}
                {isModalOpen && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 mb-2">✅ Button clicked! Modal would open here.</p>
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                            Close
                        </button>
                    </div>
                )}
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
                <h2 className="text-lg font-semibold text-[#333]">Recent Requests</h2>
            </div>

            {/* Requests List */}
            <div className="divide-y divide-gray-200">
                {requests.map((request) => (
                    <div key={request.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-150">
                        {/* Better Column Layout */}
                        <div className="space-y-4">
                            {/* Main Header Row with proper spacing */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg font-medium text-[#333] mb-2 sm:mb-0">
                                        {request.item}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${getPriorityColor(request.priority)}`}>
                                        {request.priority.toUpperCase()}
                                    </span>
                                    <span className={`px-3 py-1 text-xs sm:text-sm rounded-full border flex items-center gap-1.5 whitespace-nowrap ${getStatusColor(request.status)}`}>
                                        {getStatusIcon(request.status)}
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </span>
                                    <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                                        #{request.id}
                                    </span>
                                </div>
                            </div>

                            {/* Details Grid - Responsive */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Package className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{request.category} • Qty: {request.quantity}</span>
                                </div>
                                <div className="flex items-center">
                                    <User className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{request.requestedBy}</span>
                                </div>
                                <div className="flex items-center sm:col-span-2 lg:col-span-1">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{request.requestDate}</span>
                                </div>
                            </div>

                            {/* Reason Section */}
                            <div className="pt-2 border-t border-gray-100 sm:border-t-0 sm:pt-2">
                                <div className="text-sm">
                                    <span className="font-medium text-gray-700 block sm:inline">Reason: </span>
                                    <span className="text-gray-700 mt-1 sm:mt-0 block sm:inline">
                                        {request.reason}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>                         
        </main>
        <ItemRequestModal
            isModalOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Request New Equipment"
        />     
        </>
    )
}