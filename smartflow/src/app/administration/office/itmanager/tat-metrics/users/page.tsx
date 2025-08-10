"use client";

import React from "react";
import NavBar from "../../components/navbar";
import SideBar from "../../components/ITmanagerSideBar";

export default function ITManagerUserMetrics() {
  return (
    <div className="min-h-screen bg-[#F0F8F8]">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          <SideBar />
          <main className="flex-1 space-y-4">
            <h1 className="text-xl font-semibold text-slate-900">Users Metrics</h1>
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <p className="text-sm text-slate-600">Users TAT metrics are not available for IT Support. This section is currently a placeholder.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 