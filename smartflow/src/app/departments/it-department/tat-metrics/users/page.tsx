"use client";

import React, { useEffect, useMemo, useState } from "react";
import NavBar from "../../components/navbar";
import SideBar from "../../components/sidebar";
import { getAllTickets, ITTicket } from "@/app/services/itTicketService";
import systemAccessRequestService, { SystemAccessRequest } from "@/app/services/systemAccessRequestService";
import { Users, Wrench, Key, User, Star, Activity } from "lucide-react";
import Link from "next/link";

function diffHours(a?: string | null, b?: string | null): number | null {
  if (!a || !b) return null;
  const A = new Date(a).getTime(); const B = new Date(b).getTime();
  if (isNaN(A) || isNaN(B)) return null; return (B - A) / 36e5;
}
function fmtHours(h: number) { if (!isFinite(h)) return "-"; return h < 24 ? `${h.toFixed(1)}h` : `${(h/24).toFixed(1)}d`; }

type ActorRow = { 
  id: number | null; 
  name: string; 
  tickets: { count: number; avg: number }; 
  requests: { count: number; avg: number };
  totalActivity: number;
  role: string;
};

export default function UserMetrics() {
  const [tickets, setTickets] = useState<ITTicket[]>([]);
  const [sars, setSars] = useState<SystemAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      setLoading(true);
      try {
        const [tRes, sResCompleted] = await Promise.all([
          getAllTickets(),
          systemAccessRequestService.getCompleted(),
        ]);
        if (!cancel) {
          setTickets(tRes?.tickets || []);
          setSars(sResCompleted?.requests || []);
        }
      } finally { if (!cancel) setLoading(false); }
    };
    load();
    return () => { cancel = true; };
  }, []);

  const ticketByReviewer = useMemo(() => {
    type Entry = { id: number | null; name: string; durations: number[] };
    const grouped = new Map<string, Entry>();
    tickets.filter(t => t.status === 'resolved' || t.status === 'closed').forEach(t => {
      const id = (t as any).reviewed_by ?? null;
      const name = t.reviewed_by_name || 'Unknown';
      const key = `${id ?? 'null'}::${name}`;
      const dur = t.reviewed_at ? diffHours(t.created_at, t.reviewed_at) : null;
      if (dur !== null) {
        const existing = grouped.get(key);
        const entry: Entry = existing ? existing : { id, name, durations: [] };
        entry.durations = [...entry.durations, dur];
        grouped.set(key, entry);
      }
    });
    return grouped;
  }, [tickets]);

  const sarByActor = useMemo(() => {
    type Entry = { id: number | null; name: string; durations: number[] };
    const map = new Map<string, Entry>();
    const push = (id: number | null | undefined, name: string | undefined, from?: string | null, to?: string | null) => {
      if (!name) return; const dur = diffHours(from || undefined, to || null); if (dur === null) return;
      const key = `${id ?? 'null'}::${name}`;
      const existing = map.get(key);
      const entry: Entry = existing ? existing : { id: id ?? null, name, durations: [] };
      entry.durations = [...entry.durations, dur];
      map.set(key, entry);
    };
    sars.forEach(r => {
      // IT Support finisher (total)
      push((r as any).it_support_id, r.it_support_name || 'IT Support', r.submitted_at, r.it_support_at || null);
      // Approver stages (optional)
      push(r.line_manager_id, (r as any).line_manager_name, r.submitted_at, r.line_manager_at || null);
      push(r.hod_id, (r as any).hod_name, r.line_manager_at || undefined, r.hod_at || null);
      push((r as any).it_hod_id, (r as any).it_hod_name, r.hod_at || undefined, (r as any).it_hod_at || null);
      push((r as any).it_manager_id, (r as any).it_manager_name, (r as any).it_hod_at || r.hod_at || undefined, (r as any).it_manager_at || null);
    });
    return map;
  }, [sars]);

  const rows: ActorRow[] = useMemo(() => {
    const result: ActorRow[] = [];
    const keys = new Set<string>([...ticketByReviewer.keys(), ...sarByActor.keys()]);
    const avg = (arr: number[]) => arr.length ? arr.reduce((s,x)=>s+x,0)/arr.length : 0;
    keys.forEach(k => {
      const t = ticketByReviewer.get(k);
      const r = sarByActor.get(k);
      const id = t?.id ?? r?.id ?? null;
      const name = t?.name ?? r?.name ?? 'Unknown';
      const tArr = t?.durations || [];
      const rArr = r?.durations || [];
      const totalActivity = tArr.length + rArr.length;
      
      // Determine role based on activity
      let role = 'User';
      if (totalActivity >= 50) role = 'Super User';
      else if (totalActivity >= 20) role = 'Active User';
      else if (totalActivity >= 5) role = 'Regular User';
      
      result.push({ 
        id, 
        name, 
        tickets: { count: tArr.length, avg: avg(tArr) }, 
        requests: { count: rArr.length, avg: avg(rArr) },
        totalActivity,
        role
      });
    });
    return result.sort((a,b)=> (b.tickets.count + b.requests.count) - (a.tickets.count + a.requests.count));
  }, [ticketByReviewer, sarByActor]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Super User': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Active User': return 'bg-green-100 text-green-800 border-green-200';
      case 'Regular User': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityBadgeColor = (total: number) => {
    if (total >= 50) return 'bg-red-100 text-red-800 border-red-200';
    if (total >= 20) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (total >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-[#F0F8F8]">
      <NavBar />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row">
          <SideBar />
          <main className="flex-1 space-y-4 sm:space-y-6 lg:ml-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 mr-2"/>
                User Metrics
              </h1>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                <div className="text-base sm:text-lg font-semibold text-slate-900">IT Staff & Approvers</div>
                <div className="text-xs text-slate-500">Completed items only</div>
              </div>
              
              {/* Mobile Card View */}
              <div className="block lg:hidden">
                {rows.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="text-slate-500">No completed items yet.</div>
                  </div>
                ) : (
                  <div className="space-y-3 p-3">
                    {rows.map(r => {
                      const href = r.id != null ? `/departments/it-department/tat-metrics/users/${r.id}?name=${encodeURIComponent(r.name)}` : undefined;
                      return (
                        <div key={`${r.id ?? 'null'}::${r.name}`} className="bg-slate-50 rounded-lg p-4 space-y-3">
                          {/* User Info */}
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <User className="h-5 w-5 text-slate-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-900 truncate">
                                  {href ? (
                                    <Link href={href} className="text-sky-700 hover:underline">{r.name}</Link>
                                  ) : (
                                    r.name
                                  )}
                                </span>
                                {r.id && (
                                  <span className="text-xs text-slate-500 font-mono">#{r.id}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(r.role)}`}>
                              <Star className="h-3 w-3 mr-1 flex-shrink-0" />
                              {r.role}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getActivityBadgeColor(r.totalActivity)}`}>
                              <Activity className="h-3 w-3 mr-1 flex-shrink-0" />
                              {r.totalActivity} items
                            </span>
                          </div>

                          {/* Metrics */}
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-xs text-slate-600">
                                <Wrench className="h-3 w-3 text-blue-600" />
                                <span>Tickets</span>
                              </div>
                              <div className="text-sm font-medium text-slate-900">
                                {r.tickets.count} • {fmtHours(r.tickets.avg)}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-xs text-slate-600">
                                <Key className="h-3 w-3 text-green-600" />
                                <span>Requests</span>
                              </div>
                              <div className="text-sm font-medium text-slate-900">
                                {r.requests.count} • {fmtHours(r.requests.avg)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50 text-left text-sm text-slate-600">
                    <tr>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Role & Activity</th>
                      <th className="px-6 py-3"><div className="inline-flex items-center gap-2"><Wrench className="h-4 w-4 text-blue-600"/>Tickets (count / avg)</div></th>
                      <th className="px-6 py-3"><div className="inline-flex items-center gap-2"><Key className="h-4 w-4 text-green-600"/>Access Requests (count / avg)</div></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {rows.length === 0 ? (
                      <tr><td className="px-6 py-6 text-slate-500" colSpan={4}>No completed items yet.</td></tr>
                    ) : rows.map(r => {
                      const href = r.id != null ? `/departments/it-department/tat-metrics/users/${r.id}?name=${encodeURIComponent(r.name)}` : undefined;
                      return (
                        <tr key={`${r.id ?? 'null'}::${r.name}`} className="hover:bg-slate-50">
                          <td className="px-6 py-3">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-slate-600" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-900">
                                  {href ? (
                                    <Link href={href} className="text-sky-700 hover:underline">{r.name}</Link>
                                  ) : (
                                    r.name
                                  )}
                                </span>
                                {r.id && (
                                  <span className="text-xs text-slate-500 font-mono">#{r.id}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex flex-col space-y-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(r.role)}`}>
                                <Star className="h-3 w-3 mr-1" />
                                {r.role}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getActivityBadgeColor(r.totalActivity)}`}>
                                <Activity className="h-3 w-3 mr-1" />
                                {r.totalActivity} items
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-slate-700">
                            <div className="flex items-center space-x-2">
                              <span>{r.tickets.count}</span>
                              <span className="text-slate-400">•</span>
                              <span>{fmtHours(r.tickets.avg)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-slate-700">
                            <div className="flex items-center space-x-2">
                              <span>{r.requests.count}</span>
                              <span className="text-slate-400">•</span>
                              <span>{fmtHours(r.requests.avg)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
} 