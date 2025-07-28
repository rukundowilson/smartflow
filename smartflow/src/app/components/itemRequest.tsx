"use client"
import { 
  Plus, 
  Eye,
  Laptop,
  Printer,
  Cable
} from 'lucide-react';

export default function ItemRequestMoadl({}){
    interface ActionButtonProps {
            icon: React.ElementType;
            label: string;
            onClick?: React.MouseEventHandler<HTMLButtonElement>;
            variant?: 'primary' | 'secondary';
          }
        
          const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, onClick, variant = 'primary' }) => {
            const baseClasses = "inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
            const variants = {
              primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
              secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-sky-500"
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
            {/* New Request Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Request New Equipment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Equipment Categories */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-sky-300 transition-colors cursor-pointer">
            <div className="text-center">
              <Laptop className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Computers</h4>
              <p className="text-sm text-gray-500">Laptops, Desktops, Tablets</p>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:border-sky-300 transition-colors cursor-pointer">
            <div className="text-center">
              <Printer className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Peripherals</h4>
              <p className="text-sm text-gray-500">Monitors, Keyboards, Mice</p>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:border-sky-300 transition-colors cursor-pointer">
            <div className="text-center">
              <Cable className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Accessories</h4>
              <p className="text-sm text-gray-500">Cables, Adapters, Stands</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Category</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500">
              <option>Select category...</option>
              <option>Laptop</option>
              <option>Desktop Computer</option>
              <option>Monitor</option>
              <option>Keyboard & Mouse</option>
              <option>Cables & Adapters</option>
              <option>Software License</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input 
              type="number" 
              min="1" 
              max="10" 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500"
              defaultValue="1"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Justification</label>
          <textarea 
            rows={3} 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-sky-500 focus:border-sky-500"
            placeholder="Please explain why you need this equipment..."
          ></textarea>
        </div>
        <ActionButton icon={Plus} label="Submit Request" />
      </div>
        </>
    )
}