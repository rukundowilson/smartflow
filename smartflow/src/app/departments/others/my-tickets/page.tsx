"use client"
import React from 'react';
import NavBar from '../components/navbar';
import SideBar from '../components/sidebar';
import MyTickets from '@/app/components/my_tickets';

export default function MyTicketsPage(){
        return(
        <div className="min-h-screen bg-[#F0F8F8]">
            <NavBar/>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                <div className="flex flex-col lg:flex-row">
                    {/* Sidebar */}
                    <SideBar/>                    
                    <MyTickets/>                    
                </div>
            </div>
            
        </div>
    )
}