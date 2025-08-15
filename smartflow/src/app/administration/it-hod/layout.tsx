"use client";

import React from 'react';
import RoleGuard from '@/app/components/RoleGuard';

export default function ITHODLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard
      allowedRoles={['HOD']}
      allowedDepartments={['IT Department']}
      requireAuth={true}
      redirectTo="/"
    >
      {children}
    </RoleGuard>
  );
} 