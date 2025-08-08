"use client"
import React, { useEffect, useState, useMemo } from 'react';
import { Key, Plus, Calendar, X, ChevronRight, Activity, Clock, CheckCircle, XCircle, AlertCircle, FileText, Shield, User } from 'lucide-react';
import { useAuth } from '@/app/contexts/auth-context';
import systemService, { System } from '@/app/services/systemService';
import SystemAccessRequestService, { CreateSystemAccessRequestData } from '@/app/services/systemAccessRequestService';

interface SystemAccessRequest {
  id: number;
  user_id: number;
  system_id: number;
  justification: string;
  start_date: string;
  end_date?: string;
  is_permanent: boolean;
  status: 'request_pending' | 'line_manager_pending' | 'hod_pending' | 'it_hod_pending' | 'it_manager_pending' | 'it_support_review' | 'granted' | 'rejected';
  submitted_at: string;
  system_name: string;
  system_description?: string;
}

const statusLabels: Record<SystemAccessRequest['status'], string> = {
  request_pending: 'Request Submitted',
  line_manager_pending: 'Line Manager Review',
  hod_pending: 'HOD Review',
  it_hod_pending: 'IT HOD Review',
  it_manager_pending: 'IT Manager Review',
  it_support_review: 'IT Support Execution',
  granted: 'Access Granted',
  rejected: 'Rejected',
};

const statusIcons: Record<SystemAccessRequest['status'], React.ReactNode> = {
  request_pending: <Clock className="w-4 h-4" />,
  line_manager_pending: <User className="w-4 h-4" />,
  hod_pending: <User className="w-4 h-4" />,
  it_hod_pending: <Shield className="w-4 h-4" />,
  it_manager_pending: <Shield className="w-4 h-4" />,
  it_support_review: <Activity className="w-4 h-4" />,
  granted: <CheckCircle className="w-4 h-4" />,
  rejected: <XCircle className="w-4 h-4" />,
};

const statusColors: Record<SystemAccessRequest['status'], string> = {
  request_pending: 'bg-blue-50 text-blue-700 border-blue-200',
  line_manager_pending: 'bg-amber-50 text-amber-700 border-amber-200',
  hod_pending: 'bg-amber-50 text-amber-700 border-amber-200',
  it_hod_pending: 'bg-purple-50 text-purple-700 border-purple-200',
  it_manager_pending: 'bg-purple-50 text-purple-700 border-purple-200',
  it_support_review: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  granted: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

const orderedStatuses: SystemAccessRequest['status'][] = [
  'request_pending',
  'line_manager_pending',
  'hod_pending',
  'it_hod_pending',
  'it_manager_pending',
  'it_support_review',
  'granted',
];

type StepState = 'done' | 'current' | 'disabled' | 'rejected';

function computeFlowStates(status: SystemAccessRequest['status']): StepState[] {
  const states: StepState[] = new Array(orderedStatuses.length).fill('disabled');
  if (status === 'granted') {
    return states.map(() => 'done');
  }
  if (status === 'rejected') {
    const rejectAt = orderedStatuses.indexOf('it_support_review');
    for (let i = 0; i < rejectAt; i++) states[i] = 'done';
    states[rejectAt] = 'rejected';
    return states;
  }
  const idx = orderedStatuses.indexOf(status);
  if (status === 'request_pending') {
    states[0] = 'done';
    if (orderedStatuses[1]) states[1] = 'current';
    return states;
  }
  const currentIdx = Math.max(0, idx);
  for (let i = 0; i < currentIdx; i++) states[i] = 'done';
  states[currentIdx] = 'current';
  return states;
}

function SmallCircularIndicator({ status }: { status: SystemAccessRequest['status'] }) {
  const size = 48;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const states = computeFlowStates(status);
  const lastDoneIdx = states.reduce((acc, s, i) => (s === 'done' ? i : acc), 0);
  const currentIdx = states.findIndex(s => s === 'current');
  const progressIdx = Math.max(lastDoneIdx, 0);
  const progress = progressIdx / (orderedStatuses.length - 1);
  const dashOffset = c * (1 - progress);
  const angleIdx = currentIdx >= 0 ? currentIdx : progressIdx;
  const currentAngle = (angleIdx / (orderedStatuses.length - 1)) * 2 * Math.PI - Math.PI / 2;
  const dotX = size / 2 + r * Math.cos(currentAngle);
  const dotY = size / 2 + r * Math.sin(currentAngle);
  
  let dotColor = '#0EA5E9';
  let ringColor = '#16A34A';
  
  if (status === 'rejected') {
    dotColor = '#DC2626';
    ringColor = '#DC2626';
  } else if (status === 'granted') {
    dotColor = '#16A34A';
  }
  
  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0 drop-shadow-sm">
        <circle cx={size/2} cy={size/2} r={r} stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
        <circle 
          cx={size/2} cy={size/2} r={r} stroke={ringColor} strokeWidth={stroke} fill="none" 
          strokeDasharray={c} strokeDashoffset={dashOffset} strokeLinecap="round" 
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
        <circle cx={dotX} cy={dotY} r={4} fill={dotColor} className="drop-shadow-sm" />
      </svg>
    </div>
  );
}

function FlowModal({ status, onClose }: { status: SystemAccessRequest['status']; onClose: () => void }) {
  const size = 220;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const step = c / orderedStatuses.length;
  const states = computeFlowStates(status);

  const currentStageIdx = states.findIndex(s => s === 'current');
  const isAllDone = states.every(s => s === 'done');
  const activeIdx = currentStageIdx >= 0 ? currentStageIdx : states.reduce((acc, s, i) => (s === 'done' ? i : acc), 0);
  const activeLabel = statusLabels[orderedStatuses[activeIdx]];
  const activeColor = isAllDone ? '#16A34A' : status === 'rejected' ? '#DC2626' : '#0EA5E9';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in-0 duration-200">
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Track Request Progress</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Monitor your access request status</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        
        <div className="p-4 sm:p-8">
          <div className="flex flex-col items-center">
            <div className="relative mb-6 sm:mb-8">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
                {states.map((state, idx) => {
                  const gap = 6;
                  const segLen = step - gap;
                  const offset = (segLen + gap) * idx;
                  let color = '#E5E7EB';
                  if (state === 'done') color = '#16A34A';
                  if (state === 'current') color = '#0EA5E9';
                  if (state === 'rejected') color = '#DC2626';
                  return (
                    <circle 
                      key={idx} 
                      cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                      strokeDasharray={`${segLen} ${c - segLen}`} strokeDashoffset={c/4 - offset}
                      transform={`rotate(-90 ${size/2} ${size/2})`} strokeLinecap="round"
                      style={{ transition: 'stroke 0.3s ease-in-out' }}
                    />
                  );
                })}
                <circle cx={size/2} cy={size/2} r={r - stroke - 10} fill="white" className="drop-shadow-sm" />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Current Status</div>
                <div className="text-sm sm:text-base font-semibold leading-tight" style={{ color: activeColor }}>
                  {activeLabel}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3 w-full max-w-lg">
              {orderedStatuses.map((st, idx) => {
                const state = states[idx];
                let bgColor = 'bg-gray-50';
                let textColor = 'text-gray-500';
                let iconColor = '#9CA3AF';
                
                if (state === 'done') {
                  bgColor = 'bg-green-50';
                  textColor = 'text-green-700';
                  iconColor = '#16A34A';
                } else if (state === 'current') {
                  bgColor = 'bg-blue-50';
                  textColor = 'text-blue-700';
                  iconColor = '#0EA5E9';
                } else if (state === 'rejected') {
                  bgColor = 'bg-red-50';
                  textColor = 'text-red-700';
                  iconColor = '#DC2626';
                }
                
                return (
                  <div key={st} className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl ${bgColor} transition-colors`}>
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: iconColor + '20' }}
                    >
                      {state === 'done' ? (
                        <CheckCircle className="w-4 h-4" style={{ color: iconColor }} />
                      ) : state === 'rejected' ? (
                        <XCircle className="w-4 h-4" style={{ color: iconColor }} />
                      ) : state === 'current' ? (
                        <Clock className="w-4 h-4" style={{ color: iconColor }} />
                      ) : (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: iconColor }}></div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm sm:text-base font-medium ${textColor} leading-tight`}>
                        {statusLabels[st]}
                      </div>
                      <div className="text-xs text-gray-500">Step {idx + 1} of {orderedStatuses.length}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex justify-end border-t border-gray-100 pt-4">
          <button 
            onClick={onClose} 
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 rounded-lg sm:rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm sm:text-base font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SystemAccessRequests() {
  const { user } = useAuth();
  const [systems, setSystems] = useState<System[]>([]);
  const [requests, setRequests] = useState<SystemAccessRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flowFor, setFlowFor] = useState<SystemAccessRequest | null>(null);

  const [selectedSystem, setSelectedSystem] = useState<string>('');
  const [justification, setJustification] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      try {
        const sysResp = await systemService.getAllSystems();
        setSystems(sysResp.systems || []);
        const reqResp = await SystemAccessRequestService.getUserRequests(user.id);
        setRequests(reqResp.requests || []);
      } catch (e) {
        console.error('Failed loading system access requests', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !selectedSystem || !justification || !startDate) return;
    setIsSubmitting(true);
    try {
      const payload: CreateSystemAccessRequestData = {
        user_id: user.id,
        system_id: parseInt(selectedSystem),
        justification,
        start_date: startDate,
        end_date: isPermanent ? undefined : endDate || undefined,
        is_permanent: isPermanent,
      };
      const resp = await SystemAccessRequestService.create(payload);
      if (resp.success) {
        setIsModalOpen(false);
        setSelectedSystem('');
        setJustification('');
        setStartDate('');
        setEndDate('');
        setIsPermanent(false);
        const reqResp = await SystemAccessRequestService.getUserRequests(user.id);
        setRequests(reqResp.requests || []);
      } else {
        alert(resp.message || 'Failed to submit request');
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusPriority = (status: SystemAccessRequest['status']) => {
    const priorities = {
      'request_pending': 1,
      'line_manager_pending': 2,
      'hod_pending': 3,
      'it_hod_pending': 4,
      'it_manager_pending': 5,
      'it_support_review': 6,
      'granted': 7,
      'rejected': 0
    };
    return priorities[status];
  };

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      const priorityDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    });
  }, [requests]);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-3 sm:p-6">
        {/* Header */}
        <div className="bg-white/80 rounded-xl sm:rounded-2xl border border-white/20 shadow-sm mb-4 sm:mb-8 p-4 sm:p-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                <Key className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  System Access Requests
                </h1>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Request and track access to enterprise systems
                </p>
                <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                    {requests.length} Total
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    {requests.filter(r => r.status === 'granted').length} Approved
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="w-full sm:w-auto sm:self-end inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm sm:text-base font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              New Request
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white/80 rounded-xl sm:rounded-2xl border border-white/20 p-6 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-4 sm:mb-6">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">Loading Requests</h3>
            <p className="text-sm sm:text-base text-gray-600">Fetching your system access requests...</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-6">
            {sortedRequests.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20 shadow-xl p-6 sm:p-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-4 sm:mb-6">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No Requests Yet</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">You haven't submitted any system access requests. Get started by creating your first request.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm sm:text-base font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  Create First Request
                </button>
              </div>
            ) : (
              sortedRequests.map((r, index) => (
                <div 
                  key={r.id} 
                  className="group bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/80 shadow-sm hover:shadow-sm transition-all duration-300 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {/* Status and System Name */}
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <SmallCircularIndicator status={r.status} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                              {r.system_name}
                            </h3>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full w-fit ${statusColors[r.status]}`}>
                              {statusIcons[r.status]}
                              <span className="hidden xs:inline">{statusLabels[r.status]}</span>
                              <span className="xs:hidden">{statusLabels[r.status].split(' ')[0]}</span>
                            </span>
                            {r.system_description && (
                              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{r.system_description}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Track Progress Button - Mobile */}
                      <div className="sm:hidden">
                        <button 
                          onClick={() => setFlowFor(r)}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-sm font-medium transition-all"
                        >
                          <Activity className="h-4 w-4" />
                          Track Progress
                        </button>
                      </div>

                      {/* Details Grid - Responsive */}
                      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-white/50 rounded-lg sm:rounded-xl">
                          <div className="p-1.5 sm:p-2 bg-green-100 rounded-md sm:rounded-lg flex-shrink-0">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Start</div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{formatDate(r.start_date)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-white/50 rounded-lg sm:rounded-xl">
                          <div className="p-1.5 sm:p-2 bg-blue-100 rounded-md sm:rounded-lg flex-shrink-0">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">End</div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900">
                              {r.is_permanent ? (
                                <span className="text-purple-600 font-semibold">Permanent</span>
                              ) : (
                                <span className="truncate block">{r.end_date ? formatDate(r.end_date) : 'Not set'}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-white/50 rounded-lg sm:rounded-xl xs:col-span-2 lg:col-span-1">
                          <div className="p-1.5 sm:p-2 bg-gray-100 rounded-md sm:rounded-lg flex-shrink-0">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Submitted</div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{formatDate(r.submitted_at)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Track Progress Button - Desktop */}
                      <div className="hidden sm:flex justify-end">
                        <button 
                          onClick={() => setFlowFor(r)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 border border-blue-200 text-blue-700 hover:bg-blue-50 font-medium transition-all hover:shadow-md"
                        >
                          <Activity className="h-4 w-4" />
                          Track Progress
                        </button>
                      </div>

                      {/* Justification */}
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg sm:rounded-xl border border-gray-100">
                        <div className="flex items-start gap-2.5">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Justification</div>
                            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{r.justification}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* New Request Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in-0 duration-200">
            <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">New System Access Request</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Submit a request for system access</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              <form onSubmit={submit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">System</label>
                  <select 
                    value={selectedSystem} 
                    onChange={e => setSelectedSystem(e.target.value)} 
                    className="w-full border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    required
                  >
                    <option value="">Select a system</option>
                    {systems.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Justification</label>
                  <textarea 
                    value={justification} 
                    onChange={e => setJustification(e.target.value)} 
                    rows={4}
                    placeholder="Please explain why you need access to this system..."
                    className="w-full border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none" 
                    required 
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input 
                      type="datetime-local" 
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)} 
                      className="w-full border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input 
                      type="datetime-local" 
                      value={endDate} 
                      onChange={e => setEndDate(e.target.value)} 
                      className="w-full border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      disabled={isPermanent}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-purple-50 rounded-lg sm:rounded-xl border border-purple-200">
                  <input 
                    id="perm" 
                    type="checkbox" 
                    checked={isPermanent} 
                    onChange={e => setIsPermanent(e.target.checked)} 
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded transition-colors flex-shrink-0" 
                  />
                  <label htmlFor="perm" className="text-xs sm:text-sm font-medium text-purple-800 flex items-center gap-2">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Request permanent access to this system</span>
                  </label>
                </div>
                
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-4 sm:px-6 py-2.5 rounded-lg sm:rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm sm:text-base font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="px-4 sm:px-6 py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm sm:text-base font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Flow Modal */}
        {flowFor && (
          <FlowModal status={flowFor.status} onClose={() => setFlowFor(null)} />
        )}
      </div>
    </div>
  );
}