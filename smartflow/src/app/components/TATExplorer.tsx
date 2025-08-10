"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/contexts/auth-context";
import { getAllTickets, ITTicket } from "@/app/services/itTicketService";
import systemAccessRequestService, { SystemAccessRequest } from "@/app/services/systemAccessRequestService";
import { Key, Ticket, Clock, X, CheckCircle, User, ChevronRight, Calendar, Timer, BarChart3, SlidersHorizontal } from "lucide-react";

type ExplorerProps = {
  title?: string;
  showTickets?: boolean;
  showAccessRequests?: boolean;
  className?: string;
};

function diffHours(a?: string | null, b?: string | null): number | null {
  if (!a || !b) return null;
  const start = new Date(a).getTime();
  const end = new Date(b).getTime();
  if (isNaN(start) || isNaN(end)) return null;
  return (end - start) / (1000 * 60 * 60);
}

function fmtDate(d?: string | null) {
  if (!d) return "-";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "-" : dt.toLocaleString();
}

function fmtHours(h: number | null) {
  if (h === null || !isFinite(h)) return "-";
  if (h < 24) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
}

export default function TATExplorer({ title = "Completed Workflows", showTickets = true, showAccessRequests = true, className = "" }: ExplorerProps) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<ITTicket[]>([]);
  const [sar, setSar] = useState<SystemAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{ type: 'ticket' | 'sar'; item: any } | null>(null);
  const [dataset, setDataset] = useState<'tickets'|'sar'>(showAccessRequests && !showTickets ? 'sar' : 'tickets');
  const [mode, setMode] = useState<'total'|'stage'>('total');
  const stageOptions = [
    { key: 'submitted_to_lm', label: 'Submitted → Line Manager' },
    { key: 'lm_to_hod', label: 'Line Manager → HOD' },
    { key: 'hod_to_it_hod', label: 'HOD → IT HOD' },
    { key: 'it_hod_to_it_mgr', label: 'IT HOD → IT Manager' },
    { key: 'it_mgr_to_it_support', label: 'IT Manager → IT Support' },
  ] as const;
  const [selectedStage, setSelectedStage] = useState<typeof stageOptions[number]['key']>('submitted_to_lm');

  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [tRes, sRes] = await Promise.all([
          showTickets ? getAllTickets() : Promise.resolve({ success: true, tickets: [] }),
          showAccessRequests ? systemAccessRequestService.getITSupportQueue({ user_id: Number(user?.id) || 0 }) : Promise.resolve({ success: true, requests: [] })
        ]);
        if (!isCancelled) {
          setTickets((tRes as any)?.tickets || []);
          setSar((sRes as any)?.requests || []);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    load();
    return () => { isCancelled = true; };
  }, [user?.id, showTickets, showAccessRequests]);

  const completedTickets = useMemo(() => tickets.filter(t => t.status === 'resolved' || t.status === 'closed'), [tickets]);
  const completedSAR = useMemo(() => sar.filter(r => (r.status === 'granted' || r.status === 'rejected') && (r as any).it_support_at), [sar]);

  // Metrics helpers
  const avg = (arr: number[]) => arr.length ? arr.reduce((s,n)=>s+n,0)/arr.length : 0;
  const med = (arr: number[]) => {
    if (!arr.length) return 0; const a=[...arr].sort((a,b)=>a-b); const m=Math.floor(a.length/2); return a.length%2?a[m]:(a[m-1]+a[m])/2;
  };
  const pctl = (arr: number[], p: number) => { if(!arr.length)return 0; const a=[...arr].sort((a,b)=>a-b); const idx=Math.min(a.length-1, Math.max(0, Math.floor((p/100)*a.length))); return a[idx]; };
  const distro = (arr: number[]) => {
    const buckets = [
      { label: '<4h', test: (h: number)=>h<4 },
      { label: '4-24h', test: (h: number)=>h>=4&&h<24 },
      { label: '1-3d', test: (h: number)=>h>=24&&h<72 },
      { label: '3-7d', test: (h: number)=>h>=72&&h<168 },
      { label: '>7d', test: (h: number)=>h>=168 },
    ];
    return buckets.map(b=>({ label:b.label, count: arr.filter(b.test).length }));
  };

  // Tickets total durations
  const ticketDurations = useMemo(()=> completedTickets
    .map(t => t.reviewed_at ? diffHours(t.created_at, t.reviewed_at) : null)
    .filter((n): n is number => n!==null && isFinite(n as number)) as number[]
  , [completedTickets]);

  // SAR stage durations and total
  const sarTotalDurations = useMemo(()=> completedSAR
    .map(r => diffHours(r.submitted_at, (r as any).it_support_at || null))
    .filter((n): n is number => n!==null && isFinite(n as number)) as number[]
  , [completedSAR]);

  const sarStageDurations = useMemo(()=>{
    const map: Record<string, number[]> = {
      submitted_to_lm: [], lm_to_hod: [], hod_to_it_hod: [], it_hod_to_it_mgr: [], it_mgr_to_it_support: []
    };
    completedSAR.forEach(r => {
      const t0=r.submitted_at, t1=r.line_manager_at||null, t2=r.hod_at||null, t3=(r as any).it_hod_at||null, t4=(r as any).it_manager_at||null, t5=(r as any).it_support_at||null;
      const s1=diffHours(t0,t1); if(s1!==null) map.submitted_to_lm.push(s1);
      const s2=diffHours(t1||undefined,t2||undefined); if(s2!==null) map.lm_to_hod.push(s2);
      const s3=diffHours(t2||undefined,t3||undefined); if(s3!==null) map.hod_to_it_hod.push(s3);
      const s4=diffHours(t3||undefined,t4||undefined); if(s4!==null) map.it_hod_to_it_mgr.push(s4);
      const s5=diffHours(t4||undefined,t5||undefined); if(s5!==null) map.it_mgr_to_it_support.push(s5);
    });
    return map;
  }, [completedSAR]);

  const metricsSource: number[] = useMemo(()=>{
    if (dataset==='tickets') return ticketDurations;
    if (mode==='total') return sarTotalDurations;
    return sarStageDurations[selectedStage] || [];
  }, [dataset, mode, selectedStage, ticketDurations, sarTotalDurations, sarStageDurations]);

  const metrics = useMemo(()=>({
    avg: avg(metricsSource), med: med(metricsSource), p90: pctl(metricsSource,90), distro: distro(metricsSource)
  }), [metricsSource]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'text-slate-700' }: { icon: any; title: string; value: string; subtitle?: string; color?: string; }) => (
    <div className="bg-white rounded-xl p-4 shadow border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
    </div>
  );

  const DistBar = ({ data }: { data: { label: string; count: number }[] }) => {
    const total = data.reduce((s,d)=>s+d.count,0)||1;
    return (
      <div className="bg-white rounded-xl p-4 shadow border border-slate-200">
        <div className="flex items-center mb-2"><BarChart3 className="h-4 w-4 text-slate-600 mr-2"/><h3 className="text-sm font-semibold text-slate-900">Time Distribution</h3></div>
        <div className="flex items-end gap-3 h-28">
          {data.map(d=>{
            const h = Math.max(2, Math.round((d.count/total)*110));
            return (
              <div key={d.label} className="flex flex-col items-center">
                <div className="w-9 bg-indigo-500/80 rounded-md" style={{height:`${h}px`}} />
                <span className="mt-1 text-[10px] text-slate-600">{d.label}</span>
                <span className="text-[10px] text-slate-500">{d.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const TicketRow = ({ t }: { t: ITTicket }) => {
    const tat = t.reviewed_at ? diffHours(t.created_at, t.reviewed_at) : null;
    return (
      <button onClick={() => setSelected({ type: 'ticket', item: t })} className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition flex items-center justify-between">
        <div className="flex items-center min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mr-3"><Ticket className="h-4 w-4"/></div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">Ticket #{t.id} • {t.issue_type}</div>
            <div className="text-xs text-slate-500 truncate">{t.created_by_name} • {fmtDate(t.created_at)}</div>
          </div>
        </div>
        <div className="flex items-center text-xs text-slate-600 whitespace-nowrap">
          <Clock className="h-4 w-4 mr-1"/>{fmtHours(tat)}<ChevronRight className="h-4 w-4 ml-2 text-slate-400"/>
        </div>
      </button>
    );
  };

  const SarRow = ({ r }: { r: SystemAccessRequest }) => {
    const total = diffHours(r.submitted_at, (r as any).it_support_at || null);
    return (
      <button onClick={() => setSelected({ type: 'sar', item: r })} className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition flex items-center justify-between">
        <div className="flex items-center min-w-0">
          <div className="w-9 h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mr-3"><Key className="h-4 w-4"/></div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">Request #{r.id} • {r.system_name}</div>
            <div className="text-xs text-slate-500 truncate">{r.user_name || 'User'} • {fmtDate(r.submitted_at)}</div>
          </div>
        </div>
        <div className="flex items-center text-xs text-slate-600 whitespace-nowrap">
          <Clock className="h-4 w-4 mr-1"/>{fmtHours(total)}<ChevronRight className="h-4 w-4 ml-2 text-slate-400"/>
        </div>
      </button>
    );
  };

  const TimelineRow = ({ label, at, prev }: { label: string; at?: string | null; prev?: string | null }) => {
    const delta = at && prev ? diffHours(prev, at) : null;
    return (
      <div className="flex items-start gap-3">
        <div className="mt-1 w-2 h-2 rounded-full bg-slate-400" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-800">{label}</div>
          <div className="text-xs text-slate-500">{fmtDate(at)}{delta !== null && ` • +${fmtHours(delta)}`}</div>
        </div>
      </div>
    );
  };

  const Modal = () => {
    if (!selected) return null;
    const onClose = () => setSelected(null);

    const isTicket = selected.type === 'ticket';
    const t: ITTicket | null = isTicket ? selected.item as ITTicket : null;
    const r: SystemAccessRequest | null = !isTicket ? selected.item as SystemAccessRequest : null;

    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:max-w-2xl sm:h-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isTicket ? <Ticket className="h-5 w-5 text-blue-600"/> : <Key className="h-5 w-5 text-green-600"/>}
              <h3 className="text-lg font-semibold text-slate-900">{isTicket ? `Ticket #${t!.id}` : `Access Request #${r!.id}`}</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-500"/></button>
          </div>

          <div className="p-5 space-y-4">
            {isTicket && t && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Issue</div>
                    <div className="text-sm font-semibold text-slate-900">{t.issue_type}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Owner</div>
                    <div className="text-sm font-semibold text-slate-900">{t.created_by_name}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Status</div>
                    <div className="text-sm font-semibold text-slate-900">{t.status}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Total TAT</div>
                    <div className="text-sm font-semibold text-slate-900">{fmtHours(t.reviewed_at ? diffHours(t.created_at, t.reviewed_at) : null)}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <TimelineRow label="Submitted" at={t.created_at} />
                  <TimelineRow label="Resolved/Closed" at={t.reviewed_at} prev={t.created_at} />
                </div>
              </>
            )}

            {!isTicket && r && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">System</div>
                    <div className="text-sm font-semibold text-slate-900">{r.system_name}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Requester</div>
                    <div className="text-sm font-semibold text-slate-900">{r.user_name || 'User'}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Status</div>
                    <div className="text-sm font-semibold text-slate-900">{r.status}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Total TAT</div>
                    <div className="text-sm font-semibold text-slate-900">{fmtHours(diffHours(r.submitted_at, (r as any).it_support_at || null))}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <TimelineRow label="Submitted" at={r.submitted_at} />
                  <TimelineRow label="Line Manager" at={r.line_manager_at} prev={r.submitted_at} />
                  <TimelineRow label="HOD" at={r.hod_at} prev={r.line_manager_at} />
                  <TimelineRow label="IT HOD" at={(r as any).it_hod_at} prev={r.hod_at} />
                  <TimelineRow label="IT Manager" at={(r as any).it_manager_at} prev={(r as any).it_hod_at || r.hod_at} />
                  <TimelineRow label={r.status === 'granted' ? 'Granted by IT Support' : 'Rejected by IT Support'} at={(r as any).it_support_at} prev={(r as any).it_manager_at} />
                </div>
              </>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium">Close</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-5 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {loading && <span className="text-xs text-slate-500">Loading…</span>}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-3 shadow border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-500"/>
          <span className="text-sm text-slate-700">Dataset:</span>
          <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
            <button onClick={()=>setDataset('tickets')} className={`px-3 py-1.5 text-sm ${dataset==='tickets'?'bg-slate-900 text-white':'bg-white text-slate-700'}`}>Tickets</button>
            <button onClick={()=>setDataset('sar')} className={`px-3 py-1.5 text-sm ${dataset==='sar'?'bg-slate-900 text-white':'bg-white text-slate-700'}`}>Access Requests</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-700">Mode:</span>
          <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
            <button onClick={()=>setMode('total')} className={`px-3 py-1.5 text-sm ${mode==='total'?'bg-slate-900 text-white':'bg-white text-slate-700'}`}>By Request (Total)</button>
            <button onClick={()=>setMode('stage')} disabled={dataset==='tickets'} className={`px-3 py-1.5 text-sm ${mode==='stage'&&dataset!=='tickets'?'bg-slate-900 text-white':'bg-white text-slate-700 disabled:opacity-50'}`}>Per Stage</button>
          </div>
          {dataset==='sar' && mode==='stage' && (
            <select value={selectedStage} onChange={e=>setSelectedStage(e.target.value as any)} className="ml-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg">
              {stageOptions.map(opt=>(<option key={opt.key} value={opt.key}>{opt.label}</option>))}
            </select>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Clock} title="Average TAT" value={fmtHours(metrics.avg)} color="text-indigo-600" />
        <StatCard icon={Timer} title="Median TAT" value={fmtHours(metrics.med)} color="text-blue-600" />
        <StatCard icon={CheckCircle} title="90th Percentile" value={fmtHours(metrics.p90)} color="text-emerald-600" />
      </div>
      <DistBar data={metrics.distro} />

      {/* Lists */}
      {(showTickets && dataset==='tickets') && (
        <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Ticket className="h-5 w-5 text-blue-600"/><h3 className="text-sm font-semibold text-slate-900">Completed Tickets</h3></div>
            <div className="text-xs text-slate-500">{completedTickets.length}</div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {completedTickets.length === 0 ? (
              <div className="text-xs text-slate-500">No completed tickets.</div>
            ) : completedTickets.map(t => <TicketRow key={t.id} t={t} />)}
          </div>
        </div>
      )}

      {(showAccessRequests && dataset==='sar') && (
        <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Key className="h-5 w-5 text-green-600"/><h3 className="text-sm font-semibold text-slate-900">Completed System Access Requests</h3></div>
            <div className="text-xs text-slate-500">{completedSAR.length}</div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {completedSAR.length === 0 ? (
              <div className="text-xs text-slate-500">No completed access requests.</div>
            ) : completedSAR.map(r => <SarRow key={r.id} r={r} />)}
          </div>
        </div>
      )}

      <Modal />
    </div>
  );
} 