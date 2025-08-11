"use client"
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  AlertCircle,
  Search,
  RefreshCw,
  TrendingUp,
  Activity
} from 'lucide-react';
import systemAccessRequestService, { SystemAccessRequest } from '../../../services/systemAccessRequestService';
import NavBar from './components/navbar';
import SideBar from './components/ITmanagerSideBar';
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
  { 
    key: 'pending', 
    label: 'Pending Review', 
    status: 'it_manager_pending', 
    icon: Clock, 
    accent: 'text-blue-600', 
    accentBg: 'bg-blue-50', 
    borderColor: 'border-blue-200',
    caption: 'Awaiting your action',
    gradient: 'from-blue-50 to-blue-100'
  },
  { 
    key: 'assigned', 
    label: 'Assigned to IT', 
    status: 'it_support_review', 
    icon: User, 
    accent: 'text-indigo-600', 
    accentBg: 'bg-indigo-50', 
    borderColor: 'border-indigo-200',
    caption: 'In IT support queue',
    gradient: 'from-indigo-50 to-indigo-100'
  },
  { 
    key: 'approved', 
    label: 'Granted', 
    status: 'granted', 
    icon: CheckCircle, 
    accent: 'text-green-600', 
    accentBg: 'bg-green-50', 
    borderColor: 'border-green-200',
    caption: 'Access granted',
    gradient: 'from-green-50 to-green-100'
  },
  { 
    key: 'rejected', 
    label: 'Rejected', 
    status: 'rejected', 
    icon: XCircle, 
    accent: 'text-red-600', 
    accentBg: 'bg-red-50', 
    borderColor: 'border-red-200',
    caption: 'Declined requests',
    gradient: 'from-red-50 to-red-100'
  }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex">
            <SideBar />
            <main className="flex-1 space-y-6">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-2">
                  <div className="h-8 bg-gray-300 rounded-md animate-pulse w-48"></div>
                  <div className="h-4 bg-gray-200 rounded-md animate-pulse w-32"></div>
                </div>
                <div className="h-9 w-9 bg-gray-300 rounded-lg animate-pulse"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse shadow-sm">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-16"></div>
                    <div className="h-8 bg-gray-300 rounded w-12"></div>
                  </div>
                ))}
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="h-6 bg-gray-300 rounded w-24 animate-pulse"></div>
                </div>
                <div className="p-6">
                  <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex">
            <SideBar />
            <main className="flex-1">
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center shadow-sm">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Dashboard</h3>
                <p className="text-red-700 mb-6 max-w-md mx-auto">{error}</p>
                <button
                  onClick={loadData}
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </button>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          <SideBar />
          <main className="flex-1 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 truncate">
                  Welcome back, {firstName} 👋
                </h1>
                <p className="text-lg text-gray-600 mt-2 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  IT Manager Dashboard Overview
                </p>
              </div>
              <button 
                onClick={loadData} 
                className="flex-shrink-0 p-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm" 
                title="Refresh dashboard data"
                aria-label="Refresh dashboard data"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {STAT_CONFIGS.map((config) => {
                const value = stats[config.key as keyof DashboardStats];
                const Icon = config.icon as any;
                return (
                  <div key={config.key} className={`bg-gradient-to-br ${config.gradient} p-6 rounded-xl border ${config.borderColor} hover:shadow-lg transition-all duration-300 group`}>
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-700 truncate mb-1">
                          {config.label}
                        </p>
                        <p className="text-4xl font-bold tracking-tight text-gray-900 mb-2">
                          {value}
                        </p>
                        <p className="text-xs text-gray-600">
                          {config.caption}
                        </p>
                      </div>
                      <div className={`ml-3 h-12 w-12 rounded-xl ${config.accentBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`h-6 w-6 ${config.accent}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Requests */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Recent Requests
                  </h2>
                </div>
                <Link 
                  href="/administration/office/itmanager/assignments" 
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline transition-colors"
                >
                  View all →
                </Link>
              </div>
              
              <div className="divide-y divide-gray-100">
                {requests.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium mb-2 text-lg">No recent requests</p>
                    <p className="text-gray-400">New requests will appear here when they come in</p>
                  </div>
                ) : (
                  requests.map((request) => {
                    const statusDisplay = getStatusDisplay(request.status);
                    const StatusIcon = statusDisplay.icon as any;
                    
                    return (
                      <div key={request.id} className="px-6 py-5 hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="text-base font-semibold text-gray-900 truncate">
                                {request.user_name || 'Unknown User'}
                              </p>
                              <span className="text-gray-300">•</span>
                              <p className="text-base text-gray-700 truncate">
                                {request.system_name || 'Unknown System'}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 truncate mb-1">{request.user_email || ''}</p>
                            <p className="text-xs text-gray-500 truncate mb-2">{request.department_name || '—'} • {request.role_name || '—'}</p>
                            <p className="text-xs text-gray-400">
                              Submitted {formatDate(request.submitted_at)}
                            </p>
                          </div>
                          
                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full ${statusDisplay.color} ${statusDisplay.bgColor} border border-current border-opacity-20`}>
                              <StatusIcon className="h-4 w-4" />
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
              <div className="flex justify-center">
                <Link 
                  href="/administration/office/itmanager/assignments" 
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Clock className="h-5 w-5 mr-3" />
                  Review Pending Requests ({stats.pending})
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}