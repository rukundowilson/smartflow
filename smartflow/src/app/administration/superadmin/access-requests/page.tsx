"use client"
import React, { useState } from 'react';
import { 
  Plus, 
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  X
} from 'lucide-react';
import NavBar from "../components/nav";
import SideBar from "../components/sidebar";

interface ActionButtonProps {
    icon: React.ElementType;
    label: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    variant?: 'primary' | 'secondary' | 'danger';
    className?: string;
  }

const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, onClick, variant = 'primary', className = '' }) => {
  const baseClasses = "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-sky-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };
  
  return (
    <button onClick={onClick} className={`${baseClasses} ${variants[variant]} ${className}`}>
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
      <th className="px-3 sm:px-6 py-3 text-left">
        <input 
          type="checkbox" 
          onChange={onSelectAll}
          checked={selectedCount === totalCount}
          className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
        />
      </th>
      {columns.map((col, idx) => (
        <th key={idx} className={`px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
          idx > 2 ? 'hidden lg:table-cell' : ''
        }`}>
          {col}
        </th>
      ))}
      <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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

interface MobileCardProps {
  request: {
    id: string;
    employee: string;
    requestedBy: string;
    systems: string[];
    status: string;
    created: string;
  };
}

const MobileCard: React.FC<MobileCardProps> = ({ request }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-medium text-gray-900">{request.id}</h3>
        <p className="text-sm text-gray-600">{request.employee}</p>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
          {request.status}
        </span>
        <button className="p-1">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
    
    <div className="space-y-2 text-sm">
      <div>
        <span className="text-gray-500">Requested by:</span>
        <span className="ml-2 text-gray-900">{request.requestedBy}</span>
      </div>
      <div>
        <span className="text-gray-500">Systems:</span>
        <span className="ml-2 text-gray-900">{request.systems.join(', ')}</span>
      </div>
      <div>
        <span className="text-gray-500">Created:</span>
        <span className="ml-2 text-gray-900">{request.created}</span>
      </div>
    </div>
    
    <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
      {request.status === 'Pending' && (
        <>
          <button className="p-2 text-green-600 hover:bg-green-50 rounded-md">
            <CheckCircle className="h-4 w-4" />
          </button>
          <button className="p-2 text-red-600 hover:bg-red-50 rounded-md">
            <XCircle className="h-4 w-4" />
          </button>
        </>
      )}
      <button className="p-2 text-sky-600 hover:bg-sky-50 rounded-md">
        <Eye className="h-4 w-4" />
      </button>
    </div>
  </div>
);

export default function AccessManagement(){
  const [showDropdownForm, setShowDropdownForm] = useState(false);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const toggleDropdownForm = () => setShowDropdownForm(prev => !prev);
  const toggleMobileForm = () => setShowMobileForm(prev => !prev);

  const accessRequests = [
    { id: 'AR001', employee: 'Alice Brown', requestedBy: 'HR Team', systems: ['CRM', 'Payroll'], status: 'Pending', created: '2025-07-19' },
    { id: 'AR002', employee: 'Bob Wilson', requestedBy: 'IT Manager', systems: ['Admin Panel'], status: 'Approved', created: '2025-07-18' },
    { id: 'AR003', employee: 'Carol Davis', requestedBy: 'Operations', systems: ['Inventory', 'Reports'], status: 'Pending', created: '2025-07-17' },
  ];

  return(
    <>
      <div className="min-h-screen bg-[#F0F8F8]"> 
        <NavBar/>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="flex flex-col lg:flex-row lg:space-x-6">
            {/* Sidebar - hidden on mobile, shown on desktop */}
            <div className="hidden lg:block">
              <SideBar/>
            </div>
            
            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Access Requests</h2>
                  
                  {/* Desktop New Request Button */}
                  <div className="relative hidden sm:block">
                    <ActionButton icon={Plus} label="New Request" onClick={toggleDropdownForm} />
                    {showDropdownForm && (
                      <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <form className="p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">New Access Request</h3>
                            <button 
                              type="button" 
                              onClick={() => setShowDropdownForm(false)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Employee Name</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Requested By</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Systems</label>
                            <input
                              type="text"
                              placeholder="e.g. CRM, Payroll"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setShowDropdownForm(false)}
                              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 text-sm bg-sky-600 text-white rounded hover:bg-sky-700"
                            >
                              Submit
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                  
                  {/* Mobile New Request Button */}
                  <div className="sm:hidden">
                    <ActionButton 
                      icon={Plus} 
                      label="New Request" 
                      onClick={toggleMobileForm}
                      className="w-full justify-center"
                    />
                  </div>
                </div>

                {/* Mobile Form Modal */}
                {showMobileForm && (
                  <div className="fixed inset-0 bg-white/70 bg-opacity-40 z-50 sm:hidden flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                      <form className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-gray-900">New Access Request</h3>
                          <button 
                            type="button" 
                            onClick={toggleMobileForm}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Systems</label>
                          <input
                            type="text"
                            placeholder="e.g. CRM, Payroll"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                          />
                        </div>

                        <div className="flex space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={toggleMobileForm}
                            className="flex-1 px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2 text-sm bg-sky-600 text-white rounded hover:bg-sky-700"
                          >
                            Submit
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3">
                  {accessRequests.map(request => (
                    <MobileCard key={request.id} request={request} />
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block bg-white shadow-sm rounded-lg border border-gray-100">
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
                            <td className="px-3 sm:px-6 py-4">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                              />
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900">{request.id}</td>
                            <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">{request.employee}</td>
                            <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">{request.requestedBy}</td>
                            <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 hidden lg:table-cell">{request.systems.join(', ')}</td>
                            <td className="px-3 sm:px-6 py-4 hidden lg:table-cell">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                                {request.status}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">{request.created}</td>
                            <td className="px-3 sm:px-6 py-4 text-right">
                              <div className="flex justify-end space-x-1 sm:space-x-2">
                                {request.status === 'Pending' && (
                                  <>
                                    <button className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded">
                                      <CheckCircle className="h-4 w-4" />
                                    </button>
                                    <button className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded">
                                      <XCircle className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                                <button className="p-1 text-sky-600 hover:text-sky-900 hover:bg-sky-50 rounded">
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
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