"use client"
import React from 'react';
import LineManagerLayout from './components/LineManagerLayout';
import Overview from './components/Overview';

const LineManagerDashboard: React.FC = () => {
  return (
    <LineManagerLayout>
      <Overview />
    </LineManagerLayout>
  );
};

export default LineManagerDashboard; 