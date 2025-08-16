"use client";

import React from 'react';
import RoleGuard from '@/app/components/RoleGuard';
import MyTickets from '@/app/components/my_tickets';

export default function MyTicketsPage() {
  return (
    <RoleGuard
      requireAuth={true}
      redirectTo="/"
    >
      <MyTickets />
    </RoleGuard>
  );
}