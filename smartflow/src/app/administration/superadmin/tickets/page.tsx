"use client"
import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Eye,
  MessageSquare,
  Search, 
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Users
} from 'lucide-react';
import { useAuth } from '@/app/contexts/auth-context';
import Modal from '@/app/components/ticketModal';
import SpinLoading from '../components/loading';
import SideBar from '../components/sidebar';
import NavBar from '../components/nav';
import { 
  getAllTickets, 
  updateTicketAssignment, 
  updateTicketStatus, 
  getITUsers,
  ITTicket,
  ITUser 
} from '@/app/services/itTicketService';

export default function SuperAdminTickets(){
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<ITTicket | null>(null);
  const {user} = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tickets, setTickets] = useState<ITTicket[]>([]);
  const [itUsers, setItUsers] = useState<ITUser[]>([]);
  const [updatingTicket, setUpdatingTicket] = useState<number | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [ticketsPerPage] = useState<number>(10);

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
      case 'open': return 'text-orange-600 bg-orange-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'closed': return 'text-gray-600 bg-gray-50';
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

  const isUnresolved = (status: string): boolean => {
    return status === 'open' || status === 'in_progress';
  };

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await getAllTickets();
      setTickets(response.tickets);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchITUsers = async () => {
    try {
      const response = await getITUsers();
      setItUsers(response.users);
    } catch (err) {
      console.error('Error fetching IT users:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchITUsers();
  }, []);

  // Filter tickets based on search term and filters
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = 
      ticket.issue_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.priority?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    let matchesAssignment = true;
    if (assignmentFilter === 'unassigned') {
      matchesAssignment = ticket.assigned_to === null;
    } else if (assignmentFilter === 'assigned') {
      matchesAssignment = ticket.assigned_to !== null;
    } else if (assignmentFilter === 'assigned_to_me') {
      matchesAssignment = ticket.assigned_to === user?.id;
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignment;
  });

  // Pagination logic
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter, assignmentFilter]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleAssignTicket = async (ticketId: number, assignedTo: number | null) => {
    try {
      setUpdatingTicket(ticketId);
      await updateTicketAssignment(ticketId, assignedTo);
      await fetchTickets(); // Refresh the data
    } catch (err) {
      console.error('Error assigning ticket:', err);
    } finally {
      setUpdatingTicket(null);
    }
  };

  const openModal = (type: string, ticket: ITTicket | null = null) => {
    setModalType(type);
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType('');
    setSelectedTicket(null);
  };

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

  return(
    <div className="min-h-screen bg-[#F0F8F8]">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          <SideBar />
          <main className="flex-1 min-w-0">
            {!isLoading && (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Super Admin Ticket Management</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  <ActionButton 
                    icon={Plus} 
                    label="Create New Ticket" 
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
                          placeholder="Search tickets by ID, issue type, priority, status, or creator..."
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
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                                </div>

                    {/* Assignment Filter */}
                    <div className="lg:w-48">
                      <select
                        value={assignmentFilter}
                        onChange={(e) => setAssignmentFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                      >
                        <option value="all">All Assignments</option>
                        <option value="unassigned">Unassigned</option>
                        <option value="assigned">Assigned</option>
                        <option value="assigned_to_me">Assigned to Me</option>
                                  </select>
                                </div>
                  </div>
                </div>

                {/* Mobile Cards View */}
                <div className="block lg:hidden space-y-4">
                  {currentTickets?.map((ticket) => (
                    <div key={ticket.id} className="bg-white shadow-sm rounded-lg border border-gray-100 p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className="h-6 w-6 rounded-full bg-sky-100 flex items-center justify-center mr-3">
                              <span className="text-xs font-medium text-sky-600">#{ticket.id}</span>
                                </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{ticket.issue_type}</h3>
                              <p className="text-xs text-gray-500">by {ticket.created_by_name}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">Created: {new Date(ticket.created_at).toLocaleDateString()}</p>
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
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Assigned to: {ticket.assigned_to_name || 'Unassigned'}</p>
                        {ticket.reviewed_by_name && ticket.reviewed_at && (
                          <p>Reviewed by: {ticket.reviewed_by_name} on {new Date(ticket.reviewed_at).toLocaleDateString()}</p>
                        )}
                            </div>
                      
                      {/* Assignment for unresolved tickets only */}
                      {isUnresolved(ticket.status) && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Assign to:</label>
                          <select
                            value={ticket.assigned_to || ''}
                            onChange={(e) => handleAssignTicket(ticket.id, e.target.value ? parseInt(e.target.value) : null)}
                            disabled={updatingTicket === ticket.id}
                            className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                          >
                            <option value="">Unassigned</option>
                            {itUsers.map((itUser) => (
                              <option key={itUser.id} value={itUser.id}>
                                {itUser.full_name}
                              </option>
                            ))}
                          </select>
                          </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Desktop Table View */}
                <div className="hidden lg:block bg-white shadow-sm rounded-lg border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Info</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentTickets?.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-sky-600">#{ticket.id}</span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{ticket.issue_type}</div>
                                  <div className="text-sm text-gray-500">by {ticket.created_by_name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(ticket.created_at).toLocaleDateString()}
                          </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                                {ticket.status.replace('_', ' ')}
                            </span>
                          </td>
                            <td className="px-6 py-4 text-center">
                              {isUnresolved(ticket.status) ? (
                                <select
                                  value={ticket.assigned_to || ''}
                                  onChange={(e) => handleAssignTicket(ticket.id, e.target.value ? parseInt(e.target.value) : null)}
                                  disabled={updatingTicket === ticket.id}
                                  className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                                >
                                  <option value="">Unassigned</option>
                                  {itUsers.map((itUser) => (
                                    <option key={itUser.id} value={itUser.id}>
                                      {itUser.full_name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-sm text-gray-500">
                                  {ticket.assigned_to_name || 'Unassigned'}
                            </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {ticket.reviewed_by_name && ticket.reviewed_at ? (
                                <div>
                                  <p className="font-medium">{ticket.reviewed_by_name}</p>
                                  <p className="text-xs">{new Date(ticket.reviewed_at).toLocaleDateString()}</p>
                                </div>
                              ) : (
                                <span className="text-gray-400">Not reviewed</span>
                              )}
                          </td>
                            <td className="px-6 py-4 text-center space-x-2">
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
                      {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || assignmentFilter !== 'all'
                        ? 'Try adjusting your search or filters.' 
                        : 'No tickets have been created yet.'}
                    </p>
                </div>
                )}
              </div>
            )}
            {isLoading && (
              <div className=''><SpinLoading/></div>
            )}
            <Modal
              isModalOpen={isModalOpen}
              user={user}
              closeModal={closeModal}
              modalType={modalType}
              selectedTicket={selectedTicket}
            />
          </main>
        </div>
      </div>
    </div>
  );
}