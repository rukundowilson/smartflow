"use client"
import NavBar from "../components/nav";
import SideBar from "../components/sidebar";
import { 
  UserMinus, 
} from 'lucide-react';

export default function AccessRevocation(){
    return(
        <>
            <div className="min-h-screen bg-[#F0F8F8]">
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