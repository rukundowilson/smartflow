"use client"
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
  User,
  Building,
  Key,
  TrendingUp,
  Activity,
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import accessRequestService, { AccessRequest } from '@/app/services/accessRequestService';
import { useAuth } from '@/app/contexts/auth-context';

interface RecentActivity {
  id: number;
  type: 'approval' | 'rejection' | 'new_request';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  status: string;
}

export default function Overview() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await accessRequestService.getAllRequests();
        setRequests(data);
        
        // Generate recent activities from requests
        const activities: RecentActivity[] = data.slice(0, 5).map(request => ({
          id: request.id,
          type: request.status === 'granted' ? 'approval' : 
                request.status === 'rejected' ? 'rejection' : 'new_request',
          title: `${request.user_name} requested access to ${request.department_name}`,
          description: request.justification.substring(0, 60) + '...',
          timestamp: request.submitted_at,
          user: request.user_name,
          status: request.status
        }));
        
        setRecentActivities(activities);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const pendingCount = requests.filter(r => r.status === 'pending_hod').length;
  const approvedCount = requests.filter(r => r.status === 'granted').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;
  const totalCount = requests.length;

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'approval':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejection':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'new_request':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch(type) {
      case 'approval':
        return 'bg-green-50 border-green-200';
      case 'rejection':
        return 'bg-red-50 border-red-200';
      case 'new_request':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HOD dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">
              Welcome back, {user?.full_name || 'HOD'}!
            </h1>
            <p className="text-gray-600 text-lg">
              As {user?.role || 'Head of Department'}, here's your access request overview
            </p>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
              <div className="text-sm text-gray-600">Awaiting Your Review</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Awaiting Your Review</p>
              <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <AlertCircle className="h-4 w-4 mr-1 text-yellow-500" />
            <span>Need your HOD approval</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">You Approved</p>
              <p className="text-3xl font-bold text-gray-900">{approvedCount}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <ArrowUpRight className="h-4 w-4 mr-1 text-green-500" />
            <span>Requests you approved</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">You Rejected</p>
              <p className="text-3xl font-bold text-gray-900">{rejectedCount}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
              <XCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <ArrowDownRight className="h-4 w-4 mr-1 text-red-500" />
            <span>Requests you declined</span>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your Recent Activities</h2>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">Your department's recent requests</span>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {recentActivities.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activities</h3>
              <p className="text-gray-500">Activities will appear here as requests are processed</p>
            </div>
          ) : (
            recentActivities.map((activity, index) => (
              <div key={activity.id} className={`p-6 hover:bg-gray-50 transition-colors ${getActivityColor(activity.type)}`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {activity.user}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'granted' ? 'bg-green-100 text-green-800' :
                        activity.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.status === 'granted' ? 'Approved' :
                         activity.status === 'rejected' ? 'Rejected' :
                         'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-6 rounded-2xl border border-sky-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-sky-500 rounded-xl">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Review Requests</h3>
              <p className="text-sm text-gray-600">Check pending access requests</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Pending approvals</span>
              <span className="font-medium text-gray-900">{pendingCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalCount > 0 ? (pendingCount / totalCount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-500 rounded-xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Approval History</h3>
              <p className="text-sm text-gray-600">View all processed requests</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total processed</span>
              <span className="font-medium text-gray-900">{approvedCount + rejectedCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalCount > 0 ? ((approvedCount + rejectedCount) / totalCount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 