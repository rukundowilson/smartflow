"use client"
import React, { useState } from 'react';
import { 
  Users, 
  Ticket, 
  Key, 
  UserMinus, 
  Package, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Monitor,
  Settings,
  Bell,
  LogOut
} from 'lucide-react';
import SideBar from '../components/sidebar';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color?: string;
}

const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'in progress': return 'text-blue-600 bg-blue-50';
      case 'resolved':
      case 'approved':
      case 'completed': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };


const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color = 'text-blue-600' }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );

export default function Overview (){
    // Sample data
  const tickets = [
        { id: 'T001', title: 'Computer won\'t start', employee: 'John Smith', priority: 'High', status: 'Open', created: '2025-07-19' },
        { id: 'T002', title: 'Email sync issues', employee: 'Sarah Johnson', priority: 'Medium', status: 'In Progress', created: '2025-07-18' },
        { id: 'T003', title: 'Software installation request', employee: 'Mike Davis', priority: 'Low', status: 'Resolved', created: '2025-07-17' },
    ];

    return(

        <div className="min-h-screen bg-[#F0F8F8]"> {/* Duck egg background */}
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-sky-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">smartflow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 bg-red-400 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Super Admin</p>
                  <p className="text-xs text-gray-500">admin@company.com</p>
                </div>
                <div className="h-8 w-8 bg-sky-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">SA</span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          <SideBar></SideBar>
          <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Open Tickets" value="12" icon={Ticket} color="text-red-600" />
            <StatCard title="Pending Access Requests" value="5" icon={Key} color="text-yellow-600" />
            <StatCard title="Active Users" value="248" icon={Users} color="text-green-600" />
            <StatCard title="Pending Item Requests" value="8" icon={Package} color="text-blue-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-900">Recent Tickets</h3>
            </div>
            <div className="divide-y divide-gray-100">
                {tickets.slice(0, 3).map(ticket => (
                <div key={ticket.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-gray-900">{ticket.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{ticket.employee}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                    </span>
                    </div>
                </div>
                ))}
            </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-900">System Activity</h3>
            </div>
            <div className="p-6">
                <div className="space-y-4">
                <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    <span className="text-gray-600">New user registration approved</span>
                    <span className="text-gray-400 ml-auto">2 min ago</span>
                </div>
                <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    <span className="text-gray-600">IT access granted to John Doe</span>
                    <span className="text-gray-400 ml-auto">15 min ago</span>
                </div>
                <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                    <span className="text-gray-600">High priority ticket created</span>
                    <span className="text-gray-400 ml-auto">1 hour ago</span>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
        </div>
      </div>
    </div>
    );
};