"use client"
import React from 'react';
import HODLayout from './components/HODLayout';
import Overview from './components/Overview';

export default function HODDashboard() {
  return (
    <HODLayout>
      <Overview />
    </HODLayout>
  );
}