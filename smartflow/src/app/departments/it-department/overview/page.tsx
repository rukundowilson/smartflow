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
  AlertCircle
} from 'lucide-react';
import NavBar from "../components/navbar"
import SideBar from "../components/sidebar"
import { getAllTickets, ITTicket } from '../../../services/itTicketService';
import { getAllItemRequisitions, ItemRequisition } from '../../../services/itemRequisitionService';

export default function OverView(){
      const router = useRouter();
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [tickets, setTickets] = useState<ITTicket[]>([]);
      const [requisitions, setRequisitions] = useState<ItemRequisition[]>([]);

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

      // Get current user
      const currentUser = getCurrentUser();

      // Filter tickets for current user (assigned to them)
      const myTickets = tickets.filter(ticket => 
        ticket.assigned_to === currentUser?.id || 
        ticket.priority === 'high' || 
        ticket.priority === 'critical'
      );

      // Get statistics
      const stats = {
        myActiveTickets: myTickets.length,
        pendingApprovals: requisitions.filter(r => r.status === 'pending').length,
        readyForDelivery: requisitions.filter(r => r.status === 'approved').length,
        resolvedToday: tickets.filter(t => 
          t.status === 'resolved' && 
          new Date(t.created_at).toDateString() === new Date().toDateString()
        ).length
      };

      const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
          case 'open':
          case 'pending it approval':
          case 'pending it review': return 'text-orange-600 bg-orange-50';
          case 'assigned to me':
          case 'in_progress': return 'text-blue-600 bg-blue-50';
          case 'resolved':
          case 'approved':
          case 'it approved':
          case 'completed': return 'text-green-600 bg-green-50';
          case 'ready for delivery': return 'text-purple-600 bg-purple-50';
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
          title="Ready for Delivery" 
          value={stats.readyForDelivery} 
          icon={Truck} 
          color="text-purple-600" 
          action="Items awaiting pickup" 
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
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">My Priority Tickets</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {myTickets.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No priority tickets found</p>
              </div>
            ) : (
              myTickets.slice(0, 4).map(ticket => (
                <div key={ticket.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ticket.issue_type}</p>
                      <p className="text-xs text-gray-500 mt-1">{ticket.created_by_name}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => router.push('/departments/it-department/tickets')}
                      className="text-sky-600 hover:text-sky-700 text-sm font-medium"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
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