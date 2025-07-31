"use client"
import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'submitted': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'in progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(status)} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge; 