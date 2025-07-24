"use client";
import { useState } from 'react';
import { 
  Plus, 
  Eye,
  CheckCircle,
  XCircle,
  X,
  Calendar,
  User,
  Shield,
  Building,
  ChevronDown,
  Menu,
  Search
} from 'lucide-react';
import NavBar from '../components/nav';
import SideBar from '../components/sidebar';

type AccessFormData = {
  employeeName: string;
  systems: string[];
  department: string;
  requestType: string;
  priority: string;
  justification: string;
  startDate: string;
  endDate: string;
};

export default function UserManagement(){
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);

    const [formData, setFormData] = useState<AccessFormData>({
      employeeName: '',
      department: '',
      requestType: '',
      systems: [],
      priority: 'Medium',
      justification: '',
      startDate: '',
      endDate: ''
    });
    

    const accessRequests = [
      { id: 'AR001', employee: 'Alice Brown', requestedBy: 'HR Team', systems: ['CRM', 'Payroll'], status: 'Pending', created: '2025-07-19', department: 'Human Resources' },
      { id: 'AR002', employee: 'Bob Wilson', requestedBy: 'IT Manager', systems: ['Admin Panel'], status: 'Approved', created: '2025-07-18', department: 'IT' },
      { id: 'AR003', employee: 'Carol Smith', requestedBy: 'Finance Lead', systems: ['Financial System', 'Reporting'], status: 'Pending', created: '2025-07-17', department: 'Finance' },
    ];

    const systemOptions = [
      'CRM System',
      'Payroll System', 
      'Admin Panel',
      'Financial System',
      'HR Portal',
      'Project Management',
      'Reporting Dashboard',
      'Document Management',
      'VPN Access',
      'Email System'
    ];

    const departments = ['Human Resources', 'IT', 'Finance', 'Marketing', 'Sales', 'Operations', 'Legal'];
    const requestTypes = ['New Access', 'Access Modification', 'Access Extension', 'Temporary Access'];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];

    const getStatusColor = (status : any) => {
      switch (status.toLowerCase()) {
        case 'pending': return 'text-amber-700 bg-amber-50 border-amber-200';
        case 'approved': 
        case 'completed': return 'text-green-700 bg-green-50 border-green-200';
        case 'rejected': return 'text-red-700 bg-red-50 border-red-200';
        default: return 'text-gray-700 bg-gray-50 border-gray-200';
      }
    };

    const handleInputChange = (field : any, value : any) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleSystemToggle = (system : any) => {
      setFormData(prev => ({
        ...prev,
        systems: prev.systems.includes(system) 
          ? prev.systems.filter(s => s !== system)
          : [...prev.systems, system]
      }));
    };

    const handleSubmit = (e : any) => {
      e.preventDefault();
      console.log('Form submitted:', formData);
      setIsModalOpen(false);
      // Reset form
      setFormData({
        employeeName: '',
        department: '',
        requestType: '',
        systems: [],
        priority: 'Medium',
        justification: '',
        startDate: '',
        endDate: ''
      });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar/>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
                <div className="flex">
                    <SideBar/>
                    {isSidebarOpen && (
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}
                    
                    <main className="flex-1 lg:ml-4">
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                                <div>
                                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Access Requests</h2>
                                    <p className="text-sm text-gray-600 mt-1">Manage system access requests and approvals</p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                  {/* Registration Toggle */}
                                  <div className="flex items-center justify-between sm:justify-start bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                                      <div className="flex items-center space-x-3">
                                          <div className="flex flex-col">
                                              <span className="text-sm font-medium text-gray-700">Registration</span>
                                              <span className="text-xs text-gray-500">
                                                  {isRegistrationOpen ? 'Applications Open' : 'Applications Closed'}
                                              </span>
                                          </div>
                                          
                                          {/* Toggle Switch */}
                                          <button
                                              onClick={() => setIsRegistrationOpen(!isRegistrationOpen)}
                                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
                                                  isRegistrationOpen 
                                                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                                      : 'bg-gray-300'
                                              }`}
                                              role="switch"
                                              aria-checked={isRegistrationOpen}
                                              aria-label="Toggle registration applications"
                                          >
                                              <span
                                                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                                                      isRegistrationOpen ? 'translate-x-6' : 'translate-x-1'
                                                  }`}
                                              />
                                          </button>
                                      </div>
                                  </div>
                            </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-amber-100 rounded-lg">
                                            <Calendar className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-500">Pending</p>
                                            <p className="text-2xl font-semibold text-gray-900">2</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-500">Approved</p>
                                            <p className="text-2xl font-semibold text-gray-900">1</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Shield className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-500">Total</p>
                                            <p className="text-2xl font-semibold text-gray-900">3</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <User className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-500">This Week</p>
                                            <p className="text-2xl font-semibold text-gray-900">3</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 lg:px-6 py-3 text-left">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                                                />
                                            </th>
                                            <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                                            <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                            <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                            <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Systems</th>
                                            <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                            <th className="px-3 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {accessRequests.map(request => (
                                            <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-3 lg:px-6 py-4">
                                                    <input 
                                                        type="checkbox" 
                                                        className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                                                    />
                                                </td>
                                                <td className="px-3 lg:px-6 py-4 text-sm font-medium text-gray-900">{request.id}</td>
                                                <td className="px-3 lg:px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{request.employee}</div>
                                                </td>
                                                <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">{request.department}</td>
                                                <td className="px-3 lg:px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {request.systems.slice(0, 2).map(system => (
                                                            <span key={system} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {system}
                                                            </span>
                                                        ))}
                                                        {request.systems.length > 2 && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                +{request.systems.length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-3 lg:px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                                                        {request.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 lg:px-6 py-4 text-sm text-gray-500">{request.created}</td>
                                                <td className="px-3 lg:px-6 py-4 text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        {request.status === 'Pending' && (
                                                            <>
                                                                <button className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors">
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </button>
                                                                <button className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors">
                                                                    <XCircle className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button className="p-1 text-sky-600 hover:text-sky-900 hover:bg-sky-50 rounded transition-colors">
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile/Tablet Card View */}
                            <div className="lg:hidden">
                                {/* Mobile Header with Select All */}
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Select All</span>
                                    </div>
                                    <span className="text-sm text-gray-500">{accessRequests.length} requests</span>
                                </div>

                                {/* Card Layout */}
                                <div className="divide-y divide-gray-200">
                                    {accessRequests.map(request => (
                                        <div key={request.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <input 
                                                        type="checkbox" 
                                                        className="rounded border-gray-300 text-sky-600 focus:ring-sky-500 mt-1"
                                                    />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{request.employee}</div>
                                                        <div className="text-xs text-gray-500">{request.id}</div>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                                <div>
                                                    <span className="text-gray-500 block text-xs">Department</span>
                                                    <span className="text-gray-900">{request.department}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block text-xs">Created</span>
                                                    <span className="text-gray-900">{request.created}</span>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <span className="text-gray-500 block text-xs mb-1">Systems</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {request.systems.slice(0, 3).map(system => (
                                                        <span key={system} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {system}
                                                        </span>
                                                    ))}
                                                    {request.systems.length > 3 && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            +{request.systems.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                <div className="flex space-x-2">
                                                    {request.status === 'Pending' && (
                                                        <>
                                                            <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors">
                                                                <CheckCircle className="h-3 w-3 mr-1.5" />
                                                                Approve
                                                            </button>
                                                            <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
                                                                <XCircle className="h-3 w-3 mr-1.5" />
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                                <button className="p-1.5 text-sky-600 hover:text-sky-900 hover:bg-sky-50 rounded transition-colors">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}