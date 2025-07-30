"use client"
import React, { useState } from 'react';
import { 
  Package, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  MoreVertical,
  Menu,
} from 'lucide-react';
import NavBar from "../components/navbar"
import SideBar from "../components/sidebar"
import RequisationComponent from '@/app/components/manageRequisitions';

export default function Requisation(){
    return(
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
              {/* Enhanced Header */}
              <div className="bg-white sticky top-0 z-30">
                <NavBar/>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
                <div className="flex">
                  {/* Enhanced Sidebar */}
                  <div>
                    <SideBar/>
                  </div>
                  
                  <RequisationComponent/>
                </div>
              </div>
            </div>
        </>
    )
}