"use client";

import React, { useEffect, useState } from "react";
import NavBar from "../../components/navbar";
import SideBar from "../../components/ITmanagerSideBar";
import userMetricsService, { UserMetrics } from "@/app/services/userMetricsService";
import { Users, Clock, CheckCircle, TrendingUp, Award, Filter, RefreshCw, BarChart3, Ticket, Key, Package } from "lucide-react";

export default function ITManagerUserMetrics() {
  const [userMetrics, setUserMetrics] = useState<UserMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'completion_rate' | 'total_items' | 'avg_tat' | 'name'>('completion_rate');

  useEffect(() => {
    loadUserMetrics();
  }, [roleFilter]);

  const loadUserMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userMetricsService.getUserMetrics(roleFilter || undefined);
      
      if (response.success && response.data) {
        setUserMetrics(response.data);
      } else {
        setError(response.error || 'Failed to load user metrics');
      }
    } catch (err) {
      setError('Failed to load user metrics');
      console.error('Error loading user metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortedUsers = [...userMetrics].sort((a, b) => {
    switch (sortBy) {
      case 'completion_rate':
        return b.metrics.overall.completion_rate - a.metrics.overall.completion_rate;
      case 'total_items':
        return b.metrics.overall.total_items - a.metrics.overall.total_items;
      case 'avg_tat':
        return a.metrics.overall.avg_tat_hours - b.metrics.overall.avg_tat_hours;
      case 'name':
        return a.full_name.localeCompare(b.full_name);
      default:
        return 0;
    }
  });

  const overallStats = userMetrics.reduce((stats, user) => {
    stats.totalUsers++;
    stats.totalItems += user.metrics.overall.total_items;
    stats.completedItems += user.metrics.overall.completed_items;
    stats.totalTAT += user.metrics.overall.avg_tat_hours;
    return stats;
  }, {
    totalUsers: 0,
    totalItems: 0,
    completedItems: 0,
    totalTAT: 0
  });

  const avgCompletionRate = overallStats.totalItems > 0 
    ? (overallStats.completedItems / overallStats.totalItems) * 100 
    : 0;
  const avgTAT = overallStats.totalUsers > 0 
    ? overallStats.totalTAT / overallStats.totalUsers 
    : 0;

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'text-slate-700', bgColor = 'bg-slate-50' }: {
    icon: any;
    title: string;
    value: string;
    subtitle?: string;
    color?: string;
    bgColor?: string;
  }) => (
    <div className={`p-4 rounded-xl border border-slate-200 ${bgColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className={`h-8 w-8 ${color} opacity-80`} />
      </div>
    </div>
  );

  const UserCard = ({ user }: { user: UserMetrics }) => {
    const performanceGrade = userMetricsService.getPerformanceGrade(user.metrics.overall.completion_rate);
    const tatGrade = userMetricsService.getTATGrade(user.metrics.overall.avg_tat_hours);

    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{user.full_name}</h3>
            <p className="text-sm text-slate-600">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {user.role_name}
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {user.department_name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${performanceGrade.bgColor} ${performanceGrade.color}`}>
              {performanceGrade.grade}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{user.metrics.overall.total_items}</p>
            <p className="text-xs text-slate-600">Total Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{user.metrics.overall.completed_items}</p>
            <p className="text-xs text-slate-600">Completed</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Completion Rate</span>
            <span className="text-sm font-medium text-slate-900">
              {user.metrics.overall.completion_rate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(user.metrics.overall.completion_rate, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Avg TAT</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900">
                {userMetricsService.formatTAT(user.metrics.overall.avg_tat_hours)}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${tatGrade.bgColor} ${tatGrade.color}`}>
                {tatGrade.grade}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Ticket className="h-3 w-3 text-blue-600" />
                <span className="font-medium">{user.metrics.tickets.resolved}</span>
              </div>
              <span className="text-slate-500">Tickets</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Key className="h-3 w-3 text-green-600" />
                <span className="font-medium">{user.metrics.access_requests.granted}</span>
              </div>
              <span className="text-slate-500">Access</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Package className="h-3 w-3 text-purple-600" />
                <span className="font-medium">{user.metrics.requisitions.approved}</span>
              </div>
              <span className="text-slate-500">Requisitions</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F0F8F8]">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          <SideBar />
          <main className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <Users className="h-6 w-6 text-indigo-600 mr-2"/>
                User Performance Metrics
              </h1>
              <button
                onClick={loadUserMetrics}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                title="Total Users"
                value={overallStats.totalUsers.toString()}
                color="text-indigo-600"
                bgColor="bg-indigo-50"
              />
              <StatCard
                icon={CheckCircle}
                title="Completion Rate"
                value={`${avgCompletionRate.toFixed(1)}%`}
                subtitle={`${overallStats.completedItems}/${overallStats.totalItems} items`}
                color="text-green-600"
                bgColor="bg-green-50"
              />
              <StatCard
                icon={Clock}
                title="Avg TAT"
                value={userMetricsService.formatTAT(avgTAT)}
                subtitle="Across all users"
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatCard
                icon={TrendingUp}
                title="Active Users"
                value={userMetrics.filter(u => u.metrics.overall.total_items > 0).length.toString()}
                subtitle="With activity"
                color="text-purple-600"
                bgColor="bg-purple-50"
              />
            </div>

            {/* Filters and Controls */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Filter by Role:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="text-sm border border-slate-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Roles</option>
                    <option value="IT Support">IT Support</option>
                    <option value="IT Manager">IT Manager</option>
                    <option value="IT HOD">IT HOD</option>
                    <option value="Line Manager">Line Manager</option>
                    <option value="HOD">HOD</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-sm border border-slate-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="completion_rate">Completion Rate</option>
                    <option value="total_items">Total Items</option>
                    <option value="avg_tat">Average TAT</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>
            </div>

            {/* User Metrics Grid */}
            {loading ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading user metrics...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadUserMetrics}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Try Again
                </button>
              </div>
            ) : userMetrics.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No user metrics available</p>
                <p className="text-sm text-slate-500 mt-2">
                  {roleFilter ? `No users found with role "${roleFilter}"` : 'No users have completed any tasks yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedUsers.map((user) => (
                  <UserCard key={user.user_id} user={user} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
} 