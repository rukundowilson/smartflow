"use client"
import React from 'react';
import HRLayout from '../components/HRLayout';
import EmployeeRegistrations from '../components/EmployeeRegistrations';
import UserApplication_registrationManagement from '../../superadmin/components/userApplicationsManagement';

const EmployeeRegistrationsPage: React.FC = () => {
  return (
    <HRLayout>
      <UserApplication_registrationManagement />
    </HRLayout>
  );
};

export default EmployeeRegistrationsPage; 