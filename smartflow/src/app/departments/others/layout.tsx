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
      requireAuth={true}
      redirectTo="/"
    >
      {children}
    </RoleGuard>
  );
} 