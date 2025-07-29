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

              {/* Enhanced Mobile Bottom Actions - Fixed positioning */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl">
                <div className="px-4 py-3 pb-safe">
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl font-semibold shadow-lg shadow-sky-500/25 hover:shadow-xl transition-all">
                      <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="truncate">Mark Delivered</span>
                    </button>
                    <button className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold shadow-lg shadow-gray-500/25 hover:shadow-xl transition-all">
                      <Truck className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="truncate">Schedule</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </>
    )
}