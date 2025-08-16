"use client";

import React from 'react';
import RoleGuard from '@/app/components/RoleGuard';
import SystemAccessRequests from '@/app/components/SystemAccessRequests';

export default function AccessRequestPage() {
  return (
    <RoleGuard
      requireAuth={true}
      redirectTo="/"
    >
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              System Access Requests
            </h1>
            <SystemAccessRequests />
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}