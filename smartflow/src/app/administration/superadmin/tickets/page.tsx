"use client"
import { useState,useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit
} from 'lucide-react';
import SideBar from '../components/sidebar';
import NavBar from '../components/nav';


const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'in progress': return 'text-blue-600 bg-blue-50';
      case 'resolved':
      case 'approved':
      case 'completed': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

interface TableHeaderProps {
    columns: string[];
    onSelectAll?: React.ChangeEventHandler<HTMLInputElement>;
    selectedCount: number;
    totalCount: number;
  }

const TableHeader: React.FC<TableHeaderProps> = ({ columns, onSelectAll, selectedCount, totalCount }) => (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left">
          <input 
            type="checkbox" 
            onChange={onSelectAll}
            checked={selectedCount === totalCount}
            className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
          />
        </th>
        {columns.map((col, idx) => (
          <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {col}
          </th>
        ))}
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );


interface ActionButtonProps {
    icon: React.ElementType;
    label: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    variant?: 'primary' | 'secondary' | 'danger';
  }

const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, onClick, variant = 'primary' }) => {
    const baseClasses = "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = {
      primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
      secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-sky-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
    };
    
    return (
      <button onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
        <Icon className="h-4 w-4 mr-2" />
        {label}
      </button>
    );
  };

const tickets = [
    { id: 'T001', title: 'Computer won\'t start', employee: 'John Smith', priority: 'High', status: 'Open', created: '2025-07-19' },
    { id: 'T002', title: 'Email sync issues', employee: 'Sarah Johnson', priority: 'Medium', status: 'In Progress', created: '2025-07-18' },
    { id: 'T003', title: 'Software installation request', employee: 'Mike Davis', priority: 'Low', status: 'Resolved', created: '2025-07-17' },
  ];

export default function Ticketing(){
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const [showDropdownForm, setShowDropdownForm] = useState(false);
    const toggleDropdownForm = () => setShowDropdownForm(prev => !prev);

        
    
    return(
        <>
            {/* Header */}
            <div className="min-h-screen bg-[#F0F8F8]">
                <NavBar/>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex">
                    
                    {/* Sidebar */}
                    <SideBar/>
                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900">IT Tickets</h2>
                                <div className="flex space-x-3">
                                <div className="relative">
                                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                                    <input
                                    type="text"
                                    placeholder="Search tickets..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                                <ActionButton icon={Filter} label="Filter" variant="secondary" />
                                <div className="relative">
                                  <ActionButton icon={Plus} label="New Ticket" onClick={toggleDropdownForm} />
                                  {showDropdownForm && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                      <form className="p-4 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">New Ticket</h3>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700">Title</label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700">Employee</label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700">Priority</label>
                                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500">
                                            <option>High</option>
                                            <option>Medium</option>
                                            <option>Low</option>
                                          </select>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                          <button
                                            type="button"
                                            onClick={() => setShowDropdownForm(false)}
                                            className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            type="submit"
                                            className="px-4 py-2 text-sm bg-sky-600 text-white rounded hover:bg-sky-700"
                                          >
                                            Submit
                                          </button>
                                        </div>
                                      </form>
                                    </div>
                                  )}
                                </div>


                                </div>
                            </div>

                            <div className="bg-white shadow-sm rounded-lg border border-gray-100">
                                <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <TableHeader 
                                    columns={['Ticket ID', 'Title', 'Employee', 'Priority', 'Status', 'Created']}
                                    selectedCount={selectedTickets.length}
                                    totalCount={tickets.length}
                                    />
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {tickets.map(ticket => (
                                        <tr key={ticket.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <input 
                                            type="checkbox" 
                                            className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{ticket.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{ticket.employee}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{ticket.created}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button className="text-sky-600 hover:text-sky-900">
                                            <Eye className="h-4 w-4" />
                                            </button>
                                            <button className="text-gray-600 hover:text-gray-900">
                                            <Edit className="h-4 w-4" />
                                            </button>
                                        </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                </div>
                            </div>
                        </div>
                    </main>
                    </div>
                </div>
            </div>

            {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Ticket</h3>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input type="text" className="w-full px-3 py-2 border rounded-md focus:ring-sky-500 focus:border-sky-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Employee</label>
          <input type="text" className="w-full px-3 py-2 border rounded-md focus:ring-sky-500 focus:border-sky-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select className="w-full px-3 py-2 border rounded-md focus:ring-sky-500 focus:border-sky-500">
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={closeModal} className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-sm bg-sky-600 text-white rounded hover:bg-sky-700">
            Submit
          </button>
        </div>
      </form>
      <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg">&times;</button>
    </div>
  </div>
)}

        </>
    )
}