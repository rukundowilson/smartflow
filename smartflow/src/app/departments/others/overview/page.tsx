"use client"
import React, { useEffect, useState } from 'react';
import { 
  Ticket, 
  Package, 
  CheckCircle,
  AlertCircle,
  Eye,
  Laptop,
} from 'lucide-react';
import {useRouter} from 'next/navigation';
import NavBar from "../components/navbar";
import SideBar from "../components/sidebar";
import { useAuth } from '@/app/contexts/auth-context';
import Modal from '@/app/components/ticketModal';
import { fetchTicketsByUserId } from '@/app/services/ticketService';
import SpinLoading from '@/app/administration/superadmin/components/loading';


// Type definitions
interface Ticket {
  id: string;
  issue_type: string;
  priority: string;
  status: string;
  created: string;
  assigned_to: string;
  description: string;
}

export default function OverView(){
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalType, setModalType] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const {user} = useAuth();
    const [isLoading, setIsLoading] = useState<boolean>();
    const [myTickets, setMyTickets] = useState<Ticket[]>([]);
    const router = useRouter();

  const myRequests = [
    { id: 'IR001', item: 'MacBook Pro 16"', quantity: 1, status: 'Approved', created: '2025-07-19', estimatedDelivery: '2025-07-22' },
    { id: 'IR004', item: 'USB-C Hub', quantity: 1, status: 'Pending', created: '2025-07-18', estimatedDelivery: 'TBD' },
    { id: 'IR003', item: 'Monitor Stand', quantity: 1, status: 'Delivered', created: '2025-07-15', estimatedDelivery: '2025-07-20' },
  ];

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'in progress': return 'text-blue-600 bg-blue-50';
      case 'resolved':
      case 'approved':
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
   interface StatCardProps {
      title: string;
      value: string | number;
      icon: React.ElementType;
      color?: string;
      subtitle?: string;
    }
  
    const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color = 'text-blue-600', subtitle }) => (
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>}
          </div>
          <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${color} flex-shrink-0 ml-2`} />
        </div>
      </div>
    );

    const openModal = (type: string, ticket: any | null = null) => {
      setModalType(type);
      setSelectedTicket(ticket);
      setIsModalOpen(true);
    };

    const closeModal = () => {
      setIsModalOpen(false);
      setModalType('');
      setSelectedTicket(null);
    };

    useEffect(()=>{
        if (!user?.id) return;
        const getTickets = async () => {
            try {
                setIsLoading(true);
                console.log("Fetching tickets for user:", user?.id);
                const resp = await fetchTicketsByUserId(user?.id);
                setMyTickets(resp.tickets)
                console.log(resp);
            } catch (err) {
                console.error(err);
            }
            finally{
                setIsLoading(false)
            }
        };
        getTickets();
    },[user?.id])
    const go = function(){
        router.push("/departments/others/my-tickets");

    }
  
    return(
        <div className="min-h-screen bg-[#F0F8F8]">
            <NavBar/>
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
                <div className="flex flex-col lg:flex-row">
                    {/* Sidebar - Hidden on mobile, shown on larger screens */}
                    <div className="hidden lg:block">
                        <SideBar/> 
                    </div>
                    
                    {/* Main Content */}
                    <main className="flex-1 lg:ml-4 min-w-0">
                        {!isLoading && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Welcome Section */}
                            <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-4 sm:p-6 border border-sky-100">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Welcome back, John!</h2>
                                <p className="text-sm sm:text-base text-gray-600">Here's what's happening with your IT requests and tickets.</p>
                            </div>

                            {/* Stats Grid - Responsive grid that stacks on mobile */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                                <StatCard title="Active Tickets" value="2" icon={Ticket} color="text-orange-600" subtitle="1 high priority" />
                                <StatCard title="Pending Requests" value="1" icon={Package} color="text-yellow-600" subtitle="USB-C Hub" />
                                <StatCard title="Resolved This Month" value="5" icon={CheckCircle} color="text-green-600" subtitle="Great progress!" />
                                <StatCard title="Items Delivered" value="3" icon={Laptop} color="text-blue-600" subtitle="This quarter" />
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6">
                                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div onClick={() => openModal('new')} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer">
                                        <div className="flex items-center">
                                            <div className="bg-red-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                                                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                                            </div>
                                            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                                <h4 className="font-medium text-gray-900 text-sm sm:text-base">Report IT Issue</h4>
                                                <p className="text-xs sm:text-sm text-gray-500">Get help with technical problems</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer">
                                        <div className="flex items-center">
                                            <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                                                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                            </div>
                                            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                                <h4 className="font-medium text-gray-900 text-sm sm:text-base">Request IT Equipment</h4>
                                                <p className="text-xs sm:text-sm text-gray-500">Order laptops, accessories, software</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity - Stack vertically on mobile */}
                            <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                                        <h3 className="text-base sm:text-lg font-medium text-gray-900">Recent Tickets</h3>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {myTickets.slice(0, 3).map(ticket => (
                                            <div key={ticket.id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{ticket.issue_type}</p>
                                                        <p className="text-xs text-gray-500 mt-1">Assigned to: {ticket.assigned_to || "any"}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs rounded-full self-start sm:ml-2 flex-shrink-0 ${getStatusColor(ticket.status)}`}>
                                                        {ticket.status}
                                                    </span>
                                                    <button 
                                                    onClick={() => openModal('view', ticket)}
                                                    className="text-sky-600 hover:text-sky-900 p-1" 
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 sm:px-6 py-3 border-t border-gray-100">
                                        <button onClick={go}
                                        className="text-sky-600 hover:text-sky-700 text-sm font-medium">View all tickets →</button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                                        <h3 className="text-base sm:text-lg font-medium text-gray-900">Recent Requests</h3>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {myRequests.slice(0, 3).map(request => (
                                            <div key={request.id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{request.item}</p>
                                                        <p className="text-xs text-gray-500 mt-1">Est. delivery: {request.estimatedDelivery}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs rounded-full self-start sm:ml-2 flex-shrink-0 ${getStatusColor(request.status)}`}>
                                                        {request.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 sm:px-6 py-3 border-t border-gray-100">
                                        <button className="text-sky-600 hover:text-sky-700 text-sm font-medium">View all requests →</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        )}
                        {isLoading && (
                            <SpinLoading/>
                        )}
                    </main>
                </div>
            </div>
            <Modal
                isModalOpen ={isModalOpen}
                user = {user}
                closeModal = {closeModal}
                modalType = {modalType}
                selectedTicket = {selectedTicket}
                
                />
        </div>
    )
}