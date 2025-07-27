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

export default function MyRequests(){
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
                    <main className="flex-1">
                        <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Equipment Requests</h2>
        <ActionButton icon={Plus} label="Request Equipment" />
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Delivery</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myRequests.map(request => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{request.item}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{request.quantity}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{request.estimatedDelivery}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{request.created}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sky-600 hover:text-sky-900" title="View Details">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Request New Equipment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Equipment Categories */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-sky-300 transition-colors cursor-pointer">
            <div className="text-center">
              <Laptop className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Computers</h4>
              <p className="text-sm text-gray-500">Laptops, Desktops, Tablets</p>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:border-sky-300 transition-colors cursor-pointer">
            <div className="text-center">
              <Printer className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Peripherals</h4>
              <p className="text-sm text-gray-500">Monitors, Keyboards, Mice</p>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:border-sky-300 transition-colors cursor-pointer">
            <div className="text-center">
              <Cable className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Accessories</h4>
              <p className="text-sm text-gray-500">Cables, Adapters, Stands</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Category</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500">
              <option>Select category...</option>
              <option>Laptop</option>
              <option>Desktop Computer</option>
              <option>Monitor</option>
              <option>Keyboard & Mouse</option>
              <option>Cables & Adapters</option>
              <option>Software License</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input 
              type="number" 
              min="1" 
              max="10" 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500"
              defaultValue="1"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Justification</label>
          <textarea 
            rows={3} 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500"
            placeholder="Please explain why you need this equipment..."
          ></textarea>
        </div>
        <ActionButton icon={Plus} label="Submit Request" />
      </div>
    </div>
                        
                    </main>
                </div>
            </div>
        </div>
    )
}