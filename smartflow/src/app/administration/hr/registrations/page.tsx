"use client"
import React from 'react';
import HRLayout from '../components/HRLayout';
import EmployeeRegistrations from '../components/EmployeeRegistrations';

const EmployeeRegistrationsPage: React.FC = () => {
  return (
    <HRLayout>
      <EmployeeRegistrations />
    </HRLayout>
  );
};

export default EmployeeRegistrationsPage; 