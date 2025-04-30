// src/routes/index.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Selectrole from '../pages/Selectrole';
import Login from '../pages/auth/Login';
import ExhibitorSignup from '../pages/auth/ExhibitorSignup';
import OrganizerSignup from '../pages/auth/OrganizerSignup';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage'; 
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import NotFound from '../pages/NotFound';
import Dashboard from '../pages/Dashboard';
import ProtectedRoute from './ProtectedRoute';

// Import the Profile page
const Profile = React.lazy(() => import('../pages/Profile'));

// Lazy load role-specific route components for better performance
const AdminRoutes = React.lazy(() => import('./AdminRoutes'));
const OrganizerRoutes = React.lazy(() => import('./OrganizerRoutes'));
const ExhibitorRoutes = React.lazy(() => import('./ExhibitorRoutes'));

// Fallback component for lazy loading
const LazyLoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    Loading...
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Selectrole />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup/exhibitor" element={<ExhibitorSignup />} />
      <Route path="/signup/organizer" element={<OrganizerSignup />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Protected generic dashboard route redirects to role-specific dashboard */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* Profile route accessible to all authenticated users */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <React.Suspense fallback={<LazyLoadingFallback />}>
            <Profile />
          </React.Suspense>
        </ProtectedRoute>
      } />
      
      {/* Role-specific route groups */}
      <Route path="/admin/*" element={
        <React.Suspense fallback={<LazyLoadingFallback />}>
          <AdminRoutes />
        </React.Suspense>
      } />
      
      <Route path="/organizer/*" element={
        <React.Suspense fallback={<LazyLoadingFallback />}>
          <OrganizerRoutes />
        </React.Suspense>
      } />
      
      <Route path="/exhibitor/*" element={
        <React.Suspense fallback={<LazyLoadingFallback />}>
          <ExhibitorRoutes />
        </React.Suspense>
      } />
      
      {/* 404 Not Found for authenticated users */}
      <Route path="/not-found" element={
        <ProtectedRoute>
          <NotFound />
        </ProtectedRoute>
      } />
      
      {/* Default redirect for unknown routes */}
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
};

export default AppRoutes;