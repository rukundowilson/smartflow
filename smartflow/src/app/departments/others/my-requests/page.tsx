"use client"
import React from 'react';
import NavBar from "../components/navbar";
import SideBar from "../components/sidebar";
import Requisition from '@/app/components/allMyRe';

export default function MyRequests(){
    

    
    return(
        <div className="min-h-screen bg-[#F0F8F8]">
            <NavBar/>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex">
                    {/* Sidebar */}
                    <SideBar/>                    
                    {/* Main Content */}
                    <Requisition/>
                </div>
            </div>

          </div>
 )}