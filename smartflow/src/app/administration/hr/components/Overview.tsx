"use client"
import React, { useEffect, useState } from 'react';
import { UserPlus, Shield, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import StatCard from './StatCard';

interface RegistrationApplication {
  application_id: number;
  user_id: number;
  full_name: string;
  email: string;
  department: string;
  user_status: string;
  application_status: string;
  submitted_by: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

interface RoleAssignment {
  user_id: number;
  department_id: number;
  role_id: number;
  assigned_at: string;
  assigned_by: number;
  status: string;
  department_name: string;
  role_name: string;
  role_description: string;
  user_name: string;
}

const Overview: React.FC = () => {
  const [pendingRegistrations, setPendingRegistrations] = useState<RegistrationApplication[]>([]);
  const [recentRoleAssignments, setRecentRoleAssignments] = useState<RoleAssignment[]>([]);
  const [stats, setStats] = useState({
    pendingRegistrations: 0,
    totalEmployees: 0,
    activeRoleAssignments: 0,
    recentActivities: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHRData();
  }, []);

  const fetchHRData = async () => {
    try {
      setLoading(true);
      
      // Fetch pending registrations (system users includes applications)
      const registrationsResponse = await fetch('http://localhost:8081/api/users/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (registrationsResponse.ok) {
        const registrationsData = await registrationsResponse.json();
        const pending = registrationsData.users.filter((app: RegistrationApplication) => app.application_status === 'pending');
        setPendingRegistrations(pending);
        setStats(prev => ({ ...prev, pendingRegistrations: pending.length }));
      }

      // Fetch role assignments
      const rolesResponse = await fetch('http://localhost:8081/api/roles/assignments/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        const activeAssignments = rolesData.data.filter((assignment: RoleAssignment) => assignment.status === 'active');
        setRecentRoleAssignments(activeAssignments.slice(0, 5)); // Show last 5
        setStats(prev => ({ 
          ...prev, 
          activeRoleAssignments: activeAssignments.length,
          totalEmployees: activeAssignments.length
        }));
      }

    } catch (error) {
      console.error('Error fetching HR data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Pending Registrations" 
          value={stats.pendingRegistrations.toString()} 
          icon={UserPlus} 
          color="text-orange-600" 
          subtitle="Awaiting approval" 
        />
        <StatCard 
          title="Total Employees" 
          value={stats.totalEmployees.toString()} 
          icon={Users} 
          color="text-green-600" 
          subtitle="Active users" 
        />
        <StatCard 
          title="Role Assignments" 
          value={stats.activeRoleAssignments.toString()} 
          icon={Shield} 
          color="text-blue-600" 
          subtitle="Active assignments" 
        />
        <StatCard 
          title="Recent Activities" 
          value={stats.recentActivities.toString()} 
          icon={Clock} 
          color="text-purple-600" 
          subtitle="Last 24 hours" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Pending Employee Registrations</h3>
            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              {pendingRegistrations.length} Pending
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingRegistrations.length > 0 ? (
              pendingRegistrations.slice(0, 5).map(registration => (
                <div key={registration.application_id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{registration.full_name}</p>
                      <p className="text-xs text-gray-500">{registration.department}</p>
                      <p className="text-xs text-gray-500 mt-1">{registration.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(registration.application_status)}`}>
                        {registration.application_status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        Applied {formatDate(registration.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No pending registrations</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Recent Role Assignments</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentRoleAssignments.length > 0 ? (
              recentRoleAssignments.map(assignment => (
                <div key={`${assignment.user_id}-${assignment.department_id}-${assignment.role_id}`} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{assignment.user_name}</p>
                      <p className="text-xs text-gray-500">{assignment.role_name} • {assignment.department_name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(assignment.assigned_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent role assignments</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">HR Activity Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.pendingRegistrations}</div>
              <div className="text-sm text-gray-600">Pending Registrations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalEmployees}</div>
              <div className="text-sm text-gray-600">Total Employees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.activeRoleAssignments}</div>
              <div className="text-sm text-gray-600">Active Role Assignments</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 