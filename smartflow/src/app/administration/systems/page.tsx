"use client"
import React from 'react';
import SystemManagement from '@/app/components/SystemManagement';

const SystemsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F0F8F8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <SystemManagement />
      </div>
    </div>
  );
};

export default SystemsPage; 