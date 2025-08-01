"use client"
import React from 'react';
import SideBar from '../components/sidebar';
import NavBar from '../components/navbar';
import AccessRequestsPortal from '@/app/components/myAccessRequests';

const AccessRequestDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="flex">
          <SideBar/>
          <div className="flex-1">
            <AccessRequestsPortal/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessRequestDashboard;