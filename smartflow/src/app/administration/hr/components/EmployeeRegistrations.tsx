"use client"
import React, { useState } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import ActionButton from './ActionButton';
import StatusBadge from './StatusBadge';

const EmployeeRegistrations: React.FC = () => {
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  // Sample data
  const employeeRegistrations = [
    { id: 'ER001', name: 'Alice Johnson', email: 'alice.johnson@personal.com', department: 'Marketing', position: 'Marketing Specialist', status: 'Pending', applied: '2025-07-19', expiresIn: '18h' },
    { id: 'ER002', name: 'Robert Chen', email: 'robert.chen@gmail.com', department: 'Finance', position: 'Financial Analyst', status: 'Pending', applied: '2025-07-18', expiresIn: '42h' },
    { id: 'ER003', name: 'Maria Rodriguez', email: 'maria.r@outlook.com', department: 'IT', position: 'Software Developer', status: 'Approved', applied: '2025-07-17', expiresIn: 'Processed' },
  ];

  const getUrgencyColor = (expiresIn: string): string => {
    if (expiresIn.includes('h')) {
      const hours = parseInt(expiresIn);
      if (hours < 24) return 'text-red-600 bg-red-50';
      if (hours < 48) return 'text-orange-600 bg-orange-50';
    }
    return 'text-green-600 bg-green-50';
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(employeeRegistrations.map(reg => reg.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRequests([...selectedRequests, id]);
    } else {
      setSelectedRequests(selectedRequests.filter(reqId => reqId !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Employee Registrations</h2>
          <p className="text-sm text-gray-500 mt-1">Review and approve new employee system access requests</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search registrations..."
              className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <ActionButton icon={Filter} label="Filter" variant="secondary" />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white shadow-sm rounded-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={selectedRequests.length === employeeRegistrations.length}
                  />
                </th>
                {['Registration ID', 'Name', 'Email', 'Department', 'Position', 'Status', 'Applied', 'Expires In'].map((col, idx) => (
                  <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employeeRegistrations.map(registration => (
                <tr key={registration.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                      checked={selectedRequests.includes(registration.id)}
                      onChange={(e) => handleSelectRequest(registration.id, e.target.checked)}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{registration.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{registration.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{registration.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{registration.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{registration.position}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={registration.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{registration.applied}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getUrgencyColor(registration.expiresIn)}`}>
                      {registration.expiresIn}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {registration.status === 'Pending' && (
                      <>
                        <button className="text-green-600 hover:text-green-900 p-1" title="Approve">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-1" title="Reject">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button className="text-sky-600 hover:text-sky-900 p-1" title="View Details">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {employeeRegistrations.map(registration => (
          <div key={registration.id} className="bg-white shadow-sm rounded-lg border border-gray-100 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  checked={selectedRequests.includes(registration.id)}
                  onChange={(e) => handleSelectRequest(registration.id, e.target.checked)}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">{registration.name}</h3>
                    <StatusBadge status={registration.status} />
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{registration.email}</p>
                  <p className="text-xs text-gray-500 mb-1">{registration.position} • {registration.department}</p>
                  <p className="text-xs text-gray-500 mb-2">ID: {registration.id}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Applied: {registration.applied}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getUrgencyColor(registration.expiresIn)}`}>
                      {registration.expiresIn}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Mobile Actions */}
              <div className="flex items-center space-x-2 ml-4">
                {registration.status === 'Pending' && (
                  <>
                    <button className="text-green-600 hover:text-green-900 p-1" title="Approve">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900 p-1" title="Reject">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </>
                )}
                <button className="text-sky-600 hover:text-sky-900 p-1" title="View Details">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeRegistrations; 