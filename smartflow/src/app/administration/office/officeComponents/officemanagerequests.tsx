"use client"
import { useState } from 'react';

// Type definitions
interface AccessRequest {
    id: string;
    employee: string;
    position: string;
    system: string;
    requestType: string;
    reason: string;
    requestDate: string;
    urgency: 'high' | 'medium' | 'low';
    status: 'pending' | 'approved' | 'rejected';
    type: 'access';
}

interface ItemRequest {
    id: string;
    employee: string;
    position: string;
    item: string;
    category: string;
    quantity: number;
    reason: string;
    requestDate: string;
    urgency: 'high' | 'medium' | 'low';
    status: 'pending' | 'approved' | 'rejected';
    type: 'item';
}

type Request = AccessRequest | ItemRequest;
import { 
  Shield, 
  Package, 
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
  User,
  Building,
  Key,
  Filter,
  Search
} from 'lucide-react';

export default function OfficeRequestsDecision(){
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [accessRequests] = useState<AccessRequest[]>([
        {
            id: 'AR-001',
            employee: 'John Smith',
            position: 'Software Developer',
            system: 'Development Database',
            requestType: 'New Access',
            reason: 'New hire - needs access to development environment',
            requestDate: '2025-01-28',
            urgency: 'high',
            status: 'pending',
            type: 'access'
        },
        {
            id: 'AR-002',
            employee: 'Sarah Johnson',
            position: 'UI/UX Designer',
            system: 'Design Tools Suite',
            requestType: 'Additional Access',
            reason: 'Project requirements - need Figma Pro access',
            requestDate: '2025-01-29',
            urgency: 'medium',
            status: 'pending',
            type: 'access'
        },
        {
            id: 'AR-003',
            employee: 'Mike Wilson',
            position: 'Project Manager',
            system: 'CRM System',
            requestType: 'Access Modification',
            reason: 'Role change - need admin privileges',
            requestDate: '2025-01-27',
            urgency: 'low',
            status: 'approved',
            type: 'access'
        }
    ]);

    const [itemRequests] = useState<ItemRequest[]>([
        {
            id: 'IR-001',
            employee: 'Emma Davis',
            position: 'Marketing Specialist',
            item: 'MacBook Pro 16"',
            category: 'Laptop',
            quantity: 1,
            reason: 'Current laptop is outdated and affecting productivity',
            requestDate: '2025-01-30',
            urgency: 'high',
            status: 'pending',
            type: 'item'
        },
        {
            id: 'IR-002',
            employee: 'Alex Chen',
            position: 'Graphic Designer',
            item: '4K Monitor',
            category: 'Monitor',
            quantity: 2,
            reason: 'Need dual monitor setup for design work',
            requestDate: '2025-01-29',
            urgency: 'medium',
            status: 'pending',
            type: 'item'
        },
        {
            id: 'IR-003',
            employee: 'Lisa Brown',
            position: 'Content Writer',
            item: 'Wireless Keyboard',
            category: 'Accessories',
            quantity: 1,
            reason: 'Ergonomic improvement for better typing experience',
            requestDate: '2025-01-28',
            urgency: 'low',
            status: 'approved',
            type: 'item'
        }
    ]);

    const allRequests: Request[] = [...accessRequests, ...itemRequests];

    const handleApprove = (id: string, type: 'access' | 'item') => {
        console.log(`Approved ${type} request: ${id}`);
        // In real app, this would update the backend
    };

    const handleReject = (id: string, type: 'access' | 'item') => {
        console.log(`Rejected ${type} request: ${id}`);
        // In real app, this would update the backend
    };

    const getStatusIcon = (status: 'pending' | 'approved' | 'rejected') => {
        switch(status) {
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: 'pending' | 'approved' | 'rejected') => {
        switch(status) {
            case 'pending':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'approved':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getUrgencyColor = (urgency: 'high' | 'medium' | 'low') => {
        switch(urgency) {
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

    const filteredRequests = allRequests.filter(request => {
        const matchesTab = activeTab === 'all' || 
                          (activeTab === 'pending' && request.status === 'pending') ||
                          (activeTab === 'access' && request.type === 'access') ||
                          (activeTab === 'items' && request.type === 'item');
        
        const matchesSearch = request.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (request.type === 'access' && request.system.toLowerCase().includes(searchTerm.toLowerCase())) ||
                             (request.type === 'item' && request.item.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesTab && matchesSearch;
    });

    const pendingCount = allRequests.filter(r => r.status === 'pending').length;
    const accessCount = accessRequests.length;
    const itemCount = itemRequests.length;
    const approvedCount = allRequests.filter(r => r.status === 'approved').length;

    return(
        <>
           
                    <div className="flex">
                        <main className="flex-1">
                            {/* Header Section */}
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Building className="h-8 w-8 text-[#87CEEB] mr-3" />
                                        <div>
                                            <h1 className="text-xl font-bold text-[#333]">manage requests</h1>
                                            <p className="text-gray-600">Review and approve requests from your team</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <Clock className="h-6 w-6 text-yellow-600" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-2xl font-bold text-[#333]">{pendingCount}</div>
                                            <div className="text-sm text-gray-600">Pending Approval</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Shield className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-2xl font-bold text-[#333]">{accessCount}</div>
                                            <div className="text-sm text-gray-600">Access Requests</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Package className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-2xl font-bold text-[#333]">{itemCount}</div>
                                            <div className="text-sm text-gray-600">Item Requests</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-2xl font-bold text-[#333]">{approvedCount}</div>
                                            <div className="text-sm text-gray-600">Approved Today</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Filters and Search */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-5 w-5 text-gray-400" />
                                        <div className="flex gap-2">
                                            {[
                                                { key: 'all', label: 'All Requests' },
                                                { key: 'pending', label: 'Pending' },
                                                { key: 'access', label: 'Access Requests' },
                                                { key: 'items', label: 'Item Requests' }
                                            ].map((tab) => (
                                                <button
                                                    key={tab.key}
                                                    onClick={() => setActiveTab(tab.key)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                                        activeTab === tab.key 
                                                            ? 'bg-[#87CEEB] text-white' 
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder="Search requests..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Requests List */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-[#333]">
                                        {activeTab === 'all' ? 'All Requests' : 
                                         activeTab === 'pending' ? 'Pending Requests' :
                                         activeTab === 'access' ? 'Access Requests' : 'Item Requests'}
                                        {filteredRequests.length > 0 && (
                                            <span className="ml-2 text-sm text-gray-500">({filteredRequests.length})</span>
                                        )}
                                    </h2>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {filteredRequests.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                                            <p className="text-gray-500">No requests match your current filters.</p>
                                        </div>
                                    ) : (
                                        filteredRequests.map((request) => (
                                            <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="flex items-center gap-2">
                                                                {request.type === 'access' ? (
                                                                    <Shield className="h-5 w-5 text-[#87CEEB]" />
                                                                ) : (
                                                                    <Package className="h-5 w-5 text-[#87CEEB]" />
                                                                )}
                                                                <h3 className="text-lg font-medium text-[#333]">
                                                                    {request.type === 'access' ? request.system : request.item}
                                                                </h3>
                                                            </div>
                                                            <span className={`px-2 py-1 text-xs rounded-full ${getUrgencyColor(request.urgency)}`}>
                                                                {request.urgency.toUpperCase()}
                                                            </span>
                                                            <span className={`px-3 py-1 text-sm rounded-full border flex items-center gap-1 ${getStatusColor(request.status)}`}>
                                                                {getStatusIcon(request.status)}
                                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                                                            <div className="flex items-center">
                                                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                                                <div>
                                                                    <div className="font-medium text-[#333]">{request.employee}</div>
                                                                    <div className="text-xs">{request.position}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                                {request.requestDate}
                                                            </div>
                                                            <div className="flex items-center">
                                                                {request.type === 'access' ? (
                                                                    <>
                                                                        <Key className="h-4 w-4 mr-2 text-gray-400" />
                                                                        {request.requestType}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Package className="h-4 w-4 mr-2 text-gray-400" />
                                                                        {request.category} • Qty: {request.quantity}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="mb-4">
                                                            <p className="text-sm text-gray-700">
                                                                <strong>Reason:</strong> {request.reason}
                                                            </p>
                                                        </div>

                                                        {request.status === 'pending' && (
                                                            <div className="flex gap-3">
                                                                <button
                                                                    onClick={() => handleApprove(request.id, request.type)}
                                                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors duration-200"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(request.id, request.type)}
                                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors duration-200"
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center ml-4">
                                                        <span className="text-sm font-medium text-gray-500">#{request.id}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </main>
                    </div>
        </>
    )
}