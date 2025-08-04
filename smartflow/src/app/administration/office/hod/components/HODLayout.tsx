"use client"
import React from 'react';
import HodNavbar from './navbar';
import HodSidebar from './sidebar';

interface HODLayoutProps {
  children: React.ReactNode;
}

const HODLayout: React.FC<HODLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F0F8F8]">
      <HodNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row lg:gap-8">
          {/* Sidebar - Hidden on mobile, visible on large screens */}
          <HodSidebar />
          
          {/* Main Content - Full width on mobile, with sidebar on large screens */}
          <main className="flex-1 w-full lg:w-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default HODLayout; 