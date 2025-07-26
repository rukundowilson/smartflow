"use client"
import React, { useState } from 'react';
import { AlertCircle, User, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { login } from './services/auth/loginService';
import { useRouter } from "next/navigation";
import { redirectByDepartment } from './helpers/redirects';

interface LoginFormData {
  personalEmail: string;
  employeeId: string;
  password: string;
}

const ITSystemLogin: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    personalEmail: '',
    employeeId: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  
  // Mock state for registration link - in real app this would come from API
  const [registrationOpen, setRegistrationOpen] = useState(true);

  const router = useRouter();

  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};
    
    if (!formData.personalEmail) {
      newErrors.personalEmail = 'Personal email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.personalEmail)) {
      newErrors.personalEmail = 'Please enter a valid email address';
    }
    
    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee ID is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    setTimeout(async() => {
      console.log('Login attempt:', formData);
      try {
        const { token, user } = await login(formData);
        localStorage.setItem("token", token);
        redirectByDepartment(user.department, router);
      } catch (err) {
        console.log("catch error", err);
      }
      setIsLoading(false);
    }, 1500);
  };
  
  const handleRegisterClick = () => {
    window.location.href = "/auth/signup"
  };

  return (
<div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F0F8F0' }}>
  <div className="w-full max-w-md">
    {/* Registration Notice */}
    {registrationOpen && (
      <div className="mb-6 p-4 rounded-lg border-l-4 shadow-sm" 
           style={{ 
             backgroundColor: '#E8F4FD', 
             borderLeftColor: '#2196F3',
             border: '1px solid #B3E5FC'
           }}>
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 mt-0.5 mr-3" style={{ color: '#2196F3' }} />
          <div>
            <h3 className="font-semibold text-sm mb-1" style={{ color: '#333' }}>
              New Employee Registration Open
            </h3>
            <p className="text-sm" style={{ color: '#666' }}>
              New employees can now register for system access. Registration links expire after 24 hours.
            </p>
            <button
              onClick={handleRegisterClick}
              className="mt-2 text-sm font-medium underline hover:no-underline transition-all"
              style={{ color: '#2196F3' }}
            >
              Apply for Registration →
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Login Form */}
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
             style={{ backgroundColor: '#2196F3' }}>
          <User className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#333' }}>
          Wellcome back to smartflow
        </h1>
        <p className="text-sm" style={{ color: '#666' }}>
          Access your IT ticketing, requests, and system management
        </p>
      </div>

      <div className="space-y-6">
        {/* Personal Email */}
        <div>
          <label htmlFor="personalEmail" className="block text-sm font-medium mb-2" style={{ color: '#333' }}>
            Personal Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#666' }} />
            <input
              type="email"
              id="personalEmail"
              name="personalEmail"
              value={formData.personalEmail}
              onChange={handleInputChange}
              className="w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                borderColor: errors.personalEmail ? '#ef4444' : '#ddd'
              }}
              placeholder="your.email@company.com"
            />
          </div>
          {errors.personalEmail && (
            <p className="mt-1 text-sm" style={{ color: '#ef4444' }}>
              {errors.personalEmail}
            </p>
          )}
        </div>

        {/* Employee ID */}
        <div>
          <label htmlFor="employeeId" className="block text-sm font-medium mb-2" style={{ color: '#333' }}>
            Employee ID
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#666' }} />
            <input
              type="text"
              id="employeeId"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              className="w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                borderColor: errors.employeeId ? '#ef4444' : '#ddd'
              }}
            />
          </div>
          {errors.employeeId && (
            <p className="mt-1 text-sm" style={{ color: '#ef4444' }}>
              {errors.employeeId}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#333' }}>
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#666' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-11 pr-11 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                borderColor: errors.password ? '#ef4444' : '#ddd'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" style={{ color: '#666' }} />
              ) : (
                <Eye className="w-4 h-4" style={{ color: '#666' }} />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm" style={{ color: '#ef4444' }}>
              {errors.password}
            </p>
          )}
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: '#2196F3',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#00AEEF';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#2196F3';
            }
          }}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Signing in...
            </div>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm">
          <a href="#" className="hover:underline transition-colors" style={{ color: '#2196F3' }}>
            Forgot your password?
          </a>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-center" style={{ color: '#666' }}>
            Need help? Contact IT Support at{' '}
            <a href="mailto:it-support@company.com" className="hover:underline" style={{ color: '#2196F3' }}>
              it-support@company.com
            </a>
          </p>
        </div>
      </div>
    </div>

    {/* System Info */}
    <div className="mt-4 text-center text-xs" style={{ color: '#666' }}>
      <p>IT Management System v2.0</p>
      <p>Ticketing • Access Management • Asset Tracking</p>
    </div>
  </div>
</div>
  );
};

export default ITSystemLogin;