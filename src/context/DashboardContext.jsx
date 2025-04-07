// src/context/DashboardContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import adminService from '../services/admin.service';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export function DashboardProvider({ children }) {
  // Dashboard stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
  });
  
  // Recent users
  const [recentUsers, setRecentUsers] = useState([]);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Error state
  const [error, setError] = useState(null);
  
  // Get current page title based on URL
  const location = useLocation();
  const toast = useToast();
  
  const getCurrentPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/accounts')) return 'Accounts';
    if (path.includes('/trash')) return 'Trash';
    if (path.includes('/messages')) return 'Messages';
    if (path.includes('/notifications')) return 'Notifications';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/profile')) return 'Profile';
    if (path.includes('/events')) return 'Events';
    return 'Dashboard';
  };
  
  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get stats from service
      const statsData = await adminService.getDashboardStats();
      setStats(statsData);
      
      // Get recent users
      const recentUsersData = await adminService.getRecentUsers(5);
      setRecentUsers(recentUsersData);
      
      return { stats: statsData, recentUsers: recentUsersData };
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format date utility function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Value object provided by context
  const contextValue = {
    stats,
    recentUsers,
    isLoading,
    error,
    currentPageTitle: getCurrentPageTitle(),
    fetchDashboardData,
    formatDate,
  };
  
  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}