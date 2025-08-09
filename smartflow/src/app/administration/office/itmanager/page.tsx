"use client"
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  AlertCircle,
  Search,
  RefreshCw
} from 'lucide-react';
import systemAccessRequestService, { SystemAccessRequest } from '../../../services/systemAccessRequestService';
import ITManagerLayout from './components/ITManagerLayout';
import { useAuth } from '@/app/contexts/auth-context';
import Link from 'next/link';

interface DashboardStats {
  pending: number;
  assigned: number;
  approved: number;
  rejected: number;
}

interface StatusConfig {
  [key: string]: {
    label: string;
    color: string;
    bgColor: string;
    icon: React.ComponentType<{ className?: string }>;
  };
}

const STATUS_CONFIG: StatusConfig = {
  'it_manager_pending': {
    label: 'Pending Review',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: Clock
  },
  'it_support_review': {
    label: 'IT Support Review',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    icon: User
  },
  'granted': {
    label: 'Granted',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: CheckCircle
  },
  'rejected': {
    label: 'Rejected',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: XCircle
  }
};

const STAT_CONFIGS = [
  { key: 'pending', label: 'Pending Review', status: 'it_manager_pending', icon: Clock, accent: 'text-blue-600', accentBg: 'bg-blue-100', caption: 'Awaiting your action' },
  { key: 'assigned', label: 'Assigned to IT', status: 'it_support_review', icon: User, accent: 'text-indigo-600', accentBg: 'bg-indigo-100', caption: 'In IT support queue' },
  { key: 'approved', label: 'Granted', status: 'granted', icon: CheckCircle, accent: 'text-green-600', accentBg: 'bg-green-100', caption: 'Access granted' },
  { key: 'rejected', label: 'Rejected', status: 'rejected', icon: XCircle, accent: 'text-red-600', accentBg: 'bg-red-100', caption: 'Declined requests' }
];

export default function ITManagerDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SystemAccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Safely extract first name without hardcoding fallback
  const getFirstName = (fullName: string | undefined | null): string => {
    if (!fullName || typeof fullName !== 'string') return 'User';
    const trimmedName = fullName.trim();
    if (!trimmedName) return 'User';
    return trimmedName.split(' ')[0] || 'User';
  };

  const firstName = getFirstName(user?.full_name);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) {
      setError('User information not available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const [pendingResponse, actedResponse] = await Promise.all([
        systemAccessRequestService.getPending({ 
          approver_id: user.id, 
          approver_role: 'IT Manager' 
        }),
        systemAccessRequestService.getApprovedBy({ 
          approver_id: user.id, 
          approver_role: 'IT Manager' 
        })
      ]);

      const allRequests = [
        ...(pendingResponse?.requests || []),
        ...(actedResponse?.requests || [])
      ];

      // Remove duplicates and sort by date
      const uniqueRequests = allRequests
        .filter((request, index, array) => 
          array.findIndex(r => r.id === request.id) === index
        )
        .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
        .slice(0, 8);

      setRequests(uniqueRequests);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (requests: SystemAccessRequest[]): DashboardStats => {
    return requests.reduce((acc, request) => {
      switch (request.status) {
        case 'it_manager_pending':
          acc.pending++;
          break;
        case 'it_support_review':
          acc.assigned++;
          break;
        case 'granted':
          acc.approved++;
          break;
        case 'rejected':
          acc.rejected++;
          break;
      }
      return acc;
    }, { pending: 0, assigned: 0, approved: 0, rejected: 0 });
  };

  const stats = calculateStats(requests);

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusDisplay = (status: string) => {
    const config = STATUS_CONFIG[status];
    if (!config) {
      return {
        label: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        icon: AlertCircle
      };
    }
    return config;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F8F8]">
        <ITManagerLayout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <div className="h-8 bg-gray-300 rounded-md animate-pulse w-48"></div>
                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-32"></div>
              </div>
              <div className="h-9 w-9 bg-gray-300 rounded-lg animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2 w-16"></div>
                  <div className="h-8 bg-gray-300 rounded w-12"></div>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="h-6 bg-gray-300 rounded w-24 animate-pulse"></div>
              </div>
              <div className="p-6">
                <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </ITManagerLayout>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F0F8F8]">
        <ITManagerLayout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Dashboard</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={loadData}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </ITManagerLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F8F8]">
      <ITManagerLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                Welcome, {firstName}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                IT Manager Dashboard Overview
              </p>
            </div>
            <button 
              onClick={loadData} 
              className="flex-shrink-0 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
              title="Refresh dashboard data"
              aria-label="Refresh dashboard data"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {STAT_CONFIGS.map((config) => {
              const value = stats[config.key as keyof DashboardStats];
              const Icon = config.icon as any;
              return (
                <div key={config.key} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-gray-600 truncate">
                        {config.label}
                      </p>
                      <p className="text-4xl font-extrabold tracking-tight text-gray-900 mt-1">
                        {value}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {config.caption}
                      </p>
                    </div>
                    <div className={`ml-3 h-10 w-10 rounded-lg ${config.accentBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${config.accent}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Requests
              </h2>
              <Link 
                href="/administration/office/itmanager/assignments" 
                className="text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline"
              >
                View all
              </Link>
            </div>
            
            <div className="divide-y divide-gray-100">
              {requests.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium mb-1">No recent requests</p>
                  <p className="text-gray-400 text-sm">New requests will appear here</p>
                </div>
              ) : (
                requests.map((request) => {
                  const statusDisplay = getStatusDisplay(request.status);
                  const StatusIcon = statusDisplay.icon as any;
                  
                  return (
                    <div key={request.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {request.user_name || 'Unknown User'}
                            </p>
                            <span className="text-gray-400">•</span>
                            <p className="text-sm text-gray-700 truncate">
                              {request.system_name || 'Unknown System'}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            Submitted {formatDate(request.submitted_at)}
                          </p>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${statusDisplay.color} ${statusDisplay.bgColor}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusDisplay.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Button */}
          {requests.some(r => r.status === 'it_manager_pending') && (
            <div className="mt-6">
              <Link 
                href="/administration/office/itmanager/assignments" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <Clock className="h-4 w-4 mr-2" />
                Review Pending Requests ({stats.pending})
              </Link>
            </div>
          )}
        </div>
      </ITManagerLayout>
    </div>
  );
}