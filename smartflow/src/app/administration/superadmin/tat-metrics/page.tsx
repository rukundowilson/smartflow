"use client";

import React from "react";
import NavBar from "../components/nav";
import SideBar from "../components/sidebar";
import TATExplorer from "@/app/components/TATExplorer";
import { Activity } from "lucide-react";

export default function SuperAdminTATMetrics() {
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