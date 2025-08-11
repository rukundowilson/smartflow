"use client";

import React, { useEffect, useMemo, useState } from "react";
import NavBar from "../../components/navbar";
import SideBar from "../../components/sidebar";
import { getAllTickets, ITTicket } from "@/app/services/itTicketService";
import systemAccessRequestService, { SystemAccessRequest } from "@/app/services/systemAccessRequestService";
import { Users, Wrench, Key } from "lucide-react";
import Link from "next/link";

function diffHours(a?: string | null, b?: string | null): number | null {
  if (!a || !b) return null;
  const A = new Date(a).getTime(); const B = new Date(b).getTime();
  if (isNaN(A) || isNaN(B)) return null; return (B - A) / 36e5;
}
function fmtHours(h: number) { if (!isFinite(h)) return "-"; return h < 24 ? `${h.toFixed(1)}h` : `${(h/24).toFixed(1)}d`; }

type ActorRow = { id: number | null; name: string; tickets: { count: number; avg: number }; requests: { count: number; avg: number } };

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
      result.push({ id, name, tickets: { count: tArr.length, avg: avg(tArr) }, requests: { count: rArr.length, avg: avg(rArr) } });
    });
    return result.sort((a,b)=> (b.tickets.count + b.requests.count) - (a.tickets.count + a.requests.count));
  }, [ticketByReviewer, sarByActor]);

  return (
    <div className="min-h-screen bg-[#F0F8F8]">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          <SideBar />
          <main className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center"><Users className="h-6 w-6 text-indigo-600 mr-2"/>User Metrics</h1>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="text-lg font-semibold text-slate-900">IT Staff & Approvers</div>
                <div className="text-xs text-slate-500">Completed items only</div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50 text-left text-sm text-slate-600">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3"><div className="inline-flex items-center gap-2"><Wrench className="h-4 w-4 text-blue-600"/>Tickets (count / avg)</div></th>
                      <th className="px-6 py-3"><div className="inline-flex items-center gap-2"><Key className="h-4 w-4 text-green-600"/>Access Requests (count / avg)</div></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {rows.length === 0 ? (
                      <tr><td className="px-6 py-6 text-slate-500" colSpan={3}>No completed items yet.</td></tr>
                    ) : rows.map(r => {
                      const href = r.id != null ? `/departments/it-department/tat-metrics/users/${r.id}?name=${encodeURIComponent(r.name)}` : undefined;
                      return (
                        <tr key={`${r.id ?? 'null'}::${r.name}`} className="hover:bg-slate-50">
                          <td className="px-6 py-3 font-semibold text-slate-900">
                            {href ? (
                              <Link href={href} className="text-sky-700 hover:underline">{r.name}</Link>
                            ) : (
                              r.name
                            )}
                          </td>
                          <td className="px-6 py-3 text-slate-700">{r.tickets.count} • {fmtHours(r.tickets.avg)}</td>
                          <td className="px-6 py-3 text-slate-700">{r.requests.count} • {fmtHours(r.requests.avg)}</td>
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