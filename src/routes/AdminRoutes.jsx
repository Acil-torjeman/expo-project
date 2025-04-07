import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from '../pages/admin/Dashboard';
import Accounts from '../pages/admin/Accounts';
import Trash from '../pages/admin/Trash';
import Messages from '../pages/admin/Messages';
import Notifications from '../pages/admin/Notifications';
import Settings from '../pages/admin/Settings';
import NotFound from '../pages/NotFound';
import { UserRole } from '../constants/roles';

/**
 * Admin routes configuration
 * All routes are protected with admin role requirement
 */
const AdminRoutes = () => {
  return (
    <Routes>
      {/* Dashboard - Main admin page */}
      <Route 
        path="dashboard" 
        element={
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* User Accounts Management */}
      <Route 
        path="accounts" 
        element={
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <Accounts />
          </ProtectedRoute>
        } 
      />
      
      {/* Trash - Deleted Items */}
      <Route 
        path="trash" 
        element={
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <Trash />
          </ProtectedRoute>
        } 
      />
      
      {/* Messages */}
      <Route 
        path="messages" 
        element={
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <Messages />
          </ProtectedRoute>
        } 
      />
      
      {/* Notifications */}
      <Route 
        path="notifications" 
        element={
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <Notifications />
          </ProtectedRoute>
        } 
      />
      
      {/* Settings */}
      <Route 
        path="settings" 
        element={
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <Settings />
          </ProtectedRoute>
        } 
      />
      
      {/* Not Found - Handle 404 for admin routes */}
      <Route 
        path="*" 
        element={
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <NotFound />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default AdminRoutes;