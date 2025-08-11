"use client";

import React from "react";
import NavBar from "../../components/nav";
import SideBar from "../../components/sidebar";
import UserMetricsInner from "@/app/departments/it-department/tat-metrics/users/page";

export default function SuperAdminUserMetrics() {
  return (
    <div className="min-h-screen bg-[#F0F8F8]">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          <SideBar />
          <main className="flex-1">
            <UserMetricsInner />
          </main>
        </div>
      </div>
    </div>
  );
} 