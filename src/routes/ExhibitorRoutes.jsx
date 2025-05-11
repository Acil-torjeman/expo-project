// src/routes/ExhibitorRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { UserRole } from '../constants/roles';
import NotFound from '../pages/NotFound';

// Exhibitor pages
import ExhibitorDashboard from '../pages/Exhibitor/Dashboard';
import ExhibitorEvents from '../pages/Exhibitor/Events';
import ExhibitorEventDetail from '../pages/Exhibitor/EventDetail';
import ExhibitorMessages from '../pages/Exhibitor/Messages';
import ExhibitorRegistrations from '../pages/Exhibitor/Registrations';
import ExhibitorRegistrationDetail from '../pages/Exhibitor/RegistrationDetail';
import RegistrationWizard from '../pages/Exhibitor/RegistrationWizard';
import ExhibitorStands from '../pages/Exhibitor/Stands';
import ExhibitorEquipment from '../pages/Exhibitor/Equipment';
import ExhibitorInvoices from '../pages/Exhibitor/Invoices';
import InvoiceDetails from '../pages/Exhibitor/InvoiceDetails';
import PaymentSuccess from '../pages/Exhibitor/PaymentSuccess';
import PaymentCancel from '../pages/Exhibitor/PaymentCancel';
import ExhibitorNotifications from '../pages/Exhibitor/Notifications';
import ExhibitorSettings from '../pages/Exhibitor/Settings';

/**
 * Configuration for exhibitor routes
 * All routes are protected with exhibitor role verification
 */
const ExhibitorRoutes = () => {
  return (
    <Routes>
      {/* Dashboard - Main exhibitor page */}
      <Route 
        path="dashboard" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <ExhibitorDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Events */}
      <Route 
        path="events" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <ExhibitorEvents />
          </ProtectedRoute>
        } 
      />
      
      {/* Event Detail */}
      <Route 
        path="events/:eventId" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <ExhibitorEventDetail />
          </ProtectedRoute>
        } 
      />
      
      {/* Registrations */}
      <Route 
        path="registrations" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <ExhibitorRegistrations />
          </ProtectedRoute>
        } 
      />
      
      {/* Registration Detail */}
      <Route 
        path="registrations/:registrationId" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <ExhibitorRegistrationDetail />
          </ProtectedRoute>
        } 
      />
      
      {/* Registration Wizard - Unified selection process */}
      <Route 
        path="registrations/:registrationId/selection" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <RegistrationWizard />
          </ProtectedRoute>
        } 
      />

      {/* Invoice Details */}
      <Route 
        path="invoices/:invoiceId" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <InvoiceDetails />
          </ProtectedRoute>
        } 
      />
      
      {/* Stands */}
      <Route 
        path="stands" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <ExhibitorStands />
          </ProtectedRoute>
        } 
      />
      
      {/* Equipment */}
      <Route 
        path="equipment" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <ExhibitorEquipment />
          </ProtectedRoute>
        } 
      />
      
      {/* Invoices */}
      <Route 
        path="invoices" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <ExhibitorInvoices />
          </ProtectedRoute>
        } 
      />
      
      {/* Messages */}
      <Route 
        path="messages" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <ExhibitorMessages />
          </ProtectedRoute>
        } 
      />
      
      {/* Notifications */}
      <Route 
        path="notifications" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <ExhibitorNotifications />
          </ProtectedRoute>
        } 
      />
      
      {/* Settings */}
      <Route 
        path="settings" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <ExhibitorSettings />
          </ProtectedRoute>
        } 
      />

      {/* Payment Routes - Only success and cancel, no processor page */}
      <Route 
        path="payments/success" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <PaymentSuccess />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="payments/cancel" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <PaymentCancel />
          </ProtectedRoute>
        } 
      />
      
      {/* Redirect root to dashboard */}
      <Route 
        path="/" 
        element={<Navigate to="dashboard" replace />} 
      />
      
      {/* Not Found - 404 handler for exhibitor routes */}
      <Route 
        path="*" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <NotFound />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default ExhibitorRoutes;