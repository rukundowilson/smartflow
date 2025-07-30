"use client";

import React, { useState, useEffect } from 'react';
import { 
  X,
  Calendar,
  User,
  AlertCircle,
  Search
} from 'lucide-react';
import { createTicket, getTicketById } from '../services/ticketService';
import { getITUsers, updateTicketAssignment, ITUser } from '../services/itTicketService';
import { createComment, getTicketComments, Comment } from '../services/commentService';

interface NewTicket {
  issue_type: string;
  priority: string;
  description: string;
}

interface ModalProps {
  isModalOpen: boolean;
  user: any;
  closeModal: () => void;
  modalType : string;
  selectedTicket : any;
  onTicketCreated?: () => void;
}

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


const Modal: React.FC<ModalProps> = ({ 
  isModalOpen, 
  user, 
  closeModal, 
  modalType,
  selectedTicket,
  onTicketCreated,
}) => {
        const currentUser = user?.id;
        const [newTicket, setNewTicket] = useState<NewTicket>({
          issue_type: 'Hardware Problem',
          priority: 'Medium',
          description: "",
        });
        const [commentText, setCommentText] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [itUsers, setItUsers] = useState<ITUser[]>([]);
        const [selectedAssignee, setSelectedAssignee] = useState<string>('');
        const [searchTerm, setSearchTerm] = useState('');
        const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
        const [comments, setComments] = useState<Comment[]>([]);
        const [loadingComments, setLoadingComments] = useState(false);
        const [currentTicket, setCurrentTicket] = useState<any>(selectedTicket);

        // Update currentTicket when selectedTicket prop changes
        useEffect(() => {
          setCurrentTicket(selectedTicket);
        }, [selectedTicket]);
      
        const handleInputChange = (
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
        ) => {
          const { name, value } = e.target;
          setNewTicket((prev) => ({
            ...prev,
            [name]: value,
          }));
        };
      
        const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setCommentText(e.target.value);
        };
      
        const handleNewTicketSubmit = async () => {
          if (newTicket.description.trim()) {
            setIsSubmitting(true);
            try {
              const result = await createTicket(newTicket, currentUser);
              console.log("Ticket created:", result);
              
              // Reset form
              setNewTicket({
                issue_type: 'Hardware Problem',
                priority: 'Medium',
                description: '',
              });
              
              // Close modal first
              closeModal();
              
              // Show success message briefly
              if (typeof window !== 'undefined') {
                // Create a temporary success message
                const successDiv = document.createElement('div');
                successDiv.className = 'fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2 duration-200';
                successDiv.innerHTML = `
                  <div class="flex items-center">
                    <svg class="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span class="font-medium">Ticket created successfully!</span>
                  </div>
                `;
                document.body.appendChild(successDiv);
                
                // Remove the message after 3 seconds
                setTimeout(() => {
                  if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                  }
                }, 3000);
              }
              
              // Refresh the parent component data
              if (onTicketCreated) {
                onTicketCreated();
              } else {
                // Fallback: reload the page if no callback provided
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }
            } catch (err) {
              console.error(err);
            } finally {
              setIsSubmitting(false);
            }
          }
        };
      
        const handleCommentSubmit = async () => {
          if (commentText.trim() && currentTicket) {
            setIsSubmitting(true);
            try {
              const newComment = await createComment({
                comment_type: 'ticket',
                commented_id: currentTicket.id,
                commented_by: currentUser,
                content: commentText.trim()
              });
              
              // Add the new comment to the list
              setComments(prev => [...prev, newComment]);
              setCommentText('');
              
              // Refresh the parent component data
              if (onTicketCreated) {
                onTicketCreated();
              }
            } catch (err) {
              console.error('Error adding comment:', err);
            } finally {
              setIsSubmitting(false);
            }
          }
        };

        // Fetch IT users when modal opens
        useEffect(() => {
          if (isModalOpen && modalType === 'view') {
            const fetchITUsers = async () => {
              try {
                const response = await getITUsers();
                setItUsers(response.users);
              } catch (err) {
                console.error('Error fetching IT users:', err);
              }
            };
            fetchITUsers();
          }
        }, [isModalOpen, modalType]);

        // Set initial assignee when ticket is selected
        useEffect(() => {
          if (currentTicket && modalType === 'view') {
            setSelectedAssignee(currentTicket.assigned_to?.toString() || '');
          }
        }, [currentTicket, modalType]);

        // Fetch comments when modal opens for comment or view mode
        useEffect(() => {
          if (isModalOpen && currentTicket && (modalType === 'comment' || modalType === 'view')) {
            const fetchComments = async () => {
              try {
                setLoadingComments(true);
                const response = await getTicketComments(currentTicket.id);
                setComments(response.comments);
              } catch (err) {
                console.error('Error fetching comments:', err);
              } finally {
                setLoadingComments(false);
              }
            };
            fetchComments();
          }
        }, [isModalOpen, currentTicket, modalType]);

        // Fetch full ticket details when modal opens for view mode
        useEffect(() => {
          if (isModalOpen && selectedTicket && modalType === 'view') {
            const fetchTicketDetails = async () => {
              try {
                const response = await getTicketById(selectedTicket.id);
                if (response.success && response.ticket) {
                  // Update the current ticket with full details
                  setCurrentTicket(response.ticket);
                }
              } catch (err) {
                console.error('Error fetching ticket details:', err);
              }
            };
            fetchTicketDetails();
          }
        }, [isModalOpen, selectedTicket, modalType]);

        const handleAssigneeChange = async (assigneeId: string) => {
          if (!currentTicket) return;
          
          try {
            setIsSubmitting(true);
            const assigneeIdNum = assigneeId ? parseInt(assigneeId) : null;
            await updateTicketAssignment(currentTicket.id, assigneeIdNum);
            setSelectedAssignee(assigneeId);
            setShowAssigneeDropdown(false);
            setSearchTerm(''); // Clear search term
            
            // Refresh the parent component data
            if (onTicketCreated) {
              onTicketCreated();
            } else {
              // Fallback: reload the page if no callback provided
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }
          } catch (err) {
            console.error('Error updating assignment:', err);
          } finally {
            setIsSubmitting(false);
          }
        };

        const toggleAssigneeDropdown = () => {
          setShowAssigneeDropdown(!showAssigneeDropdown);
          if (!showAssigneeDropdown) {
            setSearchTerm(''); // Clear search when opening
          }
        };

        const filteredUsers = itUsers.filter(user =>
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
        const handleBackdropClick = (e: React.MouseEvent) => {
          if (e.target === e.currentTarget) {
            closeModal();
          }
        };

                // Close dropdown when clicking outside
        useEffect(() => {
          const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (showAssigneeDropdown && !target.closest('.assignee-dropdown')) {
              setShowAssigneeDropdown(false);
              setSearchTerm(''); // Clear search when closing
            }
          };

          document.addEventListener('mousedown', handleClickOutside);
          return () => {
            document.removeEventListener('mousedown', handleClickOutside);
          };
        }, [showAssigneeDropdown]);

        // Early return after all hooks
        if (!isModalOpen) return null;

        return (
        <div 
          className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {modalType === 'new' && 'Report New Issue'}
                              {modalType === 'view' && `Ticket Details - ${currentTicket?.id}`}
              {modalType === 'comment' && `Add Comment - ${currentTicket?.id}`}
              </h3>
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {modalType === 'new' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
                      <select 
                        name="issue_type"
                        value={newTicket.issue_type}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="Hardware Problem">Hardware Problem</option>
                        <option value="Software Issue">Software Issue</option>
                        <option value="Network/Internet">Network/Internet</option>
                        <option value="Email Problem">Email Problem</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        name="priority" 
                        value={newTicket.priority}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea 
                      rows={4} 
                      name="description"
                      value={newTicket.description}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                      placeholder="Please describe your issue in detail..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleNewTicketSubmit}
                      disabled={!newTicket.description.trim() || isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSubmitting && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'view' && currentTicket && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Priority</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(currentTicket.priority)}`}>
                          {currentTicket.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-5 rounded-full bg-gray-300"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Status</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(currentTicket.status)}`}>
                          {currentTicket.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Created</p>
                        <p className="text-sm text-gray-600">
                          {new Date(currentTicket.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-2">Assigned To</p>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={toggleAssigneeDropdown}
                            disabled={isSubmitting}
                            className="w-full text-left px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50"
                          >
                            {selectedAssignee ? 
                              itUsers.find(u => u.id.toString() === selectedAssignee)?.full_name || 'Unknown User' :
                              'Unassigned'
                            }
                          </button>
                          
                          {showAssigneeDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto assignee-dropdown">
                              <div className="p-2 border-b border-gray-200">
                                <div className="relative">
                                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                  <input
                                    type="text"
                                    placeholder="Search IT staff..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                    autoFocus
                                  />
                                </div>
                              </div>
                              <div className="py-1">
                                <button
                                  onClick={() => handleAssigneeChange('')}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100"
                                >
                                  Unassigned
                                </button>
                                {filteredUsers.map((user) => (
                                  <button
                                    key={user.id}
                                    onClick={() => handleAssigneeChange(user.id.toString())}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100"
                                  >
                                    <div className="font-medium">{user.full_name}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                  </button>
                                ))}
                                {filteredUsers.length === 0 && searchTerm && (
                                  <div className="px-3 py-2 text-sm text-gray-500">
                                    No users found
                                  </div>
                                )}
                                {filteredUsers.length === 0 && !searchTerm && (
                                  <div className="px-3 py-2 text-sm text-gray-500">
                                    No IT users available
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{currentTicket.description}</p>
                  </div>
                  
                  {/* Ticket Details */}
                  <div className="bg-gray-50 p-4 rounded-md space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Ticket Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Created by:</span>
                        <p className="text-gray-900">{currentTicket.created_by_name || 'Unknown'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Created on:</span>
                        <p className="text-gray-900">
                          {new Date(currentTicket.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {currentTicket.reviewed_by_name && (
                        <div>
                          <span className="font-medium text-gray-700">Reviewed by:</span>
                          <p className="text-gray-900">{currentTicket.reviewed_by_name}</p>
                        </div>
                      )}
                      {currentTicket.reviewed_at && (
                        <div>
                          <span className="font-medium text-gray-700">Reviewed on:</span>
                          <p className="text-gray-900">
                            {new Date(currentTicket.reviewed_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                      {currentTicket.assigned_to_name && (
                        <div>
                          <span className="font-medium text-gray-700">Assigned to:</span>
                          <p className="text-gray-900">{currentTicket.assigned_to_name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Comments Section */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Comments ({comments.length})</h4>
                    
                    {loadingComments ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
                      </div>
                    ) : comments.length > 0 ? (
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="h-5 w-5 rounded-full bg-sky-100 flex items-center justify-center">
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
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No comments yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {modalType === 'comment' && currentTicket && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                                          <h4 className="font-medium text-gray-900 mb-2">Ticket #{currentTicket.id}</h4>
                      <p className="text-sm text-gray-600">{currentTicket.issue_type}</p>
                  </div>
                  
                  {/* Comments Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Comments ({comments.length})</h4>
                    
                    {loadingComments ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
                      </div>
                    ) : comments.length > 0 ? (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
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
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No comments yet</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Add Comment Form */}
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Comment</label>
                    <textarea 
                      rows={4}
                      value={commentText}
                      onChange={handleCommentChange}
                      disabled={isSubmitting}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                      placeholder="Add your comment or additional information..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleCommentSubmit}
                      disabled={!commentText.trim() || isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSubmitting && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {isSubmitting ? 'Adding...' : 'Add Comment'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

    export default Modal;