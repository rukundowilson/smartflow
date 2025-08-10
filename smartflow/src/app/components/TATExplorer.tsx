"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/contexts/auth-context";
import { getAllTickets, ITTicket } from "@/app/services/itTicketService";
import systemAccessRequestService, { SystemAccessRequest } from "@/app/services/systemAccessRequestService";
import { Key, Ticket, Clock, X, CheckCircle, User, ChevronRight, Calendar, Timer } from "lucide-react";

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

      {showTickets && (
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

      {showAccessRequests && (
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