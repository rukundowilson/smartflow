"use client"
import React, { useState } from 'react';
import { 
  Plus, 
  Eye,
  Laptop,
  Printer,
  Cable
} from 'lucide-react';
import NavBar from "../components/navbar";
import SideBar from "../components/sidebar";
import ItemRequestModal from '@/app/components/itemRequestModal';
import Requisition from '@/app/components/allMyRe';

export default function MyRequests(){
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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
      interface ActionButtonProps {
        icon: React.ElementType;
        label: string;
        onClick?: React.MouseEventHandler<HTMLButtonElement>;
        variant?: 'primary' | 'secondary';
      }
    
      const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, onClick, variant = 'primary' }) => {
        const baseClasses = "inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
        const variants = {
          primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
          secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-sky-500"
        };
        
        return (
          <button onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </button>
        );
      };
    
    return(
        <div className="min-h-screen bg-[#F0F8F8]">
            <NavBar/>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex">
                    {/* Sidebar */}
                    <SideBar/>                    
                    {/* Main Content */}
                    <Requisition/>
                </div>
            </div>
            <ItemRequestModal
            isModalOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Request New Equipment"
            />
          </div>
 )}