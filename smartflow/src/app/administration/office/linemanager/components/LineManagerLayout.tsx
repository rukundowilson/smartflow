"use client"
import React from 'react';
import LineManagerNavbar from './LineManagerNavbar';
import LineManagerSidebar from './LineManagerSidebar';

interface LineManagerLayoutProps {
  children: React.ReactNode;
}

const LineManagerLayout: React.FC<LineManagerLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F0F8F8]">
      <LineManagerNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row lg:gap-8">
          {/* Sidebar - Hidden on mobile, visible on large screens */}
          <LineManagerSidebar />
          
          {/* Main Content - Full width on mobile, with sidebar on large screens */}
          <main className="flex-1 w-full lg:w-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default LineManagerLayout; 