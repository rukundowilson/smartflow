"use client"
import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Eye,
  MessageSquare,
  X,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import { createTicket } from '@/app/services/ticketService';
import { useAuth } from '@/app/contexts/auth-context';
import Modal from '@/app/components/ticketModal';

// Type definitions
interface Ticket {
  id: string;
  title: string;
  priority: string;
  status: string;
  created: string;
  assignedTo: string;
  description: string;
}

interface NewTicket {
  issue_type: string;
  priority: string;
  description: string;
}

export default function MyTickets(){
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalType, setModalType] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const {user} = useAuth();
    const currentUser = user
    const [newTicket, setNewTicket] = useState<NewTicket>({
      issue_type: 'Hardware Problem',
      priority: 'Medium',
      description: "",
    });
    // Sample data for employee view
    const myTickets: Ticket[] = [
      { id: 'T001', title: 'Computer won\'t start', priority: 'High', status: 'In Progress', created: '2025-07-19', assignedTo: 'Mike Davis', description: 'My computer is not turning on when I press the power button. I\'ve checked the power cable and it seems to be connected properly.' },
      { id: 'T005', title: 'Printer connection issues', priority: 'Medium', status: 'Open', created: '2025-07-18', assignedTo: 'Unassigned', description: 'Unable to connect to the office printer. It shows as offline in the print dialog.' },
      { id: 'T008', title: 'Software license expired', priority: 'Low', status: 'Resolved', created: '2025-07-15', assignedTo: 'Sarah Tech', description: 'Microsoft Office license has expired and I cannot access Word and Excel.' },
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
  
    const getPriorityColor = (priority: string): string => {
      switch (priority.toLowerCase()) {
        case 'high': return 'text-red-600 bg-red-50';
        case 'medium': return 'text-yellow-600 bg-yellow-50';
        case 'low': return 'text-green-600 bg-green-50';
        default: return 'text-gray-600 bg-gray-50';
      }
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

    const handleOnChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setNewTicket((prev) => ({
        ...prev,
        [name]: value,
      }));
    };




    const handleNewTicketSubmit = async() => {
      // Handle form submission here
      if (newTicket.description.trim()) {
        try {
            const result = await createTicket(newTicket,currentUser?.id);
            console.log("Ticket created:", result);
          } catch (err) {
            console.error(err);
          }
        closeModal();
        // Reset form
        setNewTicket({
          issue_type: 'Hardware Problem',
          priority: 'Medium',
          description: '',
        });
      }
    };

        return(
            <main className="flex-1 min-w-0">
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">My IT Tickets</h2>
                    <ActionButton 
                        icon={Plus} 
                        label="Report New Issue" 
                        onClick={() => openModal('new')}
                        className="w-full sm:w-auto"
                    />
                    </div>

                    {/* Mobile Cards View */}
                    <div className="block lg:hidden space-y-4">
                    {myTickets.map(ticket => (
                        <div key={ticket.id} className="bg-white shadow-sm rounded-lg border border-gray-100 p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                            <h3 className="font-medium text-gray-900">{ticket.id}</h3>
                            <p className="text-sm text-gray-600 mt-1">{ticket.title}</p>
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
                            <p>Assigned to: {ticket.assignedTo}</p>
                            <p>Created: {ticket.created}</p>
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
                            {myTickets.map(ticket => (
                            <tr key={ticket.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.id}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{ticket.title}</td>
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
                                <td className="px-6 py-4 text-sm text-gray-900">{ticket.assignedTo}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{ticket.created}</td>
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
                </div>
                <Modal
                isModalOpen ={isModalOpen}
                user = {user}
                closeModal = {closeModal}
                modalType = {modalType}
                selectedTicket = {selectedTicket}
                
                />
            </main>

    )
}