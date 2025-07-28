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
import { createItemRequisition } from '../services/itemRequisitionService';

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
        item_name: '',
        quantity: 1,
        justification: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e:any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getCurrentUser = () => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        }
        return null;
    };

    const handleSubmit = async (e:any) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const user = getCurrentUser();
            if (!user?.id) {
                throw new Error('User not found');
            }

            await createItemRequisition({
                requested_by: user.id,
                item_name: formData.item_name,
                quantity: formData.quantity,
                justification: formData.justification
            });

            // Reset form
            setFormData({
                item_name: '',
                quantity: 1,
                justification: ''
            });
            
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
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

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* ✅ Form Start */}
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Item Name *
          </label>
          <input
            type="text"
            name="item_name"
            value={formData.item_name}
            onChange={handleInputChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none disabled:bg-gray-50"
            placeholder="e.g., MacBook Pro, Wireless Mouse"
          />
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
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-2">
            Justification *
          </label>
          <textarea
            name="justification"
            value={formData.justification}
            onChange={handleInputChange}
            required
            disabled={loading}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] outline-none disabled:bg-gray-50"
            placeholder="Please explain why you need this item..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-[#00AEEF] hover:bg-[#00CEEB] text-white rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </button>
        </div>

      </form>
    </div>
  </div>
  );
}