// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useToast } from '@chakra-ui/react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  // Initialize auth state from local storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const hasToken = authService.getToken() !== null;
        const currentUser = authService.getCurrentUser();

        // If token exists but user data is missing, try to refresh the token
        if (hasToken && !currentUser) {
          const refreshed = await authService.refreshToken();
          if (!refreshed) {
            // If refresh fails, clear the auth state
            setUser(null);
            setIsAuthenticated(false);
            return;
          }
        }

        // Set the auth state based on the token and user data
        setUser(currentUser);
        setIsAuthenticated(hasToken && currentUser !== null);

        // Setup axios interceptors for token refresh
        authService.setupAxiosInterceptors();
      } catch (error) {
        console.error("Error initializing auth context:", error);
        // Clear auth state if there's an error
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      toast({
        title: 'Login Successful',
        description: 'Welcome to ExpoManagement!',
        status: 'success',
        duration: 5000, // Increased from 3000 for better visibility
        isClosable: true,
      });
      
      // Redirect based on user role
      if (response.user && response.user.role) {
        const redirectPath = `/${response.user.role}/dashboard`;
        navigate(redirectPath);
      } else {
        navigate('/dashboard');
      }
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      
      toast({
        title: 'Login Failed',
        description: error.message || 'An error occurred during login',
        status: 'error',
        duration: 7000, // Increased from 5000 for better visibility
        isClosable: true,
        position: "top" // Make it more visible
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear auth state before API call to prevent flashes
      setUser(null);
      setIsAuthenticated(false);
      
      await authService.logout();
      
      toast({
        title: 'Logout Successful',
        status: 'success',
        duration: 5000, // Increased from 3000 for better visibility
        isClosable: true,
      });
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      
      // Force logout even if API call fails
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has required role
  const hasRole = (requiredRole) => {
    if (!isAuthenticated || !user) return false;
    
    // If no role is required, return true for any authenticated user
    if (!requiredRole) return true;
    
    // Check if user has the required role
    return user.role === requiredRole;
  };

  // Value object to be provided by context
  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}