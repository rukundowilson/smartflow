"use client"
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  Users,
  X,
  AlertCircle,
  Calendar
} from 'lucide-react';
import CustomSelect from './CustomSelect';
import { useAuth } from '@/app/contexts/auth-context';
import SpinLoading from '../administration/superadmin/components/loading';
import { 
  getAllTickets, 
  updateTicketAssignment, 
  updateTicketStatus, 
  getITUsers,
  ITTicket,
  ITUser 
} from '../services/itTicketService';
import { getTicketComments } from '../services/commentService';
import Modal from './ticketModal';

export default function ITTicketManager(){
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<ITTicket | null>(null);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tickets, setTickets] = useState<ITTicket[]>([]);
  const [itUsers, setItUsers] = useState<ITUser[]>([]);
  const [updatingTicket, setUpdatingTicket] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [assigneeSearchTerm, setAssigneeSearchTerm] = useState('');
  const [triggerButtonRef, setTriggerButtonRef] = useState<React.RefObject<HTMLElement> | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [ticketsPerPage] = useState<number>(10);

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200';
      case 'closed': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColorForDropdown = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'in progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'resolved':
      case 'approved':
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColorForDropdown = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await getAllTickets();
      setTickets(response.tickets || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchITUsers = async () => {
    try {
      const response = await getITUsers();
      setItUsers(response.users || []);
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
      await fetchTickets();
    } catch (err) {
      console.error('Error assigning ticket:', err);
    } finally {
      setUpdatingTicket(null);
    }
  };

  const handleUpdateStatus = async (ticketId: number, status: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    try {
      setUpdatingTicket(ticketId);
      await updateTicketStatus(ticketId, status, user?.id || null);
      await fetchTickets();
    } catch (err) {
      console.error('Error updating ticket status:', err);
    } finally {
      setUpdatingTicket(null);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
  };

  const handleCommentSubmit = async () => {
    if (commentText.trim() && selectedTicket) {
      setIsSubmitting(true);
      try {
        const { createComment } = await import('../services/commentService');
        const newComment = await createComment({
          comment_type: 'ticket',
          commented_id: selectedTicket.id,
          commented_by: user?.id || 0,
          content: commentText.trim()
        });
        
        setCommentText('');
        await fetchTickets();
        
        // Refresh comments if modal is still open
        if (isModalOpen && selectedTicket) {
          const response = await getTicketComments(selectedTicket.id);
          setComments(response.comments || []);
        }
      } catch (err) {
        console.error('Error adding comment:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isModalOpen) {
        const target = event.target as HTMLElement;
        const modal = target.closest('.modal-content, .ticket-modal');
        const dropdown = target.closest('.custom-select, .select-dropdown');
        
        if (!modal && !dropdown) {
          closeModal();
        }
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  // Fetch comments when modal opens
  useEffect(() => {
    if (isModalOpen && selectedTicket && (modalType === 'comment' || modalType === 'view')) {
      const fetchComments = async () => {
        try {
          setLoadingComments(true);
          const response = await getTicketComments(selectedTicket.id);
          setComments(response.comments || []);
        } catch (err) {
          console.error('Error fetching comments:', err);
        } finally {
          setLoadingComments(false);
        }
      };
      fetchComments();
    }
  }, [isModalOpen, selectedTicket, modalType]);

  // Set selected assignee when modal opens
  useEffect(() => {
    if (selectedTicket && modalType === 'view') {
      setSelectedAssignee(selectedTicket.assigned_to?.toString() || '');
    }
  }, [selectedTicket, modalType]);

  // Handle assignee change
  const handleAssigneeChange = async (assigneeId: string) => {
    if (!selectedTicket) return;
    
    try {
      setIsSubmitting(true);
      const assigneeIdNum = assigneeId ? parseInt(assigneeId) : null;
      await updateTicketAssignment(selectedTicket.id, assigneeIdNum);
      setSelectedAssignee(assigneeId);
      setShowAssigneeDropdown(false);
      setAssigneeSearchTerm('');
      
      await fetchTickets();
    } catch (err) {
      console.error('Error updating assignment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAssigneeDropdown = () => {
    setShowAssigneeDropdown(!showAssigneeDropdown);
    if (!showAssigneeDropdown) {
      setAssigneeSearchTerm('');
    }
  };

  const filteredUsers = itUsers.filter(user =>
    user.full_name.toLowerCase().includes(assigneeSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(assigneeSearchTerm.toLowerCase())
  );

  const openModal = (type: string, ticket: ITTicket | null = null, buttonRef?: React.RefObject<HTMLElement>) => {
    setModalType(type);
    setSelectedTicket(ticket);
    setTriggerButtonRef(buttonRef || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType('');
    setSelectedTicket(null);
    setCommentText('');
    setComments([]);
  };

  interface ActionButtonProps {
    icon: React.ElementType;
    label: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    variant?: 'primary' | 'secondary';
    className?: string;
    disabled?: boolean;
  }

  const ActionButton: React.FC<ActionButtonProps> = ({ 
    icon: Icon, 
    label, 
    onClick, 
    variant = 'primary', 
    className = '',
    disabled = false 
  }) => {
    const baseClasses = "inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
      primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500 disabled:hover:bg-sky-600",
      secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-sky-500 disabled:hover:bg-white"
    };
    
    return (
      <button 
        onClick={onClick} 
        disabled={disabled}
        className={`${baseClasses} ${variants[variant]} ${className}`}
      >
        <Icon className="h-4 w-4 mr-2" />
        {label}
      </button>
    );
  };

  const MobileTicketModal = ({ ticket }: { ticket: ITTicket }) => {
    if (!isModalOpen || selectedTicket?.id !== ticket.id) return null;

    const modalContent = (
      <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden modal-content">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {modalType === 'view' ? `Ticket #${ticket.id}` : `Comment - Ticket #${ticket.id}`}
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
            {modalType === 'view' && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{ticket.issue_type}</h4>
                  <p className="text-sm text-gray-600 mb-3">{ticket.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Priority</span>
                      <div className={`inline-block px-2 py-1 text-xs rounded-full border mt-1 ${getPriorityColorForDropdown(ticket.priority)}`}>
                        {ticket.priority}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Status</span>
                      <div className={`inline-block px-2 py-1 text-xs rounded-full border mt-1 ${getStatusColorForDropdown(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="font-medium text-gray-700">Created by:</span>
                      <p className="text-gray-900">{ticket.created_by_name || 'Unknown'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="font-medium text-gray-700">Created:</span>
                      <p className="text-gray-900">
                        {new Date(ticket.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {ticket.assigned_to_name && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="font-medium text-gray-700">Assigned to:</span>
                        <p className="text-gray-900">{ticket.assigned_to_name}</p>
                      </div>
                    </div>
                  )}
                  
                  {ticket.reviewed_by_name && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="font-medium text-gray-700">Reviewed by:</span>
                        <p className="text-gray-900">{ticket.reviewed_by_name}</p>
                        {ticket.reviewed_at && (
                          <p className="text-xs text-gray-500">
                            {new Date(ticket.reviewed_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Comments ({comments.length})</h4>
                  
                  {loadingComments ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="h-6 w-6 rounded-full bg-sky-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-sky-600">
                                  {comment.commented_by_name ? comment.commented_by_name.charAt(0).toUpperCase() : 'U'}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {comment.commented_by_name || 'Unknown User'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No comments yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {modalType === 'comment' && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-1">Ticket #{ticket.id}</h4>
                  <p className="text-sm text-gray-600 mb-3">{ticket.issue_type}</p>
                  
                  {/* Problem Details */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-xs font-medium text-gray-500">Priority</span>
                        <div className={`inline-block px-2 py-1 text-xs rounded-full border mt-1 ${getPriorityColorForDropdown(ticket.priority)}`}>
                          {ticket.priority}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-gray-300"></div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">Status</span>
                        <div className={`inline-block px-2 py-1 text-xs rounded-full border mt-1 ${getStatusColorForDropdown(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="mt-3">
                    <span className="text-xs font-medium text-gray-500">Description</span>
                    <p className="text-sm text-gray-700 mt-1 bg-white p-2 rounded border">{ticket.description}</p>
                  </div>
                  
                  {/* Ticket Details */}
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="font-medium text-gray-700">Created by:</span>
                      <span className="text-gray-900">{ticket.created_by_name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="font-medium text-gray-700">Created:</span>
                      <span className="text-gray-900">
                        {new Date(ticket.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {ticket.assigned_to_name && (
                      <div className="flex items-center space-x-2">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span className="font-medium text-gray-700">Assigned to:</span>
                        <span className="text-gray-900">{ticket.assigned_to_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Comments ({comments.length})</h4>
                  
                  {loadingComments ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-3 max-h-40 overflow-y-auto mb-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="h-6 w-6 rounded-full bg-sky-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-sky-600">
                                  {comment.commented_by_name ? comment.commented_by_name.charAt(0).toUpperCase() : 'U'}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {comment.commented_by_name || 'Unknown User'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 mb-4">
                      <MessageSquare className="h-6 w-6 mx-auto mb-1 text-gray-300" />
                      <p className="text-sm">No comments yet</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Comment</label>
                  <textarea 
                    rows={3}
                    value={commentText}
                    onChange={handleCommentChange}
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none text-sm"
                    placeholder="Enter your comment..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCommentSubmit}
                    disabled={!commentText.trim() || isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Comment'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  return(
    <main className="flex-1 min-w-0 p-4 sm:p-6">
      {isLoading ? (
        <div className="flex justify-center items-center min-h-96">
          <SpinLoading />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">IT Ticket Management</h2>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets by ID, issue type, priority, status, or creator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200"
                />
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'open', label: 'Open' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'resolved', label: 'Resolved' },
                    { value: 'closed', label: 'Closed' }
                  ]}
                  placeholder="Filter by Status"
                />
                
                <CustomSelect
                  value={priorityFilter}
                  onChange={setPriorityFilter}
                  options={[
                    { value: 'all', label: 'All Priority' },
                    { value: 'critical', label: 'Critical' },
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' }
                  ]}
                  placeholder="Filter by Priority"
                />

                <CustomSelect
                  value={assignmentFilter}
                  onChange={setAssignmentFilter}
                  options={[
                    { value: 'all', label: 'All Assignments' },
                    { value: 'unassigned', label: 'Unassigned' },
                    { value: 'assigned', label: 'Assigned' },
                    { value: 'assigned_to_me', label: 'Assigned to Me' }
                  ]}
                  placeholder="Filter by Assignment"
                />
              </div>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="block lg:hidden">
            {currentTickets.length > 0 ? (
              <div className="space-y-4">
                {currentTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-sky-600">#{ticket.id}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{ticket.issue_type}</h3>
                            <p className="text-sm text-gray-500">by {ticket.created_by_name}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(ticket.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openModal('view', ticket)}
                          className="text-sky-600 hover:text-sky-700 p-2 rounded-md hover:bg-sky-50 transition-colors duration-200" 
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => openModal('comment', ticket)}
                          className="text-gray-600 hover:text-gray-700 p-2 rounded-md hover:bg-gray-50 transition-colors duration-200" 
                          title="Add Comment"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Assigned to:</span> {ticket.assigned_to_name || 'Unassigned'}</p>
                      {ticket.reviewed_by_name && ticket.reviewed_at && (
                        <p><span className="font-medium">Reviewed by:</span> {ticket.reviewed_by_name} on {new Date(ticket.reviewed_at).toLocaleDateString()}</p>
                      )}
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        <CustomSelect
                          value={ticket.status}
                          onChange={(value) => handleUpdateStatus(ticket.id, value as any)}
                          options={[
                            { value: 'open', label: 'Open' },
                            { value: 'in_progress', label: 'In Progress' },
                            { value: 'resolved', label: 'Resolved' },
                            { value: 'closed', label: 'Closed' }
                          ]}
                          disabled={updatingTicket === ticket.id}
                          size="sm"
                          className="w-36"
                        />
                      </div>
                    </div>

                    {/* Mobile Modal */}
                    <MobileTicketModal ticket={ticket} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
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

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            {currentTickets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assignment
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center">
                                <span className="text-sm font-semibold text-sky-600">#{ticket.id}</span>
                              </div>
                            </div>
                            <div className="ml-3 min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {ticket.issue_type}
                              </div>
                              <div className="text-sm text-gray-500">
                                by {ticket.created_by_name}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                                  {ticket.priority}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(ticket.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <CustomSelect
                            value={ticket.status}
                            onChange={(value) => handleUpdateStatus(ticket.id, value as any)}
                            options={[
                              { value: 'open', label: 'Open' },
                              { value: 'in_progress', label: 'In Progress' },
                              { value: 'resolved', label: 'Resolved' },
                              { value: 'closed', label: 'Closed' }
                            ]}
                            disabled={updatingTicket === ticket.id}
                            size="sm"
                            className="w-32"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {ticket.assigned_to_name || 'Unassigned'}
                            </div>
                            {ticket.reviewed_by_name && (
                              <div className="text-xs text-gray-500">
                                Reviewed by {ticket.reviewed_by_name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              onClick={(e) => {
                                const buttonRef = { current: e.currentTarget };
                                openModal('view', ticket, buttonRef);
                              }}
                              className="text-sky-600 hover:text-sky-700 p-2 rounded-md hover:bg-sky-50 transition-colors duration-200" 
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                const buttonRef = { current: e.currentTarget };
                                openModal('comment', ticket, buttonRef);
                              }}
                              className="text-gray-600 hover:text-gray-700 p-2 rounded-md hover:bg-gray-50 transition-colors duration-200" 
                              title="Add Comment"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
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

          {/* Pagination */}
          {filteredTickets.length > ticketsPerPage && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Results info */}
                <div className="text-sm text-gray-700 order-2 sm:order-1">
                  Showing {indexOfFirstTicket + 1} to {Math.min(indexOfLastTicket, filteredTickets.length)} of {filteredTickets.length} tickets
                </div>
                
                {/* Pagination controls */}
                <div className="flex items-center space-x-2 order-1 sm:order-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Previous</span>
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
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
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
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desktop Modal */}
      <div className="hidden lg:block">
        <Modal
          isModalOpen={isModalOpen}
          user={user}
          closeModal={closeModal}
          modalType={modalType}
          selectedTicket={selectedTicket}
          onTicketCreated={fetchTickets}
          triggerButtonRef={triggerButtonRef}
        />
      </div>
    </main>
  );
}