// src/routes/ExhibitorRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { UserRole } from '../constants/roles';
import NotFound from '../pages/NotFound';

// Exhibitor pages
import ExhibitorDashboard from '../pages/exhibitor/Dashboard';
import ExhibitorEvents from '../pages/Exhibitor/Events';
import ExhibitorEventDetail from '../pages/Exhibitor/EventDetail';
import ExhibitorMessages from '../pages/exhibitor/Messages';
import ExhibitorRegistrations from '../pages/exhibitor/Registrations';
import ExhibitorRegistrationDetail from '../pages/Exhibitor/RegistrationDetail';
import ExhibitorSelectStands from '../pages/Exhibitor/SelectStands';
import ExhibitorSelectEquipment from '../pages/Exhibitor/SelectEquipment';
import ExhibitorStands from '../pages/exhibitor/Stands';
import ExhibitorEquipment from '../pages/exhibitor/Equipment';
import ExhibitorInvoices from '../pages/exhibitor/Invoices';
import ExhibitorPayments from '../pages/exhibitor/Payments';
import ExhibitorNotifications from '../pages/exhibitor/Notifications';
import ExhibitorSettings from '../pages/exhibitor/Settings';
import ExhibitorConfirmRegistration from '../pages/Exhibitor/ConfirmRegistration';

/**
 * Configuration des routes exposant
 * Toutes les routes sont protégées avec vérification du rôle exposant
 */
const ExhibitorRoutes = () => {
  return (
    <Routes>
      {/* Dashboard - Page principale exposant */}
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
      
      {/* Registration Detail - Missing route that's causing the 404 */}
      <Route 
        path="registrations/:registrationId" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <ExhibitorRegistrationDetail />
          </ProtectedRoute>
        } 
      />
      
      {/* Select Stands - Missing route for stand selection */}
      <Route 
        path="registrations/:registrationId/stands" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <ExhibitorSelectStands />
          </ProtectedRoute>
        } 
      />
      
      {/* Select Equipment - Missing route for equipment selection */}
      <Route 
        path="registrations/:registrationId/equipment" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <ExhibitorSelectEquipment />
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
      
      {/* Payments */}
      <Route 
        path="payments" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <ExhibitorPayments />
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

      {/* Confirm Registration - New route for the confirmation step */}
      <Route 
        path="registrations/:registrationId/confirm" 
        element={
          <ProtectedRoute requiredRole={UserRole.EXHIBITOR}>
            <ExhibitorConfirmRegistration />
          </ProtectedRoute>
        } 
      />
      
      {/* Redirection du / vers dashboard */}
      <Route 
        path="/" 
        element={<Navigate to="dashboard" replace />} 
      />
      
      {/* Not Found - Gestion des 404 pour les routes exposant */}
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