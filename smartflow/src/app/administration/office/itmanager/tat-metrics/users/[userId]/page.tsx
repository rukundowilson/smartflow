"use client";

import React, { useEffect, useMemo, useState } from "react";
import NavBar from "../../../../itmanager/components/navbar";
import SideBar from "../../../../itmanager/components/ITmanagerSideBar";
import { useSearchParams, useParams } from "next/navigation";
import { getAllTickets, ITTicket } from "@/app/services/itTicketService";
import systemAccessRequestService, { SystemAccessRequest } from "@/app/services/systemAccessRequestService";
import { Ticket, Key, X, Clock } from "lucide-react";

function diffHours(a?: string | null, b?: string | null): number | null { if(!a||!b) return null; const A=new Date(a).getTime(), B=new Date(b).getTime(); if(isNaN(A)||isNaN(B)) return null; return (B-A)/36e5; }
function fmt(d: string) { try { return new Date(d).toLocaleString(); } catch { return d; } }
function fmtH(n: number|null){ if(n===null) return '-'; return n<24?`${n.toFixed(1)}h`:`${(n/24).toFixed(1)}d`; }

export default function ITManagerActorDetail() {
  const params = useParams();
  const search = useSearchParams();
  const userId = Number(params?.userId);
  const name = search.get('name') || 'User';

  const [tickets, setTickets] = useState<ITTicket[]>([]);
  const [sars, setSars] = useState<SystemAccessRequest[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ITTicket | null>(null);
  const [selectedSar, setSelectedSar] = useState<SystemAccessRequest | null>(null);

  useEffect(()=>{
    let cancel=false;
    const load=async()=>{
      const [tRes, sRes] = await Promise.all([
        getAllTickets(),
        systemAccessRequestService.getCompleted(),
      ]);
      if(!cancel){ setTickets(tRes?.tickets||[]); setSars(sRes?.requests||[]);} }
    load(); return ()=>{cancel=true};
  },[]);

  const myTickets = useMemo(()=> tickets.filter(t => (t.reviewed_by===userId) && (t.status==='resolved'||t.status==='closed')), [tickets, userId]);

  const mySARs = useMemo(()=>{
    return sars.filter(r => (
      (r.it_support_id===userId) ||
      (r.line_manager_id===userId) ||
      (r.hod_id===userId) ||
      ((r as any).it_hod_id===userId) ||
      ((r as any).it_manager_id===userId)
    ));
  }, [sars, userId]);

  const TicketModal = () => {
    const t = selectedTicket; if (!t) return null;
    const tat = t.reviewed_at ? diffHours(t.created_at, t.reviewed_at) : null;
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/40" onClick={()=>setSelectedTicket(null)} />
        <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2"><Ticket className="h-5 w-5 text-blue-600"/><h3 className="text-lg font-semibold text-slate-900">Ticket #{t.id}</h3></div>
            <button onClick={()=>setSelectedTicket(null)} className="p-2 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-500"/></button>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-sm text-slate-700"><span className="font-semibold">{name}</span>: took <span className="font-semibold">{fmtH(tat)}</span> to review this ticket.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-xs text-slate-500">Issue</div><div className="text-sm font-semibold text-slate-900">{t.issue_type}</div></div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-xs text-slate-500">Status</div><div className="text-sm font-semibold text-slate-900">{t.status}</div></div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-xs text-slate-500">Owner</div><div className="text-sm font-semibold text-slate-900">{t.created_by_name}</div></div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-xs text-slate-500">Assignee</div><div className="text-sm font-semibold text-slate-900">{t.assigned_to_name || '-'}</div></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-xs text-slate-500">Created</div><div className="text-sm font-semibold text-slate-900">{fmt(t.created_at)}</div></div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-xs text-slate-500">Reviewed</div><div className="text-sm font-semibold text-slate-900">{t.reviewed_at?fmt(t.reviewed_at):'-'}</div></div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-xs text-slate-500">TAT</div><div className="text-sm font-semibold text-slate-900">{fmtH(tat)}</div></div>
            </div>
            <div className="flex items-center text-sm text-slate-600"><Clock className="h-4 w-4 mr-2"/>Timeline: {fmt(t.created_at)} → {t.reviewed_at?fmt(t.reviewed_at):'-'}</div>
          </div>
          <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex justify-end">
            <button onClick={()=>setSelectedTicket(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium">Close</button>
          </div>
        </div>
      </div>
    );
  };

  const SarModal = () => {
    const r = selectedSar; if (!r) return null;
    const total = fmtH(diffHours(r.submitted_at, (r as any).it_support_at || null));
    // Stage duration for this actor (fallback to total if unmatched)
    let stageDur: number | null = null;
    if (r.line_manager_id === userId) stageDur = diffHours(r.submitted_at, r.line_manager_at || null);
    else if (r.hod_id === userId) stageDur = diffHours(r.line_manager_at || undefined, r.hod_at || null);
    else if ((r as any).it_hod_id === userId) stageDur = diffHours(r.hod_at || undefined, (r as any).it_hod_at || null);
    else if ((r as any).it_manager_id === userId) stageDur = diffHours((r as any).it_hod_at || r.hod_at || undefined, (r as any).it_manager_at || null);
    else if ((r as any).it_support_id === userId) stageDur = diffHours((r as any).it_manager_at || r.submitted_at, (r as any).it_support_at || null);
    const stageText = fmtH(stageDur ?? diffHours(r.submitted_at, (r as any).it_support_at || null));
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/40" onClick={()=>setSelectedSar(null)} />
        <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:max-w-3xl bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2"><Key className="h-5 w-5 text-green-600"/><h3 className="text-lg font-semibold text-slate-900">Access Request #{r.id}</h3></div>
            <button onClick={()=>setSelectedSar(null)} className="p-2 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-500"/></button>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-sm text-slate-700"><span className="font-semibold">{name}</span>: took <span className="font-semibold">{stageText}</span> to review this request.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-xs text-slate-500">System</div><div className="text-sm font-semibold text-slate-900">{r.system_name}</div></div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-xs text-slate-500">Requester</div><div className="text-sm font-semibold text-slate-900">{r.user_name || 'User'}</div></div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-xs text-slate-500">Status</div><div className="text-sm font-semibold text-slate-900">{r.status}</div></div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-xs text-slate-500">Total TAT</div><div className="text-sm font-semibold text-slate-900">{total}</div></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-xs text-slate-500">Submitted</div><div className="text-sm font-semibold text-slate-900">{fmt(r.submitted_at)}</div></div>
              {r.line_manager_at && <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-xs text-slate-500">Line Manager</div><div className="text-sm font-semibold text-slate-900">{fmt(r.line_manager_at)}</div></div>}
              {r.hod_at && <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-xs text-slate-500">HOD</div><div className="text-sm font-semibold text-slate-900">{fmt(r.hod_at)}</div></div>}
              {(r as any).it_hod_at && <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-xs text-slate-500">IT HOD</div><div className="text-sm font-semibold text-slate-900">{fmt((r as any).it_hod_at)}</div></div>}
              {(r as any).it_manager_at && <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-xs text-slate-500">IT Manager</div><div className="text-sm font-semibold text-slate-900">{fmt((r as any).it_manager_at)}</div></div>}
              {(r as any).it_support_at && <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-xs text-slate-500">IT Support</div><div className="text-sm font-semibold text-slate-900">{fmt((r as any).it_support_at)}</div></div>}
            </div>
            {r.justification && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Justification</div>
                <div className="text-sm text-slate-800 whitespace-pre-wrap">{r.justification}</div>
              </div>
            )}
          </div>
          <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex justify-end">
            <button onClick={()=>setSelectedSar(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium">Close</button>
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
            <h1 className="text-2xl font-bold text-slate-900">{name}</h1>

            <section className="bg-white rounded-xl shadow-lg border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between"><div className="text-lg font-semibold text-slate-900 flex items-center"><Ticket className="h-5 w-5 text-blue-600 mr-2"/>Tickets Resolved/Closed</div><div className="text-xs text-slate-500">{myTickets.length}</div></div>
              <div className="divide-y divide-slate-100">
                {myTickets.length===0 ? (
                  <div className="px-6 py-6 text-sm text-slate-500">No tickets</div>
                ) : myTickets.map(t => {
                  const tat = t.reviewed_at ? diffHours(t.created_at, t.reviewed_at) : null;
                  return (
                    <button key={t.id} className="w-full text-left px-6 py-4 hover:bg-slate-50" onClick={()=>setSelectedTicket(t)}>
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-900">#{t.id} • {t.issue_type}</div>
                        <div className="text-sm text-slate-700">{fmtH(tat)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-lg border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between"><div className="text-lg font-semibold text-slate-900 flex items-center"><Key className="h-5 w-5 text-green-600 mr-2"/>Access Requests Acted On</div><div className="text-xs text-slate-500">{mySARs.length}</div></div>
              <div className="divide-y divide-slate-100">
                {mySARs.length===0 ? (
                  <div className="px-6 py-6 text-sm text-slate-500">No access requests</div>
                ) : mySARs.map(r => {
                  const total = fmtH(diffHours(r.submitted_at, (r as any).it_support_at || null));
                  return (
                    <button key={r.id} className="w-full text-left px-6 py-4 hover:bg-slate-50" onClick={()=>setSelectedSar(r)}>
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-900">#{r.id} • {r.system_name} • {r.status.toUpperCase()}</div>
                        <div className="text-sm text-slate-700">Total {total}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {selectedTicket && <TicketModal />}
            {selectedSar && <SarModal />}

          </main>
        </div>
      </div>
    </div>
  );
} 