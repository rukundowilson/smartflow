"use client"
import React, { useState } from 'react';
import { Search, Filter, Eye, Key, UserMinus } from 'lucide-react';
import ActionButton from './ActionButton';
import StatusBadge from './StatusBadge';

const EmployeeDirectory: React.FC = () => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Sample data
  const employees = [
    { id: 'E001', name: 'John Smith', email: 'john.smith@company.com', department: 'Sales', position: 'Sales Manager', status: 'Active', startDate: '2023-03-15', systemAccess: 'CRM, Sales Portal' },
    { id: 'E002', name: 'Lisa Wang', email: 'lisa.wang@company.com', department: 'Finance', position: 'Senior Analyst', status: 'Active', startDate: '2022-08-20', systemAccess: 'Payroll, Finance Dashboard' },
    { id: 'E003', name: 'Tom Wilson', email: 'tom.wilson@company.com', department: 'HR', position: 'HR Specialist', status: 'Active', startDate: '2024-01-10', systemAccess: 'HR Management' },
  ];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(employees.map(emp => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, id]);
    } else {
      setSelectedEmployees(selectedEmployees.filter(empId => empId !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Directory</h2>
          <p className="text-sm text-gray-500 mt-1">View and manage employee information and system access</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <ActionButton icon={Filter} label="Filter" variant="secondary" />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={selectedEmployees.length === employees.length}
                  />
                </th>
                {['Name', 'Email', 'Department', 'Position', 'Start Date', 'System Access', 'Status'].map((col, idx) => (
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
              {employees.map(employee => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={(e) => handleSelectEmployee(employee.id, e.target.checked)}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{employee.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{employee.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{employee.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{employee.position}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{employee.startDate}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{employee.systemAccess}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={employee.status} />
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="text-sky-600 hover:text-sky-900 p-1" title="Request Access">
                      <Key className="h-4 w-4" />
                    </button>
                    <button className="text-orange-600 hover:text-orange-900 p-1" title="Revoke Access">
                      <UserMinus className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 p-1" title="View Details">
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
  );
};

export default EmployeeDirectory; 