"use client"
import React, { useState } from 'react';
import { 
  Ticket, 
  Package, 
  Plus, 
  Search, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Monitor,
  Bell,
  LogOut,
  User,
  Calendar,
  MessageSquare,
  Laptop,
  Printer,
  Cable
} from 'lucide-react';
import NavBar from "../components/navbar";
import SideBar from "../components/sidebar";

export default function MyTickets(){
    // Sample data for employee view
      const myTickets = [
        { id: 'T001', title: 'Computer won\'t start', priority: 'High', status: 'In Progress', created: '2025-07-19', assignedTo: 'Mike Davis' },
        { id: 'T005', title: 'Printer connection issues', priority: 'Medium', status: 'Open', created: '2025-07-18', assignedTo: 'Unassigned' },
        { id: 'T008', title: 'Software license expired', priority: 'Low', status: 'Resolved', created: '2025-07-15', assignedTo: 'Sarah Tech' },
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
                    <main className="flex-1">
                         <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My IT Tickets</h2>
        <ActionButton icon={Plus} label="Report New Issue" />
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-100">
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
                    <button className="text-sky-600 hover:text-sky-900" title="View Details">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900" title="Add Comment">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Ticket Form Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Report Issue</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500">
              <option>Hardware Problem</option>
              <option>Software Issue</option>
              <option>Network/Internet</option>
              <option>Email Problem</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea 
            rows={3} 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500"
            placeholder="Please describe your issue in detail..."
          ></textarea>
        </div>
        <ActionButton icon={Plus} label="Submit Ticket" />
      </div>
    </div>
                        
                    </main>
                </div>
            </div>
        </div>
    )
}