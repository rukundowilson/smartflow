"use client"
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  X,
  Calendar,
  User,
  AlertCircle
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
      <th className="px-3 sm:px-6 py-3 text-left">
        <input 
          type="checkbox" 
          onChange={onSelectAll}
          checked={selectedCount === totalCount}
          className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
        />
      </th>
      {columns.map((col, idx) => (
        <th key={idx} className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {col}
        </th>
      ))}
      <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  icon: Icon, 
  label, 
  onClick, 
  variant = 'primary',
  className = ""
}) => {
  const baseClasses = "inline-flex items-center px-2 sm:px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-sky-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };
  
  return (
    <button onClick={onClick} className={`${baseClasses} ${variants[variant]} ${className}`}>
      <Icon className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

interface TicketCardProps {
  ticket: {
    id: string;
    title: string;
    employee: string;
    priority: string;
    status: string;
    created: string;
  };
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, isSelected, onSelect }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-3">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={() => onSelect(ticket.id)}
          className="rounded border-gray-300 text-sky-600 focus:ring-sky-500 mt-1"
        />
        <div>
          <h3 className="font-medium text-gray-900">{ticket.id}</h3>
          <p className="text-sm text-gray-600 mt-1">{ticket.title}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button className="text-sky-600 hover:text-sky-900 p-1">
          <Eye className="h-4 w-4" />
        </button>
        <button className="text-gray-600 hover:text-gray-900 p-1">
          <Edit className="h-4 w-4" />
        </button>
      </div>
    </div>
    
    <div className="space-y-2">
      <div className="flex items-center text-sm text-gray-600">
        <User className="h-4 w-4 mr-2" />
        {ticket.employee}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-gray-400" />
          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority}
          </span>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
          {ticket.status}
        </span>
      </div>
      <div className="flex items-center text-sm text-gray-500">
        <Calendar className="h-4 w-4 mr-2" />
        {ticket.created}
      </div>
    </div>
  </div>
);

const tickets = [
  { id: 'T001', title: 'Computer won\'t start', employee: 'John Smith', priority: 'High', status: 'Open', created: '2025-07-19' },
  { id: 'T002', title: 'Email sync issues', employee: 'Sarah Johnson', priority: 'Medium', status: 'In Progress', created: '2025-07-18' },
  { id: 'T003', title: 'Software installation request', employee: 'Mike Davis', priority: 'Low', status: 'Resolved', created: '2025-07-17' },
];

export default function Ticketing() {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDropdownForm, setShowDropdownForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const toggleDropdownForm = () => setShowDropdownForm(prev => !prev);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTickets(tickets.map(t => t.id));
    } else {
      setSelectedTickets([]);
    }
  };

  const handleSelectTicket = (id: string) => {
    setSelectedTickets(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F0F8F8]">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex">
          <SideBar />
          
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">IT Tickets</h2>
                
                {/* Search and Actions */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <ActionButton icon={Filter} label="Filter" variant="secondary" />
                    
                    <div className="relative">
                      <ActionButton icon={Plus} label="New Ticket" onClick={toggleDropdownForm} />
                      {showDropdownForm && (
                        <>
                          {/* Mobile: Full screen overlay */}
                          <div className="fixed inset-0 bg-white/70 bg-opacity-50 z-50 sm:hidden" onClick={() => setShowDropdownForm(false)} />
                          <div className="fixed inset-x-4 top-20 bg-white border border-gray-200 rounded-lg shadow-lg z-50 sm:hidden">
                            <div className="p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">New Ticket</h3>
                                <button
                                  onClick={() => setShowDropdownForm(false)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                              
                              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowDropdownForm(false); }}>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Title</label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Employee</label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500">
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                  </select>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => setShowDropdownForm(false)}
                                    className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-4 py-2 text-sm bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors"
                                  >
                                    Submit
                                  </button>
                                </div>
                              </form>
                            </div>
                          </div>

                          {/* Desktop: Regular dropdown */}
                          <div className="hidden sm:block absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                            <div className="p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">New Ticket</h3>
                                <button
                                  onClick={() => setShowDropdownForm(false)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                              
                              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowDropdownForm(false); }}>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Title</label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Employee</label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500">
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                  </select>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => setShowDropdownForm(false)}
                                    className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-4 py-2 text-sm bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors"
                                  >
                                    Submit
                                  </button>
                                </div>
                              </form>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block bg-white shadow-sm rounded-lg border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <TableHeader 
                      columns={['Ticket ID', 'Title', 'Employee', 'Priority', 'Status', 'Created']}
                      onSelectAll={handleSelectAll}
                      selectedCount={selectedTickets.length}
                      totalCount={filteredTickets.length}
                    />
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTickets.map(ticket => (
                        <tr key={ticket.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input 
                              type="checkbox" 
                              checked={selectedTickets.includes(ticket.id)}
                              onChange={() => handleSelectTicket(ticket.id)}
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

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {/* Select All for Mobile */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={selectedTickets.length === filteredTickets.length}
                        className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {selectedTickets.length > 0 
                          ? `${selectedTickets.length} selected`
                          : 'Select all'
                        }
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Ticket Cards */}
                {filteredTickets.map(ticket => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    isSelected={selectedTickets.includes(ticket.id)}
                    onSelect={handleSelectTicket}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create New Ticket</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
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
                <div className="flex justify-end space-x-2 pt-4">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 text-sm bg-sky-600 text-white rounded hover:bg-sky-700">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}