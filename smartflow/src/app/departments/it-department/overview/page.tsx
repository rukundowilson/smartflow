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
  MoreVertical
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

      // Filter requisitions by status
      const pendingRequisitions = requisitions.filter(r => r.status === 'pending');
      const approvedRequisitions = requisitions.filter(r => r.status === 'approved');
      const assignedRequisitions = requisitions.filter(r => r.status === 'assigned');
      const deliveredRequisitions = requisitions.filter(r => r.status === 'delivered');

      // Get statistics
      const stats = {
        myActiveTickets: myTickets.length,
        pendingApprovals: pendingRequisitions.length,
        readyForDelivery: approvedRequisitions.length,
        assignedItems: assignedRequisitions.length,
        resolvedToday: tickets.filter(t => 
          t.status === 'resolved' && 
          new Date(t.created_at).toDateString() === new Date().toDateString()
        ).length
      };

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

      const handleQuickAction = (action: string) => {
        switch (action) {
          case 'tickets':
            router.push('/departments/it-department/tickets');
            break;
          case 'access':
            router.push('/departments/it-department/access-requests');
            break;
          case 'requisitions':
            router.push('/departments/it-department/requisition');
            break;
          case 'delivery':
            router.push('/departments/it-department/requisition');
            break;
          default:
            break;
        }
      };

      // Requisition Card Component
      const RequisitionCard = ({ requisition }: { requisition: ItemRequisition }) => (
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-medium text-gray-900">#{requisition.id}</h4>
              <p className="text-sm text-gray-600">{requisition.requested_by_name}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(requisition.status)}`}>
              {requisition.status}
            </span>
          </div>
          
          <div className="space-y-2 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-900">{requisition.item_name}</p>
              <p className="text-xs text-gray-500">Qty: {requisition.quantity}</p>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">{requisition.justification}</p>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{formatDate(requisition.created_at)}</span>
            
            {requisition.status === 'pending' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRequisitionStatusUpdate(requisition.id, 'approved')}
                  disabled={updatingStatus === requisition.id}
                  className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                  title="Approve"
                >
                  {updatingStatus === requisition.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleRequisitionStatusUpdate(requisition.id, 'rejected')}
                  disabled={updatingStatus === requisition.id}
                  className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                  title="Reject"
                >
                  {updatingStatus === requisition.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}
            
            {requisition.status === 'approved' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push('/departments/it-department/requisition')}
                  className="p-1.5 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                  title="Schedule Pickup"
                >
                  <Calendar className="h-4 w-4" />
                </button>
                <button
                  onClick={() => router.push('/departments/it-department/requisition')}
                  className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                  title="Mark Delivered"
                >
                  <Truck className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      );

      // Combined Item Component for My Priority section
      const PriorityItem = ({ item, type }: { item: any; type: 'ticket' | 'requisition' }) => (
        <div className="px-6 py-4 hover:bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-3">
              {type === 'ticket' ? (
                <Ticket className="h-5 w-5 text-sky-600 mt-0.5" />
              ) : (
                <Package className="h-5 w-5 text-purple-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {type === 'ticket' ? item.issue_type : item.item_name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {type === 'ticket' ? item.created_by_name : item.requested_by_name}
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  {type === 'ticket' && (
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {type === 'ticket' ? 'Ticket' : 'Requisition'}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => router.push(type === 'ticket' ? '/departments/it-department/tickets' : '/departments/it-department/requisition')}
              className="text-sky-600 hover:text-sky-700 text-sm font-medium"
            >
              View
            </button>
          </div>
        </div>
      );
    
      interface StatCardProps {
        title: string;
        value: string | number;
        icon: React.ElementType;
        color?: string;
        action?: string;
      }
    
      const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color = 'text-blue-600', action }) => (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
              {action && <p className="text-xs text-gray-500 mt-1">{action}</p>}
            </div>
            <Icon className={`h-8 w-8 ${color}`} />
          </div>
        </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="My Active Tickets" 
          value={stats.myActiveTickets} 
          icon={Wrench} 
          color="text-blue-600" 
          action={`${myTickets.filter(t => t.priority === 'high' || t.priority === 'critical').length} high priority`} 
        />
        <StatCard 
          title="Pending Approvals" 
          value={stats.pendingApprovals} 
          icon={Clock} 
          color="text-orange-600" 
          action="Access & Items" 
        />
        <StatCard 
          title="Assigned Items" 
          value={stats.assignedItems} 
          icon={User} 
          color="text-blue-600" 
          action="Items assigned to staff" 
        />
        <StatCard 
          title="Resolved Today" 
          value={stats.resolvedToday} 
          icon={CheckCircle} 
          color="text-green-600" 
          action="Great work!" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">My Priority Items</h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => router.push('/departments/it-department/tickets')}
                className="text-sky-600 hover:text-sky-700 text-sm font-medium"
              >
                Tickets
              </button>
              <span className="text-gray-300">|</span>
              <button 
                onClick={() => router.push('/departments/it-department/requisition')}
                className="text-sky-600 hover:text-sky-700 text-sm font-medium"
              >
                Requisitions
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {myTickets.length === 0 && myRequisitions.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No priority items found</p>
              </div>
            ) : (
              <>
                {/* Show tickets first */}
                {myTickets.slice(0, 3).map(ticket => (
                  <PriorityItem key={`ticket-${ticket.id}`} item={ticket} type="ticket" />
                ))}
                {/* Show requisitions */}
                {myRequisitions.slice(0, 3).map(requisition => (
                  <PriorityItem key={`requisition-${requisition.id}`} item={requisition} type="requisition" />
                ))}
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Pending Requisitions</h3>
            <button 
              onClick={() => router.push('/departments/it-department/requisition')}
              className="text-sky-600 hover:text-sky-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="p-4">
            {pendingRequisitions.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending requisitions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequisitions.slice(0, 3).map(requisition => (
                  <RequisitionCard key={requisition.id} requisition={requisition} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleQuickAction('tickets')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <Ticket className="h-6 w-6 text-sky-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">New Ticket</p>
            </button>
            <button 
              onClick={() => handleQuickAction('access')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <Key className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Grant Access</p>
            </button>
            <button 
              onClick={() => handleQuickAction('requisitions')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <Package className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Approve Item</p>
            </button>
            <button 
              onClick={() => handleQuickAction('delivery')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <Truck className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Schedule Delivery</p>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {tickets.slice(0, 3).map(ticket => (
              <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Ticket className="h-5 w-5 text-sky-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ticket.issue_type}</p>
                    <p className="text-xs text-gray-600">{ticket.created_by_name} - {ticket.status}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-medium">{formatDate(ticket.created_at)}</span>
              </div>
            ))}
            {requisitions.slice(0, 2).map(requisition => (
              <div key={requisition.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{requisition.item_name}</p>
                    <p className="text-xs text-gray-600">{requisition.requested_by_name} - {requisition.status}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-medium">{formatDate(requisition.created_at)}</span>
              </div>
            ))}
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