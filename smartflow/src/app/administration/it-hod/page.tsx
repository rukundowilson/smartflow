"use client"
import React, { useEffect, useState } from 'react';
import NavBarItHod from './components/itHodNav';
import Sidebar from './components/itHodSideBar';
import { Clock, CheckCircle, XCircle, Activity, Eye, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import systemAccessRequestService, { SystemAccessRequest as SARequest } from '@/app/services/systemAccessRequestService';
import { useAuth } from '@/app/contexts/auth-context';
import Link from 'next/link';

interface RecentItem {
  id: number;
  title: string;
  subtitle: string;
  status: string;
  submitted_at: string;
}

export default function ITHODOverviewPage() {
  const { user } = useAuth();
  const [pending, setPending] = useState<SARequest[]>([]);
  const [processed, setProcessed] = useState<SARequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getFirstName = (fullName?: string | null) => {
    if (!fullName || typeof fullName !== 'string') return 'User';
    const t = fullName.trim();
    if (!t) return 'User';
    return t.split(' ')[0] || 'User';
  };

  useEffect(() => {
    const load = async () => {
      if (!user?.id) { setIsLoading(false); return; }
      try {
        setIsLoading(true);
        const [pendingRes, processedRes] = await Promise.all([
          systemAccessRequestService.getPending({ approver_id: user.id, approver_role: 'IT HOD' }),
          systemAccessRequestService.getApprovedBy({ approver_id: user.id, approver_role: 'IT HOD' })
        ]);
        if (pendingRes.success) setPending(pendingRes.requests);
        if (processedRes.success) setProcessed(processedRes.requests);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const pendingCount = pending.length;
  const reviewedCount = processed.filter(r => r.it_hod_at).length;

  const recent: RecentItem[] = [...processed, ...pending]
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    .slice(0, 6)
    .map(r => ({
      id: r.id,
      title: `${r.user_name || 'User'} — ${r.system_name}`,
      subtitle: r.justification?.slice(0, 80) || '',
      status: r.status,
      submitted_at: r.submitted_at
    }));

  if (isLoading) {
    return (
      <>
        <NavBarItHod />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex">
            <Sidebar />
            <div className="flex-1 flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading IT HOD dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className='min-h-screen bg-[#F0F8F8]'>
      <NavBarItHod />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex">
          <Sidebar />

          <div className="space-y-8 flex-1">
            {/* Welcome */}
            <div className="rounded-2xl p-6 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Welcome, {getFirstName(user?.full_name) }</h1>
                  <p className="text-gray-600">Here is your system access overview</p>
                </div>
                <div className="hidden lg:flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
                    <div className="text-sm text-gray-600">Awaiting Your Review</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Awaiting Your Review</p>
                    <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">You Reviewed</p>
                    <p className="text-3xl font-bold text-gray-900">{reviewedCount}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <ArrowUpRight className="h-4 w-4 mr-1 text-blue-500" />
                  <span>Requests you reviewed</span>
                </div>
              </div>
            </div>

            {/* Notifications removed; handled by navbar NotificationBell */}

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <Activity className="h-5 w-5 text-gray-400" />
              </div>
              {recent.length === 0 ? (
                <div className="p-8 text-center text-gray-600">No recent activity</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recent.map(item => (
                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          {item.subtitle && <p className="text-sm text-gray-600 mt-1">{item.subtitle}</p>}
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          item.status.endsWith('_pending') ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">{new Date(item.submitted_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
