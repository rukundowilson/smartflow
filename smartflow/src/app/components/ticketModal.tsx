"use client";

import React, { useState } from 'react';
import { 
  X,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import { createTicket } from '../services/ticketService';

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
  selectedTicket : any
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
}) => {
        const currentUser = user?.id;
        const [newTicket, setNewTicket] = useState<NewTicket>({
          issue_type: 'Hardware Problem',
          priority: 'Medium',
          description: "",
        });
        const [commentText, setCommentText] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);
      
        if (!isModalOpen) return null;
      
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
              closeModal();
              // Reset form
              setNewTicket({
                issue_type: 'Hardware Problem',
                priority: 'Medium',
                description: '',
              });
            } catch (err) {
              console.error(err);
            } finally {
              setIsSubmitting(false);
            }
          }
        };
      
        const handleCommentSubmit = async () => {
          if (commentText.trim()) {
            setIsSubmitting(true);
            try {
              // Add your comment submission logic here
              console.log("Comment submitted:", commentText);
              closeModal();
              setCommentText('');
            } catch (err) {
              console.error(err);
            } finally {
              setIsSubmitting(false);
            }
          }
        };
      
        const handleBackdropClick = (e: React.MouseEvent) => {
          if (e.target === e.currentTarget) {
            closeModal();
          }
        };

      return (
        <div 
          className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {modalType === 'new' && 'Report New Issue'}
                {modalType === 'view' && `Ticket Details - ${selectedTicket?.id}`}
                {modalType === 'comment' && `Add Comment - ${selectedTicket?.id}`}
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

              {modalType === 'view' && selectedTicket && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Priority</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                          {selectedTicket.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-5 rounded-full bg-gray-300"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Status</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTicket.status)}`}>
                          {selectedTicket.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Created</p>
                        <p className="text-sm text-gray-600">{selectedTicket.created_at}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Assigned To</p>
                        <p className="text-sm text-gray-600">{selectedTicket.assigned_to || "any"}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{selectedTicket.description}</p>
                  </div>
                </div>
              )}

              {modalType === 'comment' && selectedTicket && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium text-gray-900 mb-2">{selectedTicket.title}</h4>
                    <p className="text-sm text-gray-600">Ticket ID: {selectedTicket.id}</p>
                  </div>
                  <div>
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
                      Cancel
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