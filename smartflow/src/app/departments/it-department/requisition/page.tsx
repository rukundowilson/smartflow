"use client"
import React from 'react';
import NavBar from "../components/navbar"
import SideBar from "../components/sidebar"
import ITItemRequests from '@/app/components/itItemRequests';

export default function Requisation(){
    return(
        <>
            <div className="min-h-screen bg-[#F0F8F8]">
              {/* Header */}
              <div className="bg-white sticky top-0 z-30">
                <NavBar/>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex">
                  {/* Sidebar */}
                  <SideBar/>
                  
                  {/* Main Content */}
                  <ITItemRequests/>
                </div>
              </div>
            </div>
        </>
    )
}