"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  RefreshCw,
  AlertCircle,
  User,
  MoreVertical,
  TrendingUp,
  Activity
} from 'lucide-react';
import NavBar from "../components/navbar"
import SideBar from "../components/sidebar"
import { getAllTickets, ITTicket } from '../../../services/itTicketService';
import { 
  getAllItemRequisitions, 
  updateItemRequisitionStatus,
  scheduleItemPickup,
  markItemAsDelivered,
  ItemRequisition 
} from '../../../services/itemRequisitionService';

// Simple Pie Chart Component
const PieChart = ({ data, title, colors }: { 
  data: { label: string; value: number; color: string }[]; 
  title: string;
  colors: string[];
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 32 32">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const circumference = 2 * Math.PI * 14; // radius = 14
              const strokeDasharray = (percentage / 100) * circumference;
              const strokeDashoffset = data
                .slice(0, index)
                .reduce((sum, d) => sum + (d.value / total) * circumference, 0);
              
              return (
                <circle
                  key={item.label}
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="3"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">{total}</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {item.value} ({((item.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Personal Item Card Component
const PersonalItemCard = ({ item, type }: { 
  item: any; 
  type: 'ticket' | 'requisition' 
}) => {
  const router = useRouter();
  
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'pending it approval':
      case 'pending it review':
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'assigned to me':
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'resolved':
      case 'approved':
      case 'it approved':
      case 'completed': return 'text-green-600 bg-green-50';
      case 'ready for delivery': 
      case 'delivered': return 'text-purple-600 bg-purple-50';
      case 'assigned': return 'text-blue-600 bg-blue-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = () => {
    if (type === 'ticket') {
      router.push(`/departments/it-department/tickets`);
    } else {
      router.push(`/departments/it-department/requisition`);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {type === 'ticket' ? (
            <Ticket className="h-5 w-5 text-blue-600" />
          ) : (
            <Package className="h-5 w-5 text-purple-600" />
          )}
          <span className="text-sm font-bold text-gray-900">#{item.id}</span>
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
          {item.status}
        </span>
      </div>
      
      <div className="space-y-2 mb-3">
        <p className="text-sm font-semibold text-gray-900">
          {type === 'ticket' ? item.issue_type : item.item_name}
        </p>
        <p className="text-xs text-gray-600">
          {type === 'ticket' ? item.created_by_name : item.requested_by_name}
        </p>
        {type === 'ticket' && item.priority && (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
            {item.priority} Priority
          </span>
        )}
        {type === 'requisition' && (
          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{formatDate(item.created_at)}</span>
        <button
          onClick={handleViewDetails}
          className="text-xs text-sky-600 hover:text-sky-700 font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default function OverView(){
      const router = useRouter();
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [tickets, setTickets] = useState<ITTicket[]>([]);
      const [requisitions, setRequisitions] = useState<ItemRequisition[]>([]);
      const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

      // Get current user from localStorage
      const getCurrentUser = () => {
        if (typeof window !== 'undefined') {
          const userStr = localStorage.getItem('user');
          return userStr ? JSON.parse(userStr) : null;
        }
        return null;
      };

      const fetchDashboardData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          // Fetch tickets and requisitions in parallel
          const [ticketsResponse, requisitionsResponse] = await Promise.all([
            getAllTickets(),
            getAllItemRequisitions()
          ]);
          
          setTickets(ticketsResponse.tickets);
          setRequisitions(requisitionsResponse.requisitions);
        } catch (err: any) {
          setError(err.message);
          console.error('Error fetching dashboard data:', err);
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        fetchDashboardData();
      }, []);

      // Handle requisition status updates
      const handleRequisitionStatusUpdate = async (requisitionId: number, status: 'approved' | 'rejected') => {
        try {
          setUpdatingStatus(requisitionId);
          const user = getCurrentUser();
          if (!user?.id) {
            throw new Error('User not found');
          }

          await updateItemRequisitionStatus(requisitionId, status, user.id);
          
          // Refresh the data
          await fetchDashboardData();
        } catch (err: any) {
          setError(err.message);
          console.error('Error updating requisition status:', err);
        } finally {
          setUpdatingStatus(null);
        }
      };

      // Get current user
      const currentUser = getCurrentUser();

      // Filter tickets for current user (assigned to them)
      const myTickets = tickets.filter(ticket => 
        ticket.assigned_to === currentUser?.id || 
        ticket.priority === 'high' || 
        ticket.priority === 'critical'
      );

      // Filter requisitions for current user (assigned to them or pending)
      const myRequisitions = requisitions.filter(requisition => 
        requisition.requested_by === currentUser?.id || 
        requisition.assigned_to === currentUser?.id ||
        requisition.status === 'pending'
      );

      // Filter tickets by status
      const openTickets = tickets.filter(t => t.status === 'open');
      const inProgressTickets = tickets.filter(t => t.status === 'in_progress');
      const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');
      const highPriorityTickets = tickets.filter(t => t.priority === 'high' || t.priority === 'critical');

      // Filter tickets by priority
      const criticalTickets = tickets.filter(t => t.priority === 'critical');
      const highTickets = tickets.filter(t => t.priority === 'high');
      const mediumTickets = tickets.filter(t => t.priority === 'medium');
      const lowTickets = tickets.filter(t => t.priority === 'low');

      // Filter requisitions by status
      const pendingRequisitions = requisitions.filter(r => r.status === 'pending');
      const approvedRequisitions = requisitions.filter(r => r.status === 'approved');
      const assignedRequisitions = requisitions.filter(r => r.status === 'assigned');
      const deliveredRequisitions = requisitions.filter(r => r.status === 'delivered');
      const rejectedRequisitions = requisitions.filter(r => r.status === 'rejected');

      // Chart data for tickets
      const ticketStatusData = [
        { label: 'Open', value: openTickets.length, color: '#f97316' },
        { label: 'In Progress', value: inProgressTickets.length, color: '#3b82f6' },
        { label: 'Resolved', value: resolvedTickets.length, color: '#10b981' }
      ];

      const ticketPriorityData = [
        { label: 'Critical', value: criticalTickets.length, color: '#ef4444' },
        { label: 'High', value: highTickets.length, color: '#f97316' },
        { label: 'Medium', value: mediumTickets.length, color: '#eab308' },
        { label: 'Low', value: lowTickets.length, color: '#10b981' }
      ];

      // Chart data for requisitions
      const requisitionStatusData = [
        { label: 'Pending', value: pendingRequisitions.length, color: '#f97316' },
        { label: 'Approved', value: approvedRequisitions.length, color: '#10b981' },
        { label: 'Assigned', value: assignedRequisitions.length, color: '#3b82f6' },
        { label: 'Delivered', value: deliveredRequisitions.length, color: '#8b5cf6' },
        { label: 'Rejected', value: rejectedRequisitions.length, color: '#ef4444' }
      ];

      // Personal items (assigned to current user)
      const myAssignedTickets = tickets.filter(t => t.assigned_to === currentUser?.id);
      const myAssignedRequisitions = requisitions.filter(r => r.assigned_to === currentUser?.id);
      const myCreatedRequisitions = requisitions.filter(r => r.requested_by === currentUser?.id);

      // Items I took action on (resolved tickets, delivered requisitions)
      const myResolvedTickets = tickets.filter(t => 
        t.assigned_to === currentUser?.id && 
        (t.status === 'resolved' || t.status === 'closed')
      );
      const myDeliveredRequisitions = requisitions.filter(r => 
        r.assigned_to === currentUser?.id && 
        r.status === 'delivered'
      );

      if (loading) {
        return (
          <div className="min-h-screen bg-[#F0F8F8]">
            <NavBar/>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex">
                <SideBar/>
                <main className="flex-1">
                  <div className="flex items-center justify-center h-64">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-sky-600" />
                      <span className="text-gray-600">Loading dashboard...</span>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
        );
      }

      if (error) {
        return (
          <div className="min-h-screen bg-[#F0F8F8]">
            <NavBar/>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex">
                <SideBar/>
                <main className="flex-1">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-600">{error}</span>
                    </div>
                  </div>
                  <button 
                    onClick={fetchDashboardData}
                    className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
                  >
                    Retry
                  </button>
                </main>
              </div>
            </div>
          </div>
        );
      }
          
    return(
        <>
            <div className="min-h-screen bg-[#F0F8F8]">
      {/* Header */}
      <NavBar/>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar */}
          <SideBar/>
          {/* Main Content */}
          <main className="flex-1">
            <div className="space-y-6">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">IT Dashboard</h1>
                <p className="text-gray-600 mt-2">Overview of all tickets and requisitions</p>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PieChart 
                  data={ticketStatusData}
                  title="Ticket Status Distribution"
                  colors={['#f97316', '#3b82f6', '#10b981']}
                />
                <PieChart 
                  data={ticketPriorityData}
                  title="Ticket Priority Distribution"
                  colors={['#ef4444', '#f97316', '#eab308', '#10b981']}
                />
                <PieChart 
                  data={requisitionStatusData}
                  title="Requisition Status Distribution"
                  colors={['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444']}
                />
              </div>

              {/* Personal Items Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* My Assigned Tickets */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">My Assigned Tickets</h3>
                    <button 
                      onClick={() => router.push('/departments/it-department/tickets')}
                      className="text-sky-600 hover:text-sky-700 text-sm font-medium"
                    >
                      View All
                    </button>
                  </div>
                  <div className="p-6">
                    {myAssignedTickets.length === 0 ? (
                      <div className="text-center py-8">
                        <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No tickets assigned to you</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {myAssignedTickets.slice(0, 3).map(ticket => (
                          <PersonalItemCard key={`ticket-${ticket.id}`} item={ticket} type="ticket" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* My Assigned Requisitions */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">My Assigned Requisitions</h3>
                    <button 
                      onClick={() => router.push('/departments/it-department/requisition')}
                      className="text-sky-600 hover:text-sky-700 text-sm font-medium"
                    >
                      View All
                    </button>
                  </div>
                  <div className="p-6">
                    {myAssignedRequisitions.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No requisitions assigned to you</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {myAssignedRequisitions.slice(0, 3).map(requisition => (
                          <PersonalItemCard key={`requisition-${requisition.id}`} item={requisition} type="requisition" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* My Actions Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* My Resolved Tickets */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">My Resolved Tickets</h3>
                    <p className="text-sm text-gray-600 mt-1">Tickets I've completed</p>
                  </div>
                  <div className="p-6">
                    {myResolvedTickets.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No resolved tickets yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {myResolvedTickets.slice(0, 3).map(ticket => (
                          <PersonalItemCard key={`resolved-${ticket.id}`} item={ticket} type="ticket" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* My Delivered Requisitions */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">My Delivered Items</h3>
                    <p className="text-sm text-gray-600 mt-1">Requisitions I've delivered</p>
                  </div>
                  <div className="p-6">
                    {myDeliveredRequisitions.length === 0 ? (
                      <div className="text-center py-8">
                        <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No delivered items yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {myDeliveredRequisitions.slice(0, 3).map(requisition => (
                          <PersonalItemCard key={`delivered-${requisition.id}`} item={requisition} type="requisition" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button 
                      onClick={() => router.push('/departments/it-department/tickets')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
                    >
                      <Ticket className="h-6 w-6 text-sky-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">View Tickets</p>
                    </button>
                    <button 
                      onClick={() => router.push('/departments/it-department/requisition')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
                    >
                      <Package className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">View Requisitions</p>
                    </button>
                    <button 
                      onClick={() => router.push('/departments/it-department/access-requests')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
                    >
                      <Key className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Access Requests</p>
                    </button>
                    <button 
                      onClick={() => router.push('/departments/it-department/overview')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
                    >
                      <Activity className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Dashboard</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
        </>
    )
}