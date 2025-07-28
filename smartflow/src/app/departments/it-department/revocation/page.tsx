"use client"
import React, { useState } from 'react';
import { 
  UserMinus
} from 'lucide-react';
import NavBar from "../components/navbar"
import SideBar from "../components/sidebar"

export default function OverView(){
      interface ActionButtonProps {
        icon: React.ElementType;
        label: string;
        onClick?: React.MouseEventHandler<HTMLButtonElement>;
        variant?: 'primary' | 'secondary' | 'danger' | 'success';
      }
    
      const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, onClick, variant = 'primary' }) => {
        const baseClasses = "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
        const variants = {
          primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
          secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-sky-500",
          danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
          success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
        };
        
        return (
          <button onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </button>
        );
      };
    return(
        <>
            <div className="min-h-screen bg-[#F0F8F8]">
      {/* Header */}
      <NavBar/>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar */}
          <SideBar/>
          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 text-center">
                <UserMinus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Access Revocation</h3>
                <p className="text-gray-500">Manage access revocation requests and security compliance.</p>
              </div>
            
          </main>
        </div>
      </div>
    </div>
        </>
    )
}