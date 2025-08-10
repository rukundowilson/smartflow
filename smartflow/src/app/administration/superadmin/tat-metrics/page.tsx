"use client";

import React from "react";
import NavBar from "../components/nav";
import SideBar from "../components/sidebar";
import Link from "next/link";
import { Activity, Ticket, Key, Users } from "lucide-react";

export default function SuperAdminTATHub() {
  return (
    <div className="min-h-screen bg-[#F0F8F8]">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          <SideBar />
          <main className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center"><Activity className="h-6 w-6 text-indigo-600 mr-2"/>Turnaround Time (TAT)</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/administration/superadmin/tat-metrics/tickets" className="group block p-6 bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition">
                <div className="flex items-center">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mr-4"><Ticket className="h-5 w-5"/></div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">Tickets Metrics</div>
                    <div className="text-sm text-slate-600">View TAT metrics for tickets</div>
                  </div>
                </div>
              </Link>
              <Link href="/administration/superadmin/tat-metrics/access-requests" className="group block p-6 bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition">
                <div className="flex items-center">
                  <div className="w-11 h-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mr-4"><Key className="h-5 w-5"/></div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">Access Requests Metrics</div>
                    <div className="text-sm text-slate-600">View TAT metrics for system access requests</div>
                  </div>
                </div>
              </Link>
              <Link href="/administration/superadmin/tat-metrics/users" className="group block p-6 bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition">
                <div className="flex items-center">
                  <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mr-4"><Users className="h-5 w-5"/></div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">User Metrics</div>
                    <div className="text-sm text-slate-600">Per-actor completed items and TAT</div>
                  </div>
                </div>
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 