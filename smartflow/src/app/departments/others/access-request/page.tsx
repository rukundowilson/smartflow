"use client"
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye, X, User, Calendar, Hash, Building2, Settings, MessageSquare, Clock, Mail, Filter, Search } from 'lucide-react';
import { applicationReview, getSystemUsers } from '@/app/services/userService';
import SideBar from '../components/sidebar';
import { useAuth } from '@/app/contexts/auth-context';
import NavBar from '../components/navbar';
import AccessRequestsPortal from '@/app/components/myAccessRequests';

const SpinLoading = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
  </div>
);

const AccessRequestDashboard = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {user} = useAuth();

  // Sample data based on your API structure
  const [accessRequests, setAccessRequests] = useState<any[]>([]);

  const getStatusColor = (status : any) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority : any) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleViewRequest = (request : any) => {
    setSelectedRequest(request);
    setShowModal(true);
    setComment('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setComment('');
  };

  const handleAction = async (action : string) => {
    if (!selectedRequest) return;
    console.log(action)

    setIsProcessing(true);

    setTimeout(() => {
      setAccessRequests((prev : any) => 
        prev.map((req : any) => 
          req.id === selectedRequest.id 
            ? { ...req, status: action, comment: comment || undefined }
            : req
        )
      );
      applicationReview(selectedRequest,action, user?.id)
      console.log(user?.id)
      setIsProcessing(false);
      closeModal();
    },7000);
  };

  const handleSelectItem = (id : any) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredRequests.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredRequests.map((req  : any)=> req.id)));
    }
  };

  // Filter and search logic
  const filteredRequests = accessRequests?.filter((request: any) => {
    const matchesStatus = filterStatus === 'all' || request.status.toLowerCase() === filterStatus;
    const matchesSearch = searchTerm === '' || 
      request.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Calculate stats
  const totalRequests = accessRequests?.length;
  const pendingCount = accessRequests?.filter((req: any )=> req.status === 'pending').length;
  const approvedCount = accessRequests?.filter((req : any) => req.status === 'approved').length;
  const rejectedCount = accessRequests?.filter( (req : any) => req.status === 'rejected').length;

  async function callHelper() {
          try {
              setIsFetching(true);
              const result = await getSystemUsers();
              console.log("Helper:", result);
              setAccessRequests(result.transformed); 
          } catch (error) {
              console.error("Failed to fetch system users", error);
          }
          finally{
              setIsFetching(false)
          }
      }
  
      useEffect(() => {
          callHelper()
      }, []);

      console.log(selectedRequest)

  return (
    <div className="min-h-screen bg-gray-50">
    <NavBar/>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
    <div className="flex">
      <SideBar/>
      {isSidebarOpen && (
          <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
          />
      )}
      
      <AccessRequestsPortal/>
  </div>
    </div>
  </div>
  );
};

export default AccessRequestDashboard;