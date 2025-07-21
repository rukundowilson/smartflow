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
  Calendar
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
            <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="My Active Tickets" value="8" icon={Wrench} color="text-blue-600" action="2 high priority" />
        <StatCard title="Pending Approvals" value="12" icon={Clock} color="text-orange-600" action="Access & Items" />
        <StatCard title="Ready for Delivery" value="5" icon={Truck} color="text-purple-600" action="Items awaiting pickup" />
        <StatCard title="Resolved Today" value="3" icon={CheckCircle} color="text-green-600" action="Great work!" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">My Priority Tickets</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {myTickets.filter(t => t.priority === 'High' || t.assignedTo === 'me').slice(0, 4).map(ticket => (
              <div key={ticket.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ticket.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{ticket.employee}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                  <button className="text-sky-600 hover:text-sky-700 text-sm font-medium">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
                <Ticket className="h-6 w-6 text-sky-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">New Ticket</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
                <Key className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Grant Access</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
                <Package className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Approve Item</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
                <Truck className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Schedule Delivery</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">Today's Schedule</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Setup new employee workstation</p>
                  <p className="text-xs text-gray-600">Building A, Floor 3 - Alice Brown</p>
                </div>
              </div>
              <span className="text-xs text-blue-600 font-medium">10:00 AM</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Deliver MacBook Pro</p>
                  <p className="text-xs text-gray-600">Building A, Floor 3 - David Lee</p>
                </div>
              </div>
              <span className="text-xs text-purple-600 font-medium">2:00 PM</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Wrench className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fix printer issue</p>
                  <p className="text-xs text-gray-600">Building B, Floor 1 - Lisa White</p>
                </div>
              </div>
              <span className="text-xs text-green-600 font-medium">4:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
          </main>
        </div>
      </div>
    </div>
        </>
    )
}