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

export default function OverView(){
    // Sample data for employee view
  const myTickets = [
    { id: 'T001', title: 'Computer won\'t start', priority: 'High', status: 'In Progress', created: '2025-07-19', assignedTo: 'Mike Davis' },
    { id: 'T005', title: 'Printer connection issues', priority: 'Medium', status: 'Open', created: '2025-07-18', assignedTo: 'Unassigned' },
    { id: 'T008', title: 'Software license expired', priority: 'Low', status: 'Resolved', created: '2025-07-15', assignedTo: 'Sarah Tech' },
  ];

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
   interface StatCardProps {
      title: string;
      value: string | number;
      icon: React.ElementType;
      color?: string;
      subtitle?: string;
    }
  
    const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color = 'text-blue-600', subtitle }) => (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </div>
    );
  
  
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-6 border border-sky-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome back, John!</h2>
        <p className="text-gray-600">Here's what's happening with your IT requests and tickets.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Tickets" value="2" icon={Ticket} color="text-orange-600" subtitle="1 high priority" />
        <StatCard title="Pending Requests" value="1" icon={Package} color="text-yellow-600" subtitle="USB-C Hub" />
        <StatCard title="Resolved This Month" value="5" icon={CheckCircle} color="text-green-600" subtitle="Great progress!" />
        <StatCard title="Items Delivered" value="3" icon={Laptop} color="text-blue-600" subtitle="This quarter" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900">Report IT Issue</h4>
                <p className="text-sm text-gray-500">Get help with technical problems</p>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900">Request IT Equipment</h4>
                <p className="text-sm text-gray-500">Order laptops, accessories, software</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Recent Tickets</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {myTickets.slice(0, 3).map(ticket => (
              <div key={ticket.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ticket.title}</p>
                    <p className="text-xs text-gray-500 mt-1">Assigned to: {ticket.assignedTo}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-gray-100">
            <button className="text-sky-600 hover:text-sky-700 text-sm font-medium">View all tickets →</button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Recent Requests</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {myRequests.slice(0, 3).map(request => (
              <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.item}</p>
                    <p className="text-xs text-gray-500 mt-1">Est. delivery: {request.estimatedDelivery}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-gray-100">
            <button className="text-sky-600 hover:text-sky-700 text-sm font-medium">View all requests →</button>
          </div>
        </div>
      </div>
    </div>
                        
                    </main>
                </div>
            </div>
        </div>
    )
}