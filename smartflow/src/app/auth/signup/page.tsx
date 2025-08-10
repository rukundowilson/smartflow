"use client"
import { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Shield, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import API from '@/app/utils/axios';
import Link from 'next/link';
import { getAllDepartments, Department } from '@/app/services/departmentService';
interface FormData {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department_id: number | null;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  department_id?: string;
}

type SubmitStatus = 'success' | 'error' | null;

export default function RegistrationPage() {
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department_id: null
  });
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  
  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await getAllDepartments();
        setDepartments(response.departments);
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoadingDepartments(false);
      }
    };
    
    fetchDepartments();
  }, []);
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);
  const [backendError, setBackendError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.department_id) {
      newErrors.department_id = 'Department selection is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsSubmitting(true);
  setSubmitStatus(null);
  setBackendError(''); // Clear any previous backend errors

  try {
    const payload = {
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      department_id: formData.department_id,
      is_verified: true,
    };

    const res = await API.post('/api/users/register', payload);

    console.log('Registration success:', res.data);
    setSubmitStatus('success');

    setFormData({
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      department_id: null,
    });
  } catch (error: any) {
    console.error('Registration error:', error.response?.data || error.message);
    
    // Extract backend error message with fallbacks
    let serverMessage = '';
    if (error.response?.data?.error) {
      serverMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      serverMessage = error.response.data.message;
    } else if (error.message) {
      serverMessage = error.message;
    } else if (error.code === 'NETWORK_ERROR') {
      serverMessage = 'Network error. Please check your connection and try again.';
    } else {
      serverMessage = 'Registration failed. Please try again.';
    }
    
    setBackendError(serverMessage);
    setSubmitStatus('error');
  } finally {
    setIsSubmitting(false);
  }
};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear backend error when user starts typing
    if (backendError) {
      setBackendError('');
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F0F4F7' }}>
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your registration request has been submitted successfully. HR will review your application and you'll receive an email notification within 24 hours.
          </p>
          <button
            onClick={() => setSubmitStatus(null)}
            className="w-full py-3 px-4 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#87CEEB', color: 'white' }}
            onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#00AEEF'}
            onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#87CEEB'}
          >
            Submit Another Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#F0F4F7' }}>
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Back to Login Button */}
        <div className="px-8 pt-8 pb-2 flex justify-start">
          <Link href="/" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>
        {/* Header */}
        <div className="px-8 pt-4 pb-6 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#87CEEB' }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">smartflow access application</h1>
          <p className="text-gray-600">Register to access ticketing, asset requests, and more</p>
        </div>
        {/* Form */}
        <div className="px-8 pb-8 space-y-6">
          {/* Backend Error Display */}
          {backendError && (
            <div className="mb-6 p-4 rounded-lg border-l-4 shadow-sm" 
                 style={{ 
                   backgroundColor: '#FEF2F2', 
                   borderLeftColor: '#EF4444',
                   border: '1px solid #FECACA'
                 }}>
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 mt-0.5 mr-3" style={{ color: '#EF4444' }} />
                <div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: '#991B1B' }}>Registration Error</h3>
                  <p className="text-sm" style={{ color: '#7F1D1D' }}>{backendError}</p>
                </div>
              </div>
            </div>
          )}
          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 transition-colors ${
                  errors.full_name 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.full_name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 transition-colors ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
                placeholder="Enter your email address"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 transition-colors ${
                  errors.password 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 transition-colors ${
                  errors.confirmPassword 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Department Selection */}
          <div>
            <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              id="department_id"
              name="department_id"
              value={formData.department_id || ''}
              onChange={handleInputChange}
              disabled={loadingDepartments}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.department_id 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
            >
              <option value="">Select a department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            {loadingDepartments && (
              <p className="mt-1 text-sm text-gray-500">Loading departments...</p>
            )}
            {errors.department_id && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.department_id}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{ backgroundColor: isSubmitting ? '#94A3B8' : '#87CEEB' }}
            onMouseEnter={(e) => !isSubmitting && ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#00AEEF')}
            onMouseLeave={(e) => !isSubmitting && ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#87CEEB')}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit Registration'
            )}
          </button>

          {/* Info Note */}
          <div className="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className="flex items-center justify-center">
              <AlertCircle className="w-4 h-4 mr-2 text-blue-500" />
              Registration requires HR approval. You'll receive an email within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}