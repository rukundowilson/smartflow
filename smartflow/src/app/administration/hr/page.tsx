"use client"
import React from 'react';
import HRLayout from './components/HRLayout';
import Overview from './components/Overview';

const HRDashboard: React.FC = () => {
  return (
    <HRLayout>
      <Overview />
    </HRLayout>
  );
};

export default HRDashboard;