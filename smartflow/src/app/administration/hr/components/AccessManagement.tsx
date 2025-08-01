"use client"
import React from 'react';
import { Key } from 'lucide-react';
import ActionButton from './ActionButton';
import StatusBadge from './StatusBadge';

const AccessManagement: React.FC = () => {
  // Sample data
  const accessRequests = [
    { id: 'AR001', employee: 'John Smith', department: 'Sales', requestedSystems: ['CRM', 'Sales Portal'], reason: 'New hire onboarding', status: 'Pending', created: '2025-07-19' },
    { id: 'AR002', employee: 'Lisa Wang', department: 'Finance', requestedSystems: ['Payroll System', 'Finance Dashboard'], reason: 'Role promotion', status: 'Submitted', created: '2025-07-18' },
    { id: 'AR003', employee: 'Tom Wilson', department: 'HR', requestedSystems: ['HR Management'], reason: 'Department transfer', status: 'Approved', created: '2025-07-17' },
  ];

  const revocationRequests = [
    { id: 'RV001', employee: 'Sarah Mitchell', department: 'Marketing', reason: 'Termination', lastWorkingDay: '2025-07-25', systems: ['All Systems'], status: 'Pending', created: '2025-07-19' },
    { id: 'RV002', employee: 'David Kumar', department: 'IT', reason: 'Role Change', lastWorkingDay: 'N/A', systems: ['Admin Panel', 'Server Access'], status: 'In Progress', created: '2025-07-18' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Access Management</h2>
          <p className="text-sm text-gray-500 mt-1">Request and track system access for employees</p>
        </div>
        <ActionButton icon={Key} label="Request Access" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access Requests */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Active Access Requests</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {accessRequests.map(request => (
              <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.employee}</p>
                    <p className="text-xs text-gray-500">{request.department} • {request.reason}</p>
                    <p className="text-xs text-blue-600 mt-1">{request.requestedSystems.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={request.status} />
                    <p className="text-xs text-gray-400 mt-1">{request.created}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revocation Requests */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Access Revocation Requests</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {revocationRequests.map(request => (
              <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.employee}</p>
                    <p className="text-xs text-gray-500">{request.department} • {request.reason}</p>
                    <p className="text-xs text-red-600 mt-1">Last Day: {request.lastWorkingDay}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={request.status} />
                    <p className="text-xs text-gray-400 mt-1">{request.created}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessManagement; 