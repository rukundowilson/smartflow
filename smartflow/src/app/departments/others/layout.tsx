"use client";

import React from 'react';
import RoleGuard from '@/app/components/RoleGuard';

export default function OthersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard
      allowedDepartments={['Finance Department', 'Marketing Department']}
      requireAuth={true}
      redirectTo="/"
    >
      {children}
    </RoleGuard>
  );
} 