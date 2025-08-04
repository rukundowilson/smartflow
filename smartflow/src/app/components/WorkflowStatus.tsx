"use client"
import React from 'react';
import { Check, Clock, X, User, Shield, Building2, CheckCircle, XCircle } from 'lucide-react';

interface WorkflowStatusProps {
  status: string;
  className?: string;
}

const WorkflowStatus: React.FC<WorkflowStatusProps> = ({ status }) => {
  const steps = [
    { name: 'Request', icon: Clock, color: 'bg-gray-500' },
    { name: 'Line Manager', icon: User, color: 'bg-yellow-500' },
    { name: 'HOD', icon: Shield, color: 'bg-orange-500' },
    { name: 'IT Manager', icon: Building2, color: 'bg-blue-500' },
    { name: 'IT Department', icon: CheckCircle, color: 'bg-green-500' }
  ];

  const getCurrentStep = (status: string): number => {
    switch (status) {
      case 'pending_manager_approval':
      case 'pending_line_manager':
        return 1; // Line Manager
      case 'pending_hod':
        return 2; // HOD
      case 'pending_it_manager':
        return 3; // IT Manager
      case 'pending_it_review':
        return 4; // IT Department
      case 'ready_for_assignment':
        return 4; // IT Department (final step)
      case 'granted':
        return 4; // Completed (final step)
      case 'rejected':
        return -1; // Rejected
      default:
        return 0; // Request submitted (initial step)
    }
  };

  const currentStep = getCurrentStep(status);

  if (status === 'rejected') {
    return (
      <div className="flex items-center space-x-2">
        <XCircle className="h-4 w-4 text-red-500" />
        <span className="text-sm font-medium text-red-700">Rejected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <div key={index} className="flex items-center">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
              isCompleted 
                ? 'bg-green-500 text-white' 
                : isCurrent 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {isCompleted ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <StepIcon className="h-3 w-3" />
              )}
            </div>
            <span className={`ml-2 text-xs font-medium ${
              isCompleted 
                ? 'text-green-700' 
                : isCurrent 
                ? 'text-blue-700' 
                : 'text-gray-500'
            }`}>
              {step.name}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-2 ${
                isCompleted ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WorkflowStatus; 