"use client"
import { useState } from 'react';
import { 
  Plus, 
  Eye,
  Laptop,
  Printer,
  Cable,
    XCircle,
} from 'lucide-react';

interface ItemRequestModalProps {
  isModalOpen: boolean;
  onClose: () => void;
  title?: string;
}


export default function ItemRequestModal({ 
  isModalOpen, 
  onClose, 
  title = "Request New Equipment"
}: ItemRequestModalProps) {
  const [formData, setFormData] = useState({
        item: '',
        category: '',
        quantity: 1,
        reason: '',
        priority: 'medium'
    });
    const handleInputChange = (e:any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e:any) => {
        e.preventDefault();
        setFormData({
            item: '',
            category: '',
            quantity: 1,
            reason: '',
            priority: 'medium'
        });
        onClose()
    };
    
  if (!isModalOpen) return null;

  interface ActionButtonProps {
    icon: React.ElementType;
    label: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    variant?: 'primary' | 'secondary';
  }

  const ActionButton: React.FC<ActionButtonProps> = ({ 
    icon: Icon, 
    label, 
    onClick, 
    variant = 'primary'
  }) => {
    const baseClasses = "inline-flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto";
    const variants = {
      primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
      secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-sky-500"
    };
    
    return (
      <button 
        onClick={onClick} 
        className={`${baseClasses} ${variants[variant]}`}
      >
        <Icon className="h-4 w-4 mr-2" />
        {label}
      </button>
    );
  };

  return (
  <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/10 pt-24" onClick={onClose}>
    <div 
      className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl border border-gray-200 animate-in slide-in-from-top-2 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#333]">New Item Request</h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="h-6 w-6" />
        </button>
      </div>

      {/* ✅ Form Start */}
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Item Name *
          </label>
          <input
            type="text"
            name="item"
            value={formData.item}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none"
            placeholder="e.g., MacBook Pro, Wireless Mouse"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none bg-white text-gray-700"
          >
            <option value="">Select Category</option>
            <option value="Laptop">Laptop</option>
            <option value="Desktop">Desktop</option>
            <option value="Monitor">Monitor</option>
            <option value="Printer">Printer</option>
            <option value="Accessories">Accessories</option>
            <option value="Software">Software</option>
            <option value="Cables">Cables</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Quantity *
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            min="1"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none bg-white text-gray-700"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Reason for Request *
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none"
            placeholder="Please explain why you need this item..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-[#00AEEF] hover:bg-[#00CEEB] text-white rounded-lg transition-colors duration-200"
          >
            Submit Request
          </button>
        </div>

      </form>
    </div>
  </div>
  );
}