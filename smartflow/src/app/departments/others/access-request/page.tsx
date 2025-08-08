"use client"
import React from 'react';
import NavBar from '../components/navbar';
import AccessRequestsPortal from '@/app/components/myAccessRequests';

const AccessRequestDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar/>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="w-full">
          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 lg:border-0 lg:shadow-none lg:bg-transparent">
            <AccessRequestsPortal/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessRequestDashboard;