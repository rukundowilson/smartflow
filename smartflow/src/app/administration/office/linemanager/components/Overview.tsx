"use client"
import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  TrendingUp, 
  Activity, 
  Shield, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Calendar,
  Building2
} from 'lucide-react';
import accessRequestService, { AccessRequest } from '@/app/services/accessRequestService';
import { useAuth } from '@/app/contexts/auth-context';



const Overview: React.FC = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    teamMembers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchLineManagerData();
    }
  }, [user]);

  const fetchLineManagerData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching Line Manager data for user:', user?.id);
      
      // Fetch pending requests for Line Manager using actual user ID
      const response = await accessRequestService.getPendingRequests({
        approver_id: user?.id,
        approver_role: 'Line Manager'
      });
      
      console.log('API Response:', response);
      
      if (response.success) {
        const pending = response.requests;
        setPendingRequests(pending.slice(0, 5)); // Show last 5
        setStats({
          totalPending: pending.length,
          totalApproved: 12, // Mock data for now
          totalRejected: 3,  // Mock data for now
          teamMembers: 8     // Mock data for now
        });
      }
    } catch (error) {
      console.error('Error fetching Line Manager data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'pending_manager_approval':
        return 'text-orange-600 bg-orange-50';
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Line Manager Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">Monitor and manage access requests for your team</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPending}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="h-4 w-4 text-orange-600 mr-1" />
            <span className="text-orange-600 font-medium">+2 from yesterday</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApproved}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">+5 this week</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRejected}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
            <span className="text-red-600 font-medium">-1 from yesterday</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.teamMembers}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="h-4 w-4 text-blue-600 mr-1" />
            <span className="text-blue-600 font-medium">+1 this month</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                {pendingRequests.length} Pending
              </span>
              {pendingRequests.length > 0 && (
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </button>
              )}
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request, index) => (
                <div key={`${request.id}-${index}`} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{request.user_name}</p>
                      <p className="text-xs text-gray-500">{request.department_name}</p>
                      <p className="text-xs text-gray-500 mt-1">{request.user_email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(request.status)}`}>
                        {request.status === 'pending_manager_approval' ? 'Pending' : request.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(request.submitted_at)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <Shield className="h-3 w-3 mr-1" />
                    <span>{request.department_name} • {request.role_name}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No pending requests</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                <span className="text-gray-600">Access request approved for John Doe</span>
                <span className="text-gray-400 ml-auto">5 min ago</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                <span className="text-gray-600">New access request from Sarah Smith</span>
                <span className="text-gray-400 ml-auto">20 min ago</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                <span className="text-gray-600">Access request rejected for Mike Johnson</span>
                <span className="text-gray-400 ml-auto">1 hour ago</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span className="text-gray-600">Team member added: Lisa Chen</span>
                <span className="text-gray-400 ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                <span className="text-gray-600">Monthly report generated</span>
                <span className="text-gray-400 ml-auto">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Clock className="h-5 w-5 text-orange-600 mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Review Pending</p>
                <p className="text-xs text-gray-500">Check new requests</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-5 w-5 text-blue-600 mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Manage Team</p>
                <p className="text-xs text-gray-500">View team members</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">View Reports</p>
                <p className="text-xs text-gray-500">Analytics & insights</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 