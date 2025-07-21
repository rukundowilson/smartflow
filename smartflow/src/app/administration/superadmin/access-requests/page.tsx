"use client"
import React, { useState } from 'react';
import { 
  Plus, 
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import NavBar from "../components/nav";
import SideBar from "../components/sidebar";


interface ActionButtonProps {
    icon: React.ElementType;
    label: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    variant?: 'primary' | 'secondary' | 'danger';
  }

  const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, onClick, variant = 'primary' }) => {
    const baseClasses = "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = {
      primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
      secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-sky-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
    };
    
    return (
      <button onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
        <Icon className="h-4 w-4 mr-2" />
        {label}
      </button>
    );
  };

  interface TableHeaderProps {
      columns: string[];
      onSelectAll?: React.ChangeEventHandler<HTMLInputElement>;
      selectedCount: number;
      totalCount: number;
    }

    const TableHeader: React.FC<TableHeaderProps> = ({ columns, onSelectAll, selectedCount, totalCount }) => (
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left">
            <input 
              type="checkbox" 
              onChange={onSelectAll}
              checked={selectedCount === totalCount}
              className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
            />
          </th>
          {columns.map((col, idx) => (
            <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {col}
            </th>
          ))}
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
    );

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
  


export default function AccessManagement(){
    const accessRequests = [
    { id: 'AR001', employee: 'Alice Brown', requestedBy: 'HR Team', systems: ['CRM', 'Payroll'], status: 'Pending', created: '2025-07-19' },
    { id: 'AR002', employee: 'Bob Wilson', requestedBy: 'IT Manager', systems: ['Admin Panel'], status: 'Approved', created: '2025-07-18' },
  ];
    return(
        <>
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
                    <h2 className="text-2xl font-bold text-gray-900">Access Requests</h2>
                    <ActionButton icon={Plus} label="New Request" />
                </div>

                <div className="bg-white shadow-sm rounded-lg border border-gray-100">
                    <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <TableHeader 
                        columns={['Request ID', 'Employee', 'Requested By', 'Systems', 'Status', 'Created']}
                        selectedCount={0}
                        totalCount={accessRequests.length}
                        />
                        <tbody className="bg-white divide-y divide-gray-200">
                        {accessRequests.map(request => (
                            <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                                />
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.id}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{request.employee}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{request.requestedBy}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{request.systems.join(', ')}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                                {request.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{request.created}</td>
                            <td className="px-6 py-4 text-right space-x-2">
                                {request.status === 'Pending' && (
                                <>
                                    <button className="text-green-600 hover:text-green-900">
                                    <CheckCircle className="h-4 w-4" />
                                    </button>
                                    <button className="text-red-600 hover:text-red-900">
                                    <XCircle className="h-4 w-4" />
                                    </button>
                                </>
                                )}
                                <button className="text-sky-600 hover:text-sky-900">
                                <Eye className="h-4 w-4" />
                                </button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
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