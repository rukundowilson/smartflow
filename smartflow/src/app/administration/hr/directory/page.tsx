"use client"
import React from 'react';
import HRLayout from '../components/HRLayout';
import EmployeeDirectory from '../components/EmployeeDirectory';

const EmployeeDirectoryPage: React.FC = () => {
  return (
    <HRLayout>
      <EmployeeDirectory />
    </HRLayout>
  );
};

export default EmployeeDirectoryPage; 