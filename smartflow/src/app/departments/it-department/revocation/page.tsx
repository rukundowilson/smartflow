"use client"
import React, { useState, useEffect } from 'react';
import { 
  UserMinus, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Bell,
  User,
  Shield,
  Calendar,
  Loader2,
  RefreshCw
} from 'lucide-react';
import NavBar from "../components/navbar";
import SideBar from "../components/sidebar";
import { useAuth } from '@/app/contexts/auth-context';
import systemAccessGrantService, { SystemAccessGrant } from '@/app/services/systemAccessGrantService';
import NotificationToast from '@/app/components/NotificationToast';

export default function AccessRevocationPage() {
  const { user } = useAuth();
  const [grants, setGrants] = useState<SystemAccessGrant[]>([]);
  const [grantsNeedingNotification, setGrantsNeedingNotification] = useState<SystemAccessGrant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<SystemAccessGrant | null>(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revocationReason, setRevocationReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);

  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, title, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Load active grants and grants needing notification
  const loadGrants = async () => {
    setIsLoading(true);
    try {
      const [activeResponse, notificationResponse] = await Promise.all([
        systemAccessGrantService.getActiveGrants(),
        systemAccessGrantService.getGrantsNeedingNotification()
      ]);

      if (activeResponse.success) {
        setGrants(activeResponse.grants || []);
      }

      if (notificationResponse.success) {
        setGrantsNeedingNotification(notificationResponse.grants || []);
      }
    } catch (error) {
      console.error('Error loading grants:', error);
      addNotification('error', 'Loading Failed', 'Failed to load access grants');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGrants();
    // Refresh every 5 minutes
    const interval = setInterval(loadGrants, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Send notification to IT support for grants needing revocation
  const sendRevocationNotifications = async () => {
    if (grantsNeedingNotification.length === 0) {
      addNotification('info', 'No Notifications', 'No grants need revocation notifications at this time');
      return;
    }

    setIsProcessing(true);
    try {
      const promises = grantsNeedingNotification.map(grant => 
        systemAccessGrantService.markNotificationSent(grant.id)
      );
      
      await Promise.all(promises);
      
      addNotification('success', 'Notifications Sent', 
        `Sent ${grantsNeedingNotification.length} revocation notification(s) to IT support`);
      
      // Reload grants to update notification status
      await loadGrants();
    } catch (error) {
      console.error('Error sending notifications:', error);
      addNotification('error', 'Notification Failed', 'Failed to send revocation notifications');
    } finally {
      setIsProcessing(false);
    }
  };

  // Revoke access for a specific grant
  const handleRevokeAccess = async () => {
    if (!selectedGrant || !user?.id) return;

    setIsProcessing(true);
    try {
      const response = await systemAccessGrantService.revokeAccess(selectedGrant.id, {
        revoked_by: user.id,
        revocation_reason: revocationReason
      });

      if (response.success) {
        addNotification('success', 'Access Revoked', 
          `Access revoked for ${selectedGrant.user_name} to ${selectedGrant.system_name}`);
        setShowRevokeModal(false);
        setSelectedGrant(null);
        setRevocationReason('');
        await loadGrants();
      } else {
        addNotification('error', 'Revocation Failed', response.message || 'Failed to revoke access');
      }
    } catch (error) {
      console.error('Error revoking access:', error);
      addNotification('error', 'Revocation Failed', 'Failed to revoke access');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter grants based on status and search term
  const filteredGrants = grants.filter(grant => {
    const matchesSearch = 
      grant.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.system_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'urgent' && grant.hours_until_revocation && grant.hours_until_revocation <= 24) ||
      (filterStatus === 'scheduled' && grant.scheduled_revocation_date) ||
      (filterStatus === 'permanent' && grant.is_permanent);

    return matchesSearch && matchesStatus;
  });

  // Get urgency level for a grant
  const getUrgencyLevel = (grant: SystemAccessGrant) => {
    if (!grant.hours_until_revocation) return 'none';
    if (grant.hours_until_revocation <= 6) return 'critical';
    if (grant.hours_until_revocation <= 24) return 'urgent';
    if (grant.hours_until_revocation <= 72) return 'warning';
    return 'normal';
  };

  // Format time remaining
  const formatTimeRemaining = (grant: SystemAccessGrant) => {
    if (grant.is_permanent) return 'Permanent';
    if (!grant.hours_until_revocation) return 'No expiration';
    
    const hours = grant.hours_until_revocation;
    if (hours < 1) return 'Less than 1 hour';
    if (hours < 24) return `${Math.floor(hours)} hours`;
    return `${Math.floor(hours / 24)} days`;
  };

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'urgent': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
        return (
      <div className="min-h-screen bg-[#F0F8F8]">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex">
            <SideBar />
            <main className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                <p className="mt-2 text-gray-600">Loading access grants...</p>
              </div>
            </main>
          </div>
        </div>
      </div>
        );
  }

  return (
        <>
            <div className="min-h-screen bg-[#F0F8F8]">
        <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
            <SideBar />
            <main className="flex-1 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Access Revocation Management</h1>
                  <p className="text-gray-600">Manage system access grants and revocation schedules</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={loadGrants}
                    disabled={isProcessing}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button
                    onClick={sendRevocationNotifications}
                    disabled={isProcessing || grantsNeedingNotification.length === 0}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Send Notifications ({grantsNeedingNotification.length})
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Active Grants</p>
                      <p className="text-2xl font-bold text-gray-900">{grants.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Critical (≤6h)</p>
                      <p className="text-2xl font-bold text-red-600">
                        {grants.filter(g => getUrgencyLevel(g) === 'critical').length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Urgent (≤24h)</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {grants.filter(g => getUrgencyLevel(g) === 'urgent').length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Bell className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Need Notification</p>
                      <p className="text-2xl font-bold text-yellow-600">{grantsNeedingNotification.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by user name, system, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:w-48">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Grants</option>
                      <option value="urgent">Urgent (≤24h)</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="permanent">Permanent</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grants List */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Active System Access Grants</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {filteredGrants.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No access grants found matching your criteria.</p>
                    </div>
                  ) : (
                    filteredGrants.map((grant) => {
                      const urgency = getUrgencyLevel(grant);
                      return (
                        <div key={grant.id} className="px-6 py-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3">
                                <User className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {grant.user_name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">{grant.user_email}</p>
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm text-gray-900">
                                  <Shield className="inline h-4 w-4 mr-1" />
                                  {grant.system_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Granted by {grant.granted_by_name} on {new Date(grant.granted_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(urgency)}`}>
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTimeRemaining(grant)}
                                </div>
                                {grant.scheduled_revocation_date && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Scheduled: {new Date(grant.scheduled_revocation_date).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedGrant(grant);
                                  setShowRevokeModal(true);
                                }}
                                className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-600 hover:text-red-900 focus:outline-none"
                              >
                                <UserMinus className="h-4 w-4 mr-1" />
                                Revoke
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
          </main>
          </div>
        </div>
      </div>

      {/* Revoke Modal */}
      {showRevokeModal && selectedGrant && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revoke System Access</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to revoke access for <strong>{selectedGrant.user_name}</strong> to <strong>{selectedGrant.system_name}</strong>?
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Revocation Reason (Optional)
                </label>
                <textarea
                  value={revocationReason}
                  onChange={(e) => setRevocationReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter reason for revocation..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRevokeModal(false);
                    setSelectedGrant(null);
                    setRevocationReason('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevokeAccess}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Revoking...
                    </>
                  ) : (
                    'Revoke Access'
                  )}
                </button>
              </div>
        </div>
      </div>
    </div>
      )}

      {/* Notifications */}
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          id={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={removeNotification}
        />
      ))}
        </>
  );
}