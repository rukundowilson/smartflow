"use client"
import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Activity, 
  Shield, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Calendar,
  Building2,
  User,
  FileText
} from 'lucide-react';
import accessRequestService, { AccessRequest } from '@/app/services/accessRequestService';
import userRoleService, { UserRoleInfo } from '@/app/services/userRoleService';
import { useAuth } from '@/app/contexts/auth-context';

const Overview: React.FC = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [lineManagerDepartments, setLineManagerDepartments] = useState<UserRoleInfo[]>([]);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0
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
      
      // First, get the user's line manager role assignments
      if (!user?.id) {
        console.log('No user ID available');
        return;
      }
      const userRoles = await userRoleService.getUserRoleAssignments(user.id);
      const lineManagerRoles = userRoles.filter(role => role.role_name === 'Line Manager');
      
      console.log('User line manager roles:', lineManagerRoles);
      setLineManagerDepartments(lineManagerRoles);
      
      if (lineManagerRoles.length === 0) {
        console.log('User has no line manager roles');
        setPendingRequests([]);
        setStats({
          totalPending: 0,
          totalApproved: 0,
          totalRejected: 0
        });
        return;
      }
      
      // Fetch pending requests that this line manager needs to approve
      const response = await accessRequestService.getPendingRequests({
        approver_id: user.id,
        approver_role: 'Line Manager'
      });
      
      console.log('API Response:', response);
      
      if (response.success) {
        const pending = response.requests;
        setPendingRequests(pending.slice(0, 5)); // Show last 5
        
        // Calculate stats from actual data
        const pendingCount = pending.length;
        const approved = pending.filter(r => r.status === 'granted').length;
        const rejected = pending.filter(r => r.status === 'rejected').length;
        
        setStats({
          totalPending: pendingCount,
          totalApproved: approved,
          totalRejected: rejected
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
      case 'pending_line_manager':
        return 'text-blue-600 bg-blue-50';
      case 'granted':
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

  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending_line_manager': return 'Pending Line Manager';
      case 'pending_hod': return 'Pending HOD';
      case 'pending_it_manager': return 'Pending IT Manager';
      case 'pending_manager_approval': return 'Pending Manager';
      case 'pending_system_owner': return 'Pending System Owner';
      case 'granted': return 'Granted';
      case 'rejected': return 'Rejected';
      default: return status.replace('_', ' ');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If user has no line manager roles, show appropriate message
  if (lineManagerDepartments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Line Manager Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">You don't have any line manager roles assigned</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Line Manager Access</h3>
          <p className="text-gray-500">You don't have any line manager roles assigned to any departments.</p>
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
          <p className="text-sm text-gray-600 mt-1">
            Monitor and approve access requests for your departments: {lineManagerDepartments.map(d => d.department_name).join(', ')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPending}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="h-4 w-4 text-blue-600 mr-1" />
            <span className="text-blue-600 font-medium">Awaiting approval</span>
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
            <span className="text-green-600 font-medium">Access granted</span>
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
            <span className="text-red-600 font-medium">Requests denied</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity - Team Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pendingRequests.length > 0 ? (
                pendingRequests.slice(0, 5).map((request, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      request.status === 'granted' ? 'bg-green-400' :
                      request.status === 'rejected' ? 'bg-red-400' :
                      'bg-blue-400'
                    }`}></div>
                    <span className="text-gray-600">
                      {request.status === 'granted' ? 'Access granted for' :
                       request.status === 'rejected' ? 'Access denied for' :
                       'Access request from'} {request.user_name} - {request.role_name}
                    </span>
                    <span className="text-gray-400 ml-auto">{formatDate(request.submitted_at)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Clock className="h-5 w-5 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Review Requests</p>
                  <p className="text-xs text-gray-500">Check pending approvals</p>
                </div>
              </button>
              
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <User className="h-5 w-5 text-green-600 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Team Members</p>
                  <p className="text-xs text-gray-500">View team details</p>
                </div>
              </button>
              
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">View Reports</p>
                  <p className="text-xs text-gray-500">Analytics & insights</p>
                </div>
              </button>
              
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Shield className="h-5 w-5 text-orange-600 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Access Control</p>
                  <p className="text-xs text-gray-500">Manage permissions</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 