"use client"
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Ticket, 
  Key, 
  UserMinus, 
  Package, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Monitor,
  Settings,
  Bell,
  LogOut,
  BarChart3,
  TrendingUp,
  Activity,
  UserCheck,
  UserX,
  UserCog,
  Calendar
} from 'lucide-react';
import SideBar from '../components/sidebar';
import NavBar from '../components/nav';
import { getDashboardStats, getRecentActivities, DashboardStats } from '@/app/services/dashboardService';
import SpinLoading from '../components/loading';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color?: string;
    trend?: string;
}

interface HistogramProps {
    data: { status: string; count: number }[];
    title: string;
    colors: string[];
}

const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'resolved':
      case 'approved':
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'closed': return 'text-gray-600 bg-gray-50';
      case 'assigned': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
};

const getActivityIcon = (type: string) => {
    switch (type) {
        case 'ticket': return Ticket;
        case 'requisition': return Package;
        case 'user': return Users;
        case 'access': return Key;
        default: return Activity;
    }
};

const getActivityColor = (action: string) => {
    switch (action) {
        case 'created':
        case 'applied': return 'text-blue-600 bg-blue-50';
        case 'approved': return 'text-green-600 bg-green-50';
        case 'rejected': return 'text-red-600 bg-red-50';
        case 'assigned': return 'text-purple-600 bg-purple-50';
        case 'resolved':
        case 'delivered': return 'text-green-600 bg-green-50';
        case 'closed': return 'text-gray-600 bg-gray-50';
        default: return 'text-gray-600 bg-gray-50';
    }
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color = 'text-blue-600', trend }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          )}
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
);

const Histogram: React.FC<HistogramProps> = ({ data, title, colors }) => {
    const maxCount = Math.max(...data.map(item => item.count), 1);
    
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-6">{title}</h3>
            {data.length > 0 ? (
                <div className="space-y-4">
                    {data.map((item, index) => (
                        <div key={item.status} className="flex items-center">
                            <div className="w-24 text-sm text-gray-600 capitalize font-medium">
                                {item.status.replace('_', ' ')}
                            </div>
                            <div className="flex-1 mx-4">
                                <div className="relative bg-gray-200 rounded-full h-8">
                                    <div 
                                        className={`h-8 rounded-full transition-all duration-300 ${colors[index % colors.length]} shadow-sm`}
                                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                                    ></div>
                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                                        {item.count}
                                    </span>
                                </div>
                            </div>
                            <div className="w-16 text-right text-sm font-semibold text-gray-700">
                                {item.count}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No data available</p>
                </div>
            )}
        </div>
    );
};

export default function Overview() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<DashboardStats['recentActivities']>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [statsResponse, activitiesResponse] = await Promise.all([
                    getDashboardStats(),
                    getRecentActivities()
                ]);
                
                setStats(statsResponse.data);
                setActivities(activitiesResponse.activities);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F0F8F8]">
                <NavBar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex">
                        <SideBar />
                        <div className="flex-1 flex items-center justify-center">
                            <SpinLoading />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F8F8]">
            <NavBar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex">
                    <SideBar />
                    <div className="flex-1 space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                            <p className="text-gray-600 mt-2">Monitor system activity and manage resources</p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard 
                                title="Total Tickets" 
                                value={stats?.tickets.total || 0} 
                                icon={Ticket} 
                                color="text-blue-600"
                                trend={`${stats?.tickets.open || 0} open`}
                            />
                            <StatCard 
                                title="Pending Requests" 
                                value={(stats?.requisitions.pending || 0) + (stats?.users.pending || 0)} 
                                icon={Clock} 
                                color="text-orange-600"
                                trend={`${stats?.requisitions.pending || 0} items, ${stats?.users.pending || 0} users`}
                            />
                            <StatCard 
                                title="Active Users" 
                                value={stats?.users.approved || 0} 
                                icon={Users} 
                                color="text-green-600"
                                trend={`${stats?.users.total || 0} total`}
                            />
                            <StatCard 
                                title="Completed Items" 
                                value={(stats?.requisitions.delivered || 0) + (stats?.tickets.resolved || 0)} 
                                icon={CheckCircle} 
                                color="text-green-600"
                                trend={`${stats?.requisitions.delivered || 0} delivered, ${stats?.tickets.resolved || 0} resolved`}
                            />
                        </div>

                        {/* Account Management Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">User Applications</h3>
                                    <UserCog className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Pending</span>
                                        <span className="text-lg font-semibold text-orange-600">{stats?.users.pending || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Approved</span>
                                        <span className="text-lg font-semibold text-green-600">{stats?.users.approved || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Rejected</span>
                                        <span className="text-lg font-semibold text-red-600">{stats?.users.rejected || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Item Requisitions</h3>
                                    <Package className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Pending</span>
                                        <span className="text-lg font-semibold text-orange-600">{stats?.requisitions.pending || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Approved</span>
                                        <span className="text-lg font-semibold text-green-600">{stats?.requisitions.approved || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Delivered</span>
                                        <span className="text-lg font-semibold text-blue-600">{stats?.requisitions.delivered || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Ticket Status</h3>
                                    <Ticket className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Open</span>
                                        <span className="text-lg font-semibold text-orange-600">{stats?.tickets.open || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">In Progress</span>
                                        <span className="text-lg font-semibold text-blue-600">{stats?.tickets.in_progress || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Resolved</span>
                                        <span className="text-lg font-semibold text-green-600">{stats?.tickets.resolved || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Histograms */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Histogram 
                                data={stats?.tickets.byStatus || [
                                    { status: 'open', count: 5 },
                                    { status: 'in_progress', count: 3 },
                                    { status: 'resolved', count: 8 },
                                    { status: 'closed', count: 2 }
                                ]}
                                title="Tickets by Status"
                                colors={['bg-blue-500', 'bg-orange-500', 'bg-green-500', 'bg-gray-500', 'bg-purple-500']}
                            />
                            <Histogram 
                                data={stats?.requisitions.byStatus || [
                                    { status: 'pending', count: 4 },
                                    { status: 'approved', count: 6 },
                                    { status: 'assigned', count: 2 },
                                    { status: 'delivered', count: 10 }
                                ]}
                                title="Requisitions by Status"
                                colors={['bg-purple-500', 'bg-orange-500', 'bg-green-500', 'bg-red-500', 'bg-blue-500']}
                            />
                        </div>

                        {/* Recent Activities */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {activities.length > 0 ? (
                                    activities.map((activity) => {
                                        const Icon = getActivityIcon(activity.type);
                                        return (
                                            <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <Icon className="h-5 w-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {activity.description}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                by {activity.user} • {activity.action}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${getActivityColor(activity.action)}`}>
                                                            {activity.action}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(activity.timestamp).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="px-6 py-8 text-center">
                                        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">No recent activities</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}