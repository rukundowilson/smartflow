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
import systemAccessRequestService, { SystemAccessRequest as SARequest } from '@/app/services/systemAccessRequestService';
import userRoleService, { UserRoleInfo } from '@/app/services/userRoleService';
import { useAuth } from '@/app/contexts/auth-context';

const Overview: React.FC = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<SARequest[]>([]);
  const [recentApproved, setRecentApproved] = useState<SARequest[]>([]);
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
      if (!user?.id) return;
      const userRoles = await userRoleService.getUserRoleAssignments(user.id);
      const lineManagerRoles = userRoles.filter(role => role.role_name === 'Line Manager');
      setLineManagerDepartments(lineManagerRoles);
      if (lineManagerRoles.length === 0) {
        setPendingRequests([]);
        setStats({ totalPending: 0, totalApproved: 0, totalRejected: 0 });
        return;
      }

      // Fetch system access requests pending LM review in this LM's department(s)
      const response = await systemAccessRequestService.getPending({
        approver_id: user.id,
        approver_role: 'Line Manager'
      });
      if (response.success) {
        const pending = response.requests || [];
        setPendingRequests(pending);
      }

      // Load recently approved by LM to show in activity
      const approvedRes = await systemAccessRequestService.getApprovedBy({ approver_id: user.id, approver_role: 'Line Manager' });
      if (approvedRes.success) {
        setRecentApproved(approvedRes.requests || []);
      }

      // Compute stats
      const totalPending = (response.success ? (response.requests || []).length : 0);
      const totalApproved = (approvedRes.success ? (approvedRes.requests || []).length : 0);
      setStats({ totalPending, totalApproved, totalRejected: 0 });
    } catch (error) {
      console.error('Error fetching Line Manager data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'request_pending':
        return 'text-blue-600 bg-blue-50';
      case 'hod_pending':
        return 'text-gray-600 bg-gray-50';
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
      case 'request_pending': return 'Line Manager Pending';
      case 'hod_pending': return 'HOD Pending';
      case 'it_hod_pending': return 'IT HOD Pending';
      case 'it_manager_pending': return 'IT Manager Pending';
      case 'it_support_review': return 'IT Support Review';
      case 'granted': return 'Granted';
      case 'rejected': return 'Rejected';
      default: return status.replace(/_/g, ' ');
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
            Monitor and approve system access requests for your departments: {lineManagerDepartments.map(d => d.department_name).join(', ')}
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

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Activity - Team Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {(() => {
                const items = [
                  ...pendingRequests.map(r => ({
                    id: `p-${r.id}`,
                    label: `Access request from ${r.user_name || 'Employee'} • ${r.system_name}`,
                    status: r.status,
                    time: r.submitted_at
                  })),
                  ...recentApproved.map(r => ({
                    id: `a-${r.id}`,
                    label: `You approved ${r.user_name || 'Employee'} • ${r.system_name}`,
                    status: 'granted',
                    time: r.line_manager_at || r.submitted_at
                  }))
                ]
                .sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                .slice(0, 5);
                return items.length > 0 ? (
                  items.map((item, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        item.status === 'granted' ? 'bg-green-400' :
                        item.status === 'rejected' ? 'bg-red-400' :
                        'bg-blue-400'
                      }`}></div>
                      <span className="text-gray-600">{item.label}</span>
                      <span className="text-gray-400 ml-auto">{formatDate(item.time)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No recent activity</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 