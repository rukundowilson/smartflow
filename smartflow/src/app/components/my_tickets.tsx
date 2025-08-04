"use client"
import React, { useEffect, useState } from 'react';
import { fetchTicketsByUserId } from '@/app/services/ticketService';
import { 
  Plus, 
  Eye,
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useAuth } from '@/app/contexts/auth-context';
import Modal from '@/app/components/ticketModal';
import SpinLoading from '../administration/superadmin/components/loading';

// Type definitions
interface Ticket {
  id: string;
  issue_type: string;
  priority: string;
  status: string;
  created_at: string;
  assigned_to: string;
  description: string;
  created_by_name?: string;
  assigned_to_name?: string;
}

export default function MyTickets(){
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalType, setModalType] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const {user} = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [myTickets, setMyTickets] = useState<Ticket[]>([]);
    const [error, setError] = useState<string>('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [ticketsPerPage] = useState<number>(10);
    
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
  
    const getPriorityColor = (priority: string): string => {
      switch (priority.toLowerCase()) {
        case 'high': return 'text-red-600 bg-red-50';
        case 'medium': return 'text-yellow-600 bg-yellow-50';
        case 'low': return 'text-green-600 bg-green-50';
        default: return 'text-gray-600 bg-gray-50';
      }
    };
    
    useEffect(()=>{
        if (!user?.id) {
          console.log("No user ID available");
          return;
        }
        
        const getTickets = async () => {
            try {
              setIsLoading(true);
              setError('');
              console.log("Fetching tickets for user:", user?.id);
              const resp = await fetchTicketsByUserId(user?.id);
              console.log("API Response:", resp);
              
              // Handle the response structure properly
              if (resp && resp.success && resp.tickets) {
                console.log("Tickets data:", resp.tickets);
                setMyTickets(resp.tickets || []);
              } else if (resp && resp.tickets) {
                // Fallback for direct tickets array
                console.log("Tickets data (direct):", resp.tickets);
                setMyTickets(resp.tickets || []);
              } else {
                console.log("No tickets found in response");
                setMyTickets([]);
              }
            } catch (err: any) {
              console.error("Error fetching tickets:", err);
              setError(err.message || "Failed to fetch tickets");
              setMyTickets([]);
            }
            finally{
              setIsLoading(false)
            }
        };
        getTickets();
    },[user?.id])
    
    interface ActionButtonProps {
      icon: React.ElementType;
      label: string;
      onClick?: React.MouseEventHandler<HTMLButtonElement>;
      variant?: 'primary' | 'secondary';
      className?: string;
    }
  
    const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, onClick, variant = 'primary', className = '' }) => {
      const baseClasses = "inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
      const variants = {
        primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
        secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-sky-500"
      };
      
      return (
        <button onClick={onClick} className={`${baseClasses} ${variants[variant]} ${className}`}>
          <Icon className="h-4 w-4 mr-2" />
          {label}
        </button>
      );
    };

    const openModal = (type: string, ticket: Ticket | null = null) => {
      setModalType(type);
      setSelectedTicket(ticket);
      setIsModalOpen(true);
    };

    const closeModal = () => {
      setIsModalOpen(false);
      setModalType('');
      setSelectedTicket(null);
    };

    const refreshTickets = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        setError('');
        console.log("Refreshing tickets for user:", user?.id);
        const resp = await fetchTicketsByUserId(user?.id);
        console.log("API Response:", resp);
        
        // Handle the response structure properly
        if (resp && resp.success && resp.tickets) {
          console.log("Tickets data:", resp.tickets);
          setMyTickets(resp.tickets || []);
        } else if (resp && resp.tickets) {
          // Fallback for direct tickets array
          console.log("Tickets data (direct):", resp.tickets);
          setMyTickets(resp.tickets || []);
        } else {
          console.log("No tickets found in response");
          setMyTickets([]);
        }
      } catch (err: any) {
        console.error("Error refreshing tickets:", err);
        setError(err.message || "Failed to refresh tickets");
      } finally {
        setIsLoading(false);
      }
    };
    
    // Filter tickets based on search term and filters
    const filteredTickets = Array.isArray(myTickets)
      ? myTickets.filter((ticket: any) => {
          const matchesSearch = 
            ticket.issue_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.priority?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.status?.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesStatus = statusFilter === 'all' || ticket.status?.toLowerCase() === statusFilter.toLowerCase();
          const matchesPriority = priorityFilter === 'all' || ticket.priority?.toLowerCase() === priorityFilter.toLowerCase();
          
          return matchesSearch && matchesStatus && matchesPriority;
        })
      : [];

    console.log("myTickets:", myTickets);
    console.log("filteredTickets:", filteredTickets);
    console.log("User ID:", user?.id);

    // Pagination logic
    const indexOfLastTicket = currentPage * ticketsPerPage;
    const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
    const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
    const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

    // Reset to first page when filters change
    useEffect(() => {
      setCurrentPage(1);
    }, [searchTerm, statusFilter, priorityFilter]);

    const handlePageChange = (pageNumber: number) => {
      setCurrentPage(pageNumber);
    };

    const goToPreviousPage = () => {
      setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
      setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

        return(
            <main className="flex-1 min-w-0">
                {!isLoading && (
                <div className="space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">My IT Tickets</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} found
                            </p>
                            {error && (
                              <p className="text-sm text-red-600 mt-1">
                                Error: {error}
                              </p>
                            )}
                        </div>
                        <ActionButton 
                            icon={Plus} 
                            label="Report New Issue" 
                            onClick={() => openModal('new')}
                            className="w-full sm:w-auto"
                        />
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search tickets by ID, issue type, priority, or status..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                            </div>
                            
                            {/* Status Filter */}
                            <div className="lg:w-48">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            
                            {/* Priority Filter */}
                            <div className="lg:w-48">
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                >
                                    <option value="all">All Priority</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Cards View */}
                    <div className="block lg:hidden space-y-4">
                    {currentTickets?.map((ticket : any) => (
                        <div key={ticket.id} className="bg-white shadow-sm rounded-lg border border-gray-100 p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                            <h3 className="font-medium text-gray-900">{ticket.id}</h3>
                            <p className="text-sm text-gray-600 mt-1">{ticket.issue_type}</p>
                            </div>
                            <div className="flex space-x-2">
                            <button 
                                onClick={() => openModal('view', ticket)}
                                className="text-sky-600 hover:text-sky-900 p-1" 
                                title="View Details"
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                            <button 
                                onClick={() => openModal('comment', ticket)}
                                className="text-gray-600 hover:text-gray-900 p-1" 
                                title="Add Comment"
                            >
                                <MessageSquare className="h-4 w-4" />
                            </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                            <p>Assigned to: {ticket.assigned_to_name || 'Unassigned'}</p>
                            <p>Created: {ticket.created_at}</p>
                        </div>
                        </div>
                    ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block bg-white shadow-sm rounded-lg border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentTickets?.map((ticket : any) => (
                            <tr key={ticket.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.id}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{ticket.issue_type}</td>
                                <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                                    {ticket.priority}
                                </span>
                                </td>
                                <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">{ticket.assigned_to_name || 'Unassigned'}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{ticket.created_at}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                <button 
                                    onClick={() => openModal('view', ticket)}
                                    className="text-sky-600 hover:text-sky-900" 
                                    title="View Details"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={() => openModal('comment', ticket)}
                                    className="text-gray-600 hover:text-gray-900" 
                                    title="Add Comment"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                </button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    </div>

                    {/* Pagination */}
                    {filteredTickets.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                {/* Results info */}
                                <div className="text-sm text-gray-700">
                                    Showing {indexOfFirstTicket + 1} to {Math.min(indexOfLastTicket, filteredTickets.length)} of {filteredTickets.length} tickets
                                </div>
                                
                                {/* Pagination controls */}
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={goToPreviousPage}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    
                                    {/* Page numbers */}
                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                                            let pageNumber;
                                            if (totalPages <= 5) {
                                                pageNumber = index + 1;
                                            } else if (currentPage <= 3) {
                                                pageNumber = index + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNumber = totalPages - 4 + index;
                                            } else {
                                                pageNumber = currentPage - 2 + index;
                                            }
                                            
                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                                                        currentPage === pageNumber
                                                            ? 'bg-sky-600 text-white'
                                                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    <button
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {filteredTickets.length === 0 && !isLoading && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
                            <div className="text-gray-400 mb-4">
                                <MessageSquare className="h-12 w-12 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                            <p className="text-gray-600">
                                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                                    ? 'Try adjusting your search or filters.' 
                                    : 'You haven\'t created any tickets yet.'}
                            </p>
                        </div>
                    )}
                </div>
                )}
                {isLoading && (
                  <div className=''><SpinLoading/></div>
                )}
                <Modal
                isModalOpen ={isModalOpen}
                user = {user}
                closeModal = {closeModal}
                modalType = {modalType}
                selectedTicket = {selectedTicket}
                onTicketCreated = {refreshTickets}
                />
            </main>

    )
}