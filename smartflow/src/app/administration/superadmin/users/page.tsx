"use client"
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye, X, User, Calendar, Hash, Building2, Settings, MessageSquare, Clock, Mail, Filter, Search } from 'lucide-react';
import { applicationReview, getSystemUsers } from '@/app/services/userService';
import NavBar from '../components/nav';
import SideBar from '../components/sidebar';
import { useAuth } from '@/app/contexts/auth-context';

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
  const [accessRequests, setAccessRequests] = useState<any>();

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
              const sysUsers = await getSystemUsers();
              console.log("Helper:",sysUsers);
              setAccessRequests(sysUsers); 
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
      
      <main className="flex-1 lg:ml-4">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                                <div>
                                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Access Requests</h2>
                                    <p className="text-sm text-gray-600 mt-1">Manage system access requests and approvals</p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                  {/* Registration Toggle */}
                                  <div className="flex items-center justify-between sm:justify-start bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                                      <div className="flex items-center space-x-3">
                                          <div className="flex flex-col">
                                              <span className="text-sm font-medium text-gray-700">Registration</span>
                                              <span className="text-xs text-gray-500">
                                                  {isRegistrationOpen ? 'Applications Open' : 'Applications Closed'}
                                              </span>
                                          </div>
                                          
                                          {/* Toggle Switch */}
                                          <button
                                              onClick={() => setIsRegistrationOpen(!isRegistrationOpen)}
                                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
                                                  isRegistrationOpen 
                                                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                                      : 'bg-gray-300'
                                              }`}
                                              role="switch"
                                              aria-checked={isRegistrationOpen}
                                              aria-label="Toggle registration applications"
                                          >
                                              <span
                                                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                                                      isRegistrationOpen ? 'translate-x-6' : 'translate-x-1'
                                                  }`}
                                              />
                                          </button>
                                      </div>
                                  </div>
                            </div>
                          </div>
        
          <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Hash className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 w-full sm:w-64"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 appearance-none bg-white w-full sm:w-auto"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{selectedItems.size} selected</span>
              <button className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Bulk Approve
              </button>
              <button className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Bulk Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {isFetching ? <SpinLoading /> : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input 
                        type="checkbox" 
                        checked={selectedItems?.size === filteredRequests?.length && filteredRequests.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Systems</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests?.map((request : any) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={selectedItems.has(request.id)}
                          onChange={() => handleSelectItem(request.id)}
                          className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.id}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{request.employee}</div>
                        <div className="text-xs text-gray-500">{request.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{request.department}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {request.systems.slice(0, 2).map((system : any) => (
                            <span key={system} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {system}
                            </span>
                          ))}
                          {request.systems.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{request.systems.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{request.created}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleViewRequest(request)}
                            className="p-1 text-sky-600 hover:text-sky-900 hover:bg-sky-50 rounded transition-colors"
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

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredRequests?.map((request : any) => (
              <div 
                key={request.id} 
                className={`bg-white rounded-xl shadow-sm border transition-all ${
                  selectedItems.has(request.id) ? 'border-sky-300 bg-sky-50' : 'border-gray-200'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(request.id)}
                        onChange={() => handleSelectItem(request.id)}
                        className="mt-1 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.employee}</h3>
                        <p className="text-sm text-gray-500">#{request.id}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{request.department}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{request.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{request.created}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {request.systems.slice(0, 2).map((system : any) => (
                        <span key={system} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {system}
                        </span>
                      ))}
                      {request.systems.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{request.systems.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => handleViewRequest(request)}
                      className="p-2 text-sky-600 hover:text-sky-900 hover:bg-sky-50 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Access Request Details</h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Request Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Request ID</p>
                    <p className="text-sm text-gray-900">{selectedRequest.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Employee</p>
                    <p className="text-sm text-gray-900">{selectedRequest.employee}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p className="text-sm text-gray-900">{selectedRequest.department}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created Date</p>
                    <p className="text-sm text-gray-900">{selectedRequest.created}</p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                <p className="text-sm text-gray-900">{selectedRequest.email}</p>
              </div>

              {/* Status and Priority */}
              <div className="flex space-x-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Priority</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(selectedRequest.priority)}`}>
                    {selectedRequest.priority}
                  </span>
                </div>
              </div>

              {/* Systems */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Requested Systems</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.systems.map((system : any) => (
                    <span key={system} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <Settings className="h-3 w-3 mr-1" />
                      {system}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Reason for Request</p>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRequest.reason}</p>
              </div>

              {/* Comment Section */}
              <div>
                <label htmlFor="comment" className="flex items-center text-sm font-medium text-gray-500 mb-2">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Comment (Optional)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                  placeholder="Add a comment for this request..."
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleAction('rejected')}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </button>
                  
                  <button
                    onClick={() => handleAction('approved')}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </button>
                </>
              )}
              {selectedRequest.status === 'approved' && (
                <>
                  <button
                    onClick={() => handleAction('rejected')}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    revoke
                  </button>
                </>
              )}
              {selectedRequest.status === 'rejected' && (
                <>                 
                  <button
                    onClick={() => handleAction('approved')}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
      </main>
  </div>
    </div>
  </div>
  );
};

export default AccessRequestDashboard;