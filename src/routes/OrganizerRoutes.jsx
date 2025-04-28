// src/routes/OrganizerRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { UserRole } from '../constants/roles';
import NotFound from '../pages/NotFound';

// Organizer pages
import OrganizerDashboard from '../pages/organizer/Dashboard';
import OrganizerEvents from '../pages/organizer/Events';
import OrganizerExhibitors from '../pages/organizer/Exhibitors';
import OrganizerPlans from '../pages/organizer/Plans';
import OrganizerStands from '../pages/organizer/Stands';
import OrganizerEquipment from '../pages/organizer/Equipment';
import OrganizerRegistrations from '../pages/organizer/Registrations';
import OrganizerRegistrationDetails from '../pages/organizer/RegistrationDetails'; // New import
import OrganizerInvoices from '../pages/organizer/Invoices';
import OrganizerMessages from '../pages/organizer/Messages';
import OrganizerNotifications from '../pages/organizer/Notifications';
import OrganizerAnalytics from '../pages/organizer/Analytics';
import OrganizerSettings from '../pages/organizer/Settings';

/**
 * Configuration des routes organisateur
 * Toutes les routes sont protégées avec vérification du rôle organisateur
 */
const OrganizerRoutes = () => {
  return (
    <Routes>
      {/* Dashboard - Page principale organisateur */}
      <Route 
        path="dashboard" 
        element={
          <ProtectedRoute requiredRole={UserRole.ORGANIZER}>
            <OrganizerDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Gestion des événements */}
      <Route 
        path="events" 
        element={
          <ProtectedRoute requiredRole={UserRole.ORGANIZER}>
            <OrganizerEvents />
          </ProtectedRoute>
        } 
      />
      
      {/* Gestion des exposants */}
      <Route 
        path="exhibitors" 
        element={
          <ProtectedRoute requiredRole={UserRole.ORGANIZER}>
            <OrganizerExhibitors />
          </ProtectedRoute>
        } 
      />
      
      {/* Plans de salle */}
      <Route 
        path="plans" 
        element={
          <ProtectedRoute requiredRole={UserRole.ORGANIZER}>
            <OrganizerPlans />
          </ProtectedRoute>
        } 
      />
      
      {/* Stands management for a specific plan */}
      <Route 
        path="plans/:planId/stands" 
        element={
          <ProtectedRoute requiredRole={UserRole.ORGANIZER}>
            <OrganizerStands />
          </ProtectedRoute>
        } 
      />
      
      {/* Équipements */}
      <Route 
        path="equipment" 
        element={
          <ProtectedRoute requiredRole={UserRole.ORGANIZER}>
            <OrganizerEquipment />
          </ProtectedRoute>
        } 
      />
      
      {/* Inscriptions */}
      <Route 
        path="registrations" 
        element={
          <ProtectedRoute requiredRole={UserRole.ORGANIZER}>
            <OrganizerRegistrations />
          </ProtectedRoute>
        } 
      />
      
      {/* Détails d'une inscription (nouvelle route) */}
      <Route 
        path="registrations/:id" 
        element={
          <ProtectedRoute requiredRole={UserRole.ORGANIZER}>
            <OrganizerRegistrationDetails />
          </ProtectedRoute>
        } 
      />
      
      {/* Factures */}
      <Route 
        path="invoices" 
        element={
          <ProtectedRoute requiredRole={UserRole.ORGANIZER}>
            <OrganizerInvoices />
          </ProtectedRoute>
        } 
      />
      
      {/* Messages */}
      <Route 
        path="messages" 
        element={
          <ProtectedRoute requiredRole={UserRole.ORGANIZER}>
            <OrganizerMessages />
          </ProtectedRoute>
        } 
      />
      
      {/* Notifications */}
      <Route 
        path="notifications" 
        element={
          <ProtectedRoute requiredRole={UserRole.ORGANIZER}>
            <OrganizerNotifications />
          </ProtectedRoute>
        } 
      />
      
      {/* Analytiques */}
      <Route 
        path="analytics" 
        element={
          <ProtectedRoute requiredRole={UserRole.ORGANIZER}>
            <OrganizerAnalytics />
          </ProtectedRoute>
        } 
      />
      
      {/* Paramètres */}
      <Route 
        path="settings" 
        element={
          <ProtectedRoute requiredRole={UserRole.ORGANIZER}>
            <OrganizerSettings />
          </ProtectedRoute>
        } 
      />
      
      {/* Redirection du / vers dashboard */}
      <Route 
        path="/" 
        element={<Navigate to="dashboard" replace />} 
      />
      
      {/* Not Found - Gestion des 404 pour les routes organisateur */}
      <Route 
        path="*" 
        element={
          <ProtectedRoute requiredRole={UserRole.ORGANIZER}>
            <NotFound />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default OrganizerRoutes;