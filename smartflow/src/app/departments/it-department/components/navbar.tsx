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
export default function NavBar(){
    return(
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
                  <p className="text-sm font-medium text-gray-900">IT Staff</p>
                  <p className="text-xs text-gray-500">itstaff@company.com</p>
                </div>
                <div className="h-8 w-8 bg-sky-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">IT</span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
    )
}