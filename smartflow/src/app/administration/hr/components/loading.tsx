"use client"
import React from 'react';
import { Loader2 } from 'lucide-react';

const HRLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F0F8F8] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading HR Portal...</p>
      </div>
    </div>
  );
};

export default HRLoading; 