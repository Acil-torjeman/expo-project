// src/App.jsx
import React, { useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import AppRoutes from './routes';
import { useAuth } from './context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from './services/auth.service';

/**
 * Main Application component
 * Handles authentication checks and redirects
 */
function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuth();

  // Check user authentication on load
  useEffect(() => {
    // Skip during initial loading
    if (isLoading) return;
    
    // Check if user is on an auth page
    const isAuthPath = 
      location.pathname.includes('/login') || 
      location.pathname.includes('/signup') || 
      location.pathname.includes('/forgot-password') ||
      location.pathname.includes('/reset-password') ||
      location.pathname === '/';
  
    // Setup auth interceptors but don't show toasts here
    authService.setupAxiosInterceptors();
    
    // If authenticated user tries to access auth pages, redirect to dashboard silently
    if (isAuthenticated && isAuthPath) {
      // Redirect based on user role
      if (user) {
        const dashboardPath = `/${user.role}/dashboard`;
        navigate(dashboardPath, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, location.pathname, navigate, isLoading]);

  return (
    <Box minH="100vh" bg="gray.50">
      <AppRoutes />
    </Box>
  );
}

export default App;