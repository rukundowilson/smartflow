"use client"
import React from 'react';
import RoleManagement from '../components/RoleManagement';
import HRNavbar from '../components/HRNavbar';
import HRSidebar from '../components/HRSidebar';

const HRRoleManagementPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F0F8F8]">
      <HRNavbar/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar */}
          <HRSidebar/>
          {/* Main Content */}
          <main className="flex-1">
            <RoleManagement />            
          </main>
        </div>
      </div>
    </div>
  );
};

export default HRRoleManagementPage; 