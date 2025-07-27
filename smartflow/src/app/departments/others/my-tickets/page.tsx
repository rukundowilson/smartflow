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
import NavBar from '../components/navbar';
import SideBar from '../components/sidebar';
import { createTicket } from '@/app/services/ticketService';
import { useAuth } from '@/app/contexts/auth-context';
import Modal from '@/app/components/ticketModal';
import MyTickets from '@/app/components/my_tickets';

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

export default function MyTicketsPage(){
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
        <div className="min-h-screen bg-[#F0F8F8]">
            <NavBar/>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                <div className="flex flex-col lg:flex-row">
                    {/* Sidebar */}
                    <SideBar/>                    
                    <MyTickets/>                    
                </div>
            </div>
            
        </div>
    )
}