"use client"
import React, { useState } from 'react';
import { 
  Users, 
  Ticket, 
  Key, 
  Package, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Monitor,
  Settings,
  Bell,
  LogOut,
  Wrench,
  Truck,
  MessageSquare,
  Calendar,
  MoreVertical,
  Menu,
  X
} from 'lucide-react';
import NavBar from "../components/navbar"
import SideBar from "../components/sidebar"

export default function Requisation(){
      const [sidebarOpen, setSidebarOpen] = useState(false);

      // Sample data for IT Staff view
      const itemRequests = [
        { id: 'IR001', employee: 'David Lee', item: 'MacBook Pro 16"', quantity: 1, status: 'IT Approved', created: '2025-07-19', location: 'Building A, Floor 3' },
        { id: 'IR002', employee: 'Emma White', item: 'USB-C Cables', quantity: 3, status: 'Pending IT Review', created: '2025-07-18', location: 'Building B, Floor 1' },
        { id: 'IR003', employee: 'Tom Johnson', item: 'External Monitor', quantity: 2, status: 'Ready for Delivery', created: '2025-07-17', location: 'Building A, Floor 2' },
      ];
    
      const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
          case 'open':
          case 'pending it approval':
          case 'pending it review': return 'text-orange-700 bg-orange-100 border-orange-200';
          case 'assigned to me':
          case 'in progress': return 'text-blue-700 bg-blue-100 border-blue-200';
          case 'resolved':
          case 'approved':
          case 'it approved':
          case 'completed': return 'text-green-700 bg-green-100 border-green-200';
          case 'ready for delivery': return 'text-purple-700 bg-purple-100 border-purple-200';
          case 'rejected': return 'text-red-700 bg-red-100 border-red-200';
          default: return 'text-gray-700 bg-gray-100 border-gray-200';
        }
      };
    
      interface StatCardProps {
        title: string;
        value: string | number;
        icon: React.ElementType;
        color?: string;
        action?: string;
      }
    
      const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color = 'text-blue-600', action }) => (
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-semibold text-gray-600 mb-1 truncate">{title}</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">{value}</p>
              {action && <p className="text-xs text-gray-500 mt-1 lg:mt-2 truncate">{action}</p>}
            </div>
            <div className={`p-2 lg:p-3 rounded-xl flex-shrink-0 ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
              <Icon className={`h-6 w-6 lg:h-8 lg:w-8 ${color}`} />
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
      }
    
      const ActionButton: React.FC<ActionButtonProps> = ({ 
        icon: Icon, 
        label, 
        onClick, 
        variant = 'primary', 
        size = 'md' 
      }) => {
        const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 hover:scale-105 active:scale-95";
        
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
            className={`${baseClasses} ${sizeClasses[size]} ${variants[variant]} w-full sm:w-auto`}
          >
            <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        );
      };

      // Enhanced Mobile Card Component
      const MobileItemCard = ({ request }: { request: any }) => (
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0 mr-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900 truncate">{request.id}</h3>
                <span className={`mt-1 sm:mt-0 px-2 py-1 text-xs font-semibold rounded-full border inline-block w-fit ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium truncate">{request.employee}</p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-2 border-gray-300 text-sky-600 focus:ring-sky-500 focus:ring-offset-2"
              />
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-start py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500 flex-shrink-0">Item</span>
              <span className="text-sm font-semibold text-gray-900 text-right ml-3 break-words">{request.item}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Quantity</span>
              <span className="text-sm font-semibold text-gray-900">{request.quantity}</span>
            </div>
            <div className="flex justify-between items-start py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500 flex-shrink-0">Location</span>
              <span className="text-sm font-semibold text-gray-900 text-right ml-3 break-words">{request.location}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-500">Created</span>
              <span className="text-sm font-semibold text-gray-900">{request.created}</span>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            {request.status === 'Pending IT Review' && (
              <>
                <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                  <CheckCircle className="h-5 w-5" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                  <XCircle className="h-5 w-5" />
                </button>
              </>
            )}
            {request.status === 'Ready for Delivery' && (
              <button className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors">
                <Truck className="h-5 w-5" />
              </button>
            )}
            <button className="p-2 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors">
              <Eye className="h-5 w-5" />
            </button>
          </div>
        </div>
      );
    
    return(
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
              {/* Enhanced Header */}
              <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-30">
                <NavBar/>
                
                {/* Mobile Header Bar */}
                <div className="lg:hidden px-4 py-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Menu className="h-6 w-6 text-gray-600" />
                    </button>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate mx-3">Item Requisitions</h1>
                    <div className="w-10 h-10" /> {/* Spacer */}
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
                <div className="flex">
                  {/* Enhanced Sidebar */}
                  <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
                    <SideBar/>
                  </div>
                  
                  {/* Main Content with proper margins */}
                  <main className="flex-1 lg:ml-6 xl:ml-8">
                    <div className="space-y-4 lg:space-y-6">
                      {/* Desktop Header */}
                      <div className="hidden lg:block">
                        <div className="mb-6">
                          <h2 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-2">Item Requisitions</h2>
                          <p className="text-gray-600 lg:text-lg">Manage and track hardware and equipment requests</p>
                        </div>
                        
                        {/* Stats Cards Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                          <StatCard 
                            title="Total Requests" 
                            value={itemRequests.length} 
                            icon={Package} 
                            color="text-blue-600" 
                          />
                          <StatCard 
                            title="Pending Review" 
                            value={itemRequests.filter(r => r.status === 'Pending IT Review').length} 
                            icon={Clock} 
                            color="text-orange-600" 
                          />
                          <StatCard 
                            title="Ready for Delivery" 
                            value={itemRequests.filter(r => r.status === 'Ready for Delivery').length} 
                            icon={Truck} 
                            color="text-purple-600" 
                          />
                          <StatCard 
                            title="Completed" 
                            value={itemRequests.filter(r => r.status === 'IT Approved').length} 
                            icon={CheckCircle} 
                            color="text-green-600" 
                          />
                        </div>
                      </div>

                      {/* Mobile Header with Stats */}
                      <div className="lg:hidden mb-4">
                        <div className="mb-4">
                          <p className="text-gray-600 text-sm px-1">Manage and track hardware requests</p>
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
                                <p className="text-xl font-bold text-gray-900">{itemRequests.filter(r => r.status === 'Pending IT Review').length}</p>
                              </div>
                              <Clock className="h-5 w-5 text-orange-600 flex-shrink-0 ml-2" />
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-500 truncate">Ready</p>
                                <p className="text-xl font-bold text-gray-900">{itemRequests.filter(r => r.status === 'Ready for Delivery').length}</p>
                              </div>
                              <Truck className="h-5 w-5 text-purple-600 flex-shrink-0 ml-2" />
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-500 truncate">Done</p>
                                <p className="text-xl font-bold text-gray-900">{itemRequests.filter(r => r.status === 'IT Approved').length}</p>
                              </div>
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Desktop Table */}
                      <div className="hidden lg:block">
                        <div className="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
                          <div className="px-4 lg:px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">All Requests</h3>
                            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 sm:gap-0">
                              <ActionButton 
                                icon={Truck} 
                                label="Schedule Deliveries" 
                                variant="secondary" 
                                size="sm"
                              />
                              <ActionButton 
                                icon={CheckCircle} 
                                label="Mark Delivered" 
                                variant="success" 
                                size="sm"
                              />
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">
                                    <input 
                                      type="checkbox" 
                                      className="w-4 h-4 lg:w-5 lg:h-5 rounded border-2 border-gray-300 text-sky-600 focus:ring-sky-500"
                                    />
                                  </th>
                                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Request ID</th>
                                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee</th>
                                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Item</th>
                                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Quantity</th>
                                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Location</th>
                                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-100">
                                {itemRequests.map(request => (
                                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                                      <input 
                                        type="checkbox" 
                                        className="w-4 h-4 lg:w-5 lg:h-5 rounded border-2 border-gray-300 text-sky-600 focus:ring-sky-500"
                                      />
                                    </td>
                                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm font-bold text-gray-900">{request.id}</td>
                                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm font-medium text-gray-900">{request.employee}</td>
                                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm text-gray-900">{request.item}</td>
                                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm font-medium text-gray-900">{request.quantity}</td>
                                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm text-gray-600">{request.location}</td>
                                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                                      <span className={`px-2 lg:px-3 py-1 lg:py-1.5 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                                        {request.status}
                                      </span>
                                    </td>
                                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                                      <div className="flex justify-end space-x-1 lg:space-x-2">
                                        {request.status === 'Pending IT Review' && (
                                          <>
                                            <button className="p-1.5 lg:p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                                              <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                                            </button>
                                            <button className="p-1.5 lg:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                                              <XCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                                            </button>
                                          </>
                                        )}
                                        {request.status === 'Ready for Delivery' && (
                                          <button className="p-1.5 lg:p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors">
                                            <Truck className="h-4 w-4 lg:h-5 lg:w-5" />
                                          </button>
                                        )}
                                        <button className="p-1.5 lg:p-2 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors">
                                          <Eye className="h-4 w-4 lg:h-5 lg:w-5" />
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
                      <div className="lg:hidden space-y-3 pb-20">
                        {itemRequests.map(request => (
                          <MobileItemCard key={request.id} request={request} />
                        ))}
                      </div>
                    </div>
                  </main>
                </div>
              </div>

              {/* Enhanced Mobile Bottom Actions - Fixed positioning */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl">
                <div className="px-4 py-3 pb-safe">
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl font-semibold shadow-lg shadow-sky-500/25 hover:shadow-xl transition-all">
                      <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="truncate">Mark Delivered</span>
                    </button>
                    <button className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold shadow-lg shadow-gray-500/25 hover:shadow-xl transition-all">
                      <Truck className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="truncate">Schedule</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </>
    )
}