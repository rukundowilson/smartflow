"use client";

import React, { useEffect, useMemo, useState } from "react";
import NavBar from "../components/navbar";
import SideBar from "../components/sidebar";
import { useAuth } from "@/app/contexts/auth-context";
import { getAllTickets, ITTicket } from "@/app/services/itTicketService";
import systemAccessRequestService, { SystemAccessRequest } from "@/app/services/systemAccessRequestService";
import { Activity } from "lucide-react";
import TATExplorer from "@/app/components/TATExplorer";

// removed local stats; using reusable TATExplorer component

export default function TATMetricsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<ITTicket[]>([]);
  const [sar, setSar] = useState<SystemAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      try {
        const [tRes, sRes] = await Promise.all([
          getAllTickets(),
          systemAccessRequestService.getITSupportQueue({ user_id: Number(user?.id) || 0 })
        ]);
        if (!isCancelled) {
          setTickets(tRes?.tickets || []);
          setSar(sRes?.requests || []);
        }
      } catch {
        if (!isCancelled) {
          setTickets([]);
          setSar([]);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    load();
    return () => { isCancelled = true; };
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-[#F0F8F8]">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          <SideBar />
          <main className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center"><Activity className="h-6 w-6 text-indigo-600 mr-2"/>Turnaround Time (TAT) Explorer</h1>
            </div>
            <TATExplorer title="Completed Workflows" />
          </main>
        </div>
      </div>
    </div>
  );
} 