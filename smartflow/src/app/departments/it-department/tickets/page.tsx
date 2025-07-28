"use client"
import React from 'react';
import NavBar from "../components/navbar"
import SideBar from "../components/sidebar"
import ITTicketManager from '@/app/components/itTicketManager';

export default function OverView(){
    return(
        <div className="min-h-screen bg-[#F0F8F8]">
            <NavBar/>
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
                <div className="flex flex-col lg:flex-row">
                    {/* Sidebar - Hidden on mobile, shown on larger screens */}
                    <div className="hidden lg:block">
                        <SideBar/> 
                    </div>
                    
                    {/* Main Content */}
                    <main className="flex-1 lg:ml-4 min-w-0">
                        <ITTicketManager />
                    </main>
                </div>
            </div>
        </div>
    );
}