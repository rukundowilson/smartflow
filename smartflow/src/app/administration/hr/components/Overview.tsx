"use client"
import React from 'react';
import { UserPlus, Key, Users, UserMinus } from 'lucide-react';
import StatCard from './StatCard';

const Overview: React.FC = () => {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pending Registrations" value="2" icon={UserPlus} color="text-orange-600" subtitle="Expire in <24h" />
        <StatCard title="Access Requests" value="3" icon={Key} color="text-blue-600" subtitle="Awaiting approval" />
        <StatCard title="Active Employees" value="248" icon={Users} color="text-green-600" subtitle="System users" />
        <StatCard title="Revocation Requests" value="2" icon={UserMinus} color="text-red-600" subtitle="Security priority" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Urgent Employee Registrations</h3>
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">Time Sensitive</span>
          </div>
          <div className="divide-y divide-gray-100">
            {employeeRegistrations.filter(reg => reg.status === 'Pending').slice(0, 3).map(registration => (
              <div key={registration.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{registration.name}</p>
                    <p className="text-xs text-gray-500">{registration.position} • {registration.department}</p>
                    <p className="text-xs text-gray-500 mt-1">{registration.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getUrgencyColor(registration.expiresIn)}`}>
                      {registration.expiresIn}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">Applied {registration.applied}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Recent HR Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                <span className="text-gray-600">Employee registration approved</span>
                <span className="text-gray-400 ml-auto">5 min ago</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span className="text-gray-600">Access request submitted to IT</span>
                <span className="text-gray-400 ml-auto">20 min ago</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                <span className="text-gray-600">Access revocation initiated</span>
                <span className="text-gray-400 ml-auto">1 hour ago</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                <span className="text-gray-600">New registration application received</span>
                <span className="text-gray-400 ml-auto">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 