"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import NavBar from "../components/navbar";
import SideBar from "../components/sidebar";
import Requisition from '@/app/components/allMyRe';
import AccessRequestsPortal from '@/app/components/myAccessRequests';
import { Key, Package, Menu } from 'lucide-react';

export default function MyRequests(){
    const [activeTab, setActiveTab] = useState<'access' | 'other'>('access');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    // Set active tab based on URL or default to access
    useEffect(() => {
        // Use Next.js searchParams instead of window.location
        const tab = searchParams.get('tab');
        if (tab === 'other') {
            setActiveTab('other');
        } else {
            setActiveTab('access');
        }
    }, [searchParams]);

    const handleTabChange = (tab: 'access' | 'other') => {
        setActiveTab(tab);
        // Update URL without page reload
        const newUrl = `/departments/others/my-requests?tab=${tab}`;
        router.push(newUrl, { scroll: false });
    };
    
    return(
        <div className="min-h-screen bg-[#F0F8F8]">
            <NavBar/>
            
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="bg-white p-2 rounded-lg shadow-lg border border-gray-200"
                >
                    <Menu className="h-6 w-6 text-gray-600" />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <SideBar />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
                <div className="flex">
                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block">
                        <SideBar/>
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 w-full">
                        {/* Page Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Requests</h1>
                            <p className="text-gray-600">Manage your access requests and other requisitions</p>
                        </div>

                        {/* Tab Navigation */}
                        <div className="mb-6">
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                                    <button
                                        onClick={() => handleTabChange('access')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                                            activeTab === 'access'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Key className="h-4 w-4" />
                                        <span className="hidden sm:inline">Access Requests</span>
                                        <span className="sm:hidden">Access</span>
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('other')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                                            activeTab === 'other'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Package className="h-4 w-4" />
                                        <span className="hidden sm:inline">Other Requests</span>
                                        <span className="sm:hidden">Other</span>
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
                            {activeTab === 'access' ? (
                                <div className="p-4 sm:p-6">
                                    <AccessRequestsPortal />
                                </div>
                            ) : (
                                <div className="p-4 sm:p-6">
                                    <Requisition />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}