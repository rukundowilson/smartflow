"use client"
import React, { useState } from 'react';
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
  UserMinus
} from 'lucide-react';
import NavBar from "../components/navbar"
import SideBar from "../components/sidebar"

export default function OverView(){

      // Sample data for IT Staff view
      const myTickets = [
        { id: 'T001', title: 'Computer won\'t start', employee: 'John Smith', priority: 'High', status: 'Assigned to Me', created: '2025-07-19', assignedTo: 'me' },
        { id: 'T002', title: 'Email sync issues', employee: 'Sarah Johnson', priority: 'Medium', status: 'In Progress', created: '2025-07-18', assignedTo: 'me' },
        { id: 'T005', title: 'VPN connection problems', employee: 'Alex Brown', priority: 'High', status: 'Open', created: '2025-07-20', assignedTo: null },
        { id: 'T006', title: 'Printer not responding', employee: 'Lisa White', priority: 'Low', status: 'Open', created: '2025-07-19', assignedTo: null },
      ];
    
      const accessRequests = [
        { id: 'AR001', employee: 'Alice Brown', requestedBy: 'HR Team', systems: ['CRM', 'Payroll'], status: 'Pending IT Approval', created: '2025-07-19', urgency: 'Standard' },
        { id: 'AR003', employee: 'Chris Wilson', requestedBy: 'Sales Manager', systems: ['Sales Dashboard'], status: 'Pending IT Approval', created: '2025-07-20', urgency: 'High' },
        { id: 'AR004', employee: 'Maria Garcia', requestedBy: 'Finance', systems: ['Accounting System'], status: 'Approved', created: '2025-07-18', urgency: 'Standard' },
      ];
    
      const itemRequests = [
        { id: 'IR001', employee: 'David Lee', item: 'MacBook Pro 16"', quantity: 1, status: 'IT Approved', created: '2025-07-19', location: 'Building A, Floor 3' },
        { id: 'IR002', employee: 'Emma White', item: 'USB-C Cables', quantity: 3, status: 'Pending IT Review', created: '2025-07-18', location: 'Building B, Floor 1' },
        { id: 'IR003', employee: 'Tom Johnson', item: 'External Monitor', quantity: 2, status: 'Ready for Delivery', created: '2025-07-17', location: 'Building A, Floor 2' },
      ];
    
      const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
          case 'open':
          case 'pending it approval':
          case 'pending it review': return 'text-orange-600 bg-orange-50';
          case 'assigned to me':
          case 'in progress': return 'text-blue-600 bg-blue-50';
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
          case 'high': return 'text-red-600 bg-red-50';
          case 'medium': return 'text-yellow-600 bg-yellow-50';
          case 'low': return 'text-green-600 bg-green-50';
          default: return 'text-gray-600 bg-gray-50';
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
    
      interface ActionButtonProps {
        icon: React.ElementType;
        label: string;
        onClick?: React.MouseEventHandler<HTMLButtonElement>;
        variant?: 'primary' | 'secondary' | 'danger' | 'success';
      }
    
      const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, onClick, variant = 'primary' }) => {
        const baseClasses = "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
        const variants = {
          primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
          secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-sky-500",
          danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
          success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
        };
        
        return (
          <button onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </button>
        );
      };
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
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 text-center">
                <UserMinus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Access Revocation</h3>
                <p className="text-gray-500">Manage access revocation requests and security compliance.</p>
              </div>
            
          </main>
        </div>
      </div>
    </div>
        </>
    )
}