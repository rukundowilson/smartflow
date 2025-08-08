"use client"
import React from 'react';
import NavBar from '../components/nav';
import SideBar from '../components/sidebar';
import SystemManagement from '@/app/components/SystemManagement';

const SystemsPage: React.FC = () => {
  return (
    <>
      <div className="min-h-screen bg-[#F0F8F8]">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex">
            {/* Sidebar */}
            <SideBar />
            {/* Main Content */}
            <main className="flex-1">
              <SystemManagement />
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default SystemsPage; 