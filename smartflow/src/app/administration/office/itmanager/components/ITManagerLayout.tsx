"use client"
import React from 'react';
import { Building2, Users, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ITManagerNavbar from './navbar';
import ITManagerSidebar from './ITmanagerSideBar';

interface ITManagerLayoutProps {
  children: React.ReactNode;
}

export default function ITManagerLayout({ children }: ITManagerLayoutProps) {
  const router = useRouter();

  const navigation = [
    {
      name: 'Overview',
      href: '/administration/office/itmanager',
      icon: Building2,
      current: true
    },
    {
      name: 'Assignments',
      href: '/administration/office/itmanager/assignments',
      icon: Users,
      current: false
    }
  ];


  return (
    <div className="min-h-screen bg-[#F0F8F8]">
      {/* Navigation */}
      <ITManagerNavbar/>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="flex flex-col lg:flex-row">
        <ITManagerSidebar/>
      {/* Main content */}
      <main>{children}</main>
      </div>
      </div>
    </div>
  );
} 