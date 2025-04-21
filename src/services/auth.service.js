// src/services/auth.service.js
import axios from 'axios';
// URL of the backend API with the correct port

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
export const authService = {

  _isRefreshing: false,
  _refreshAttempts: 0,
  MAX_REFRESH_ATTEMPTS: 1,
  // Login with credentials
  login: async (credentials) => {
    try {
      console.log('Login credentials:', credentials);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      
      console.log('Login response:', response.data);
      
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        
        // Store user information
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      
      // Prepare a detailed error message
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response && error.response.data && error.response.data.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join(', ');
        } else {
          errorMessage = error.response.data.message;
        }
      }
      
      throw new Error(errorMessage);
    }
  },
  
  exhibitorSignup: async (formData) => {
    try {
      // Create a FormData object to send files
      const data = new FormData();
      
      // Add files
      const fileFields = ['kbisDocument', 'companyLogo', 'insuranceCertificate'];
      fileFields.forEach(field => {
        if (formData[field]) {
          data.append(field, formData[field]);
        }
      });
      
      // Add other form data
      Object.keys(formData).forEach(key => {
        if (!fileFields.includes(key)) {
          // Convert booleans to strings to avoid transmission issues
          if (typeof formData[key] === 'boolean') {
            data.append(key, formData[key].toString());
          } else if (formData[key] !== null && formData[key] !== undefined) {
            data.append(key, formData[key]);
          }
        }
      });
      
      // Send the request with an increased timeout
      const response = await axios.post(`${API_BASE_URL}/exhibitor-signup`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds to allow for file uploads
      });
      
      return response.data;
    } catch (error) {
      // Detailed error handling
      console.error("Registration error:", error);
      
      // Check if it's a timeout error
      if (error.code === 'ECONNABORTED') {
        throw new Error("Connection timeout. The server is taking too long to respond. Please try again later.");
      }
      
      // Check if the server is unreachable
      if (error.code === 'ECONNREFUSED') {
        throw new Error("Unable to connect to the server. Please check your internet connection or try again later.");
      }
      
      if (error.response) {
        // The server responded with an error
        let errorMessage = 'Registration failed. Please try again.';
        
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data && error.response.data.message) {
          // For standard NestJS responses
          if (Array.isArray(error.response.data.message)) {
            errorMessage = error.response.data.message.join(', ');
          } else {
            errorMessage = error.response.data.message;
          }
        }
        
        // Specific case for email already in use
        if (error.response.status === 409) {
          errorMessage = 'This email address is already in use. Please use a different email address.';
        }
        
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error("No response from server. Please check your internet connection or try again later.");
      } else {
        // An error occurred while setting up the request
        throw new Error(`Registration failed: ${error.message}`);
      }
    }
  },
  
  // Refresh token
  refreshToken: async () => {
    try {
      // Avoid duplicate refresh attempts
      if (authService._isRefreshing) {
        return false;
      }
      
      // Set refreshing flag
      authService._isRefreshing = true;
      
      // Check for refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      
      // Get user ID
      let userId;
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          userId = user._id || user.id;
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
      
      // If no refresh token or user ID, clear auth state
      if (!refreshToken || !userId) {
        console.warn('No refresh token or user ID found');
        authService.logout(false); // Silent logout - don't show toasts
        return false;
      }
      
      // Send refresh request
      const response = await axios.post(`${API_BASE_URL}/refresh`, {
        userId: userId,
        refreshToken: refreshToken,
      });
      
      // Process successful refresh
      if (response.data.access_token && response.data.refresh_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        
        // Update user data if provided
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        authService._isRefreshing = false;
        return true;
      }
      
      // Clear auth state on failure
      authService.logout(false); // Silent logout
      authService._isRefreshing = false;
      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      authService.logout(false); // Silent logout
      authService._isRefreshing = false;
      return false;
    }
  },
  
  // Logout
  logout: async (showToast = true) => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      let userId;
      
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          userId = user._id || user.id;
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
      
      // Try to notify server but don't wait
      if (refreshToken && userId) {
        try {
          axios.post(`${API_BASE_URL}/logout`, {
            userId: userId,
            refreshToken: refreshToken,
          }).catch(e => {
            console.error("Error during logout API call:", e);
          });
        } catch (error) {
          console.error("Logout error:", error);
        }
      }
    } finally {
      // Always clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },
  
  
  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/verify-email?token=${token}`);
      return response.data;
    } catch (error) {
      console.error("Email verification error:", error);
      
      let errorMessage = "Email verification failed. Please try again.";
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },
  
  // Resend verification email
  resendVerificationEmail: async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/resend-verification`, { email });
      return response.data;
    } catch (error) {
      console.error("Error resending verification email:", error);
      
      let errorMessage = "Failed to resend verification email. Please try again.";
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },
  
  // Get current user
  getCurrentUser: () => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) return null;
      return JSON.parse(userString);
    } catch (error) {
      console.error("Error retrieving user data:", error);
      // In case of error, clean localStorage
      localStorage.removeItem('user');
      return null;
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    return !!token && !!user;
  },

  // Get token for API requests
  getToken: () => {
    return localStorage.getItem('access_token');
  },
  
  // Forgot password
  forgotPassword: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/forgot-password`, data);
      return response.data;
    } catch (error) {
      console.error("Error in forgot password:", error);
      
      // Return standardized error
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to process forgot password request');
    }
  },
  
  // Reset password
  resetPassword: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/reset-password`, data);
      return response.data;
    } catch (error) {
      console.error("Error in reset password:", error);
      
      // Parse error message
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to reset password');
    }
  },
  
  // Configure axios with interceptor for automatic refresh
 setupAxiosInterceptors: () => {
  // Reset refresh attempts counter
  authService._refreshAttempts = 0;
  const MAX_REFRESH_ATTEMPTS = 1;
  
  // Remove any existing interceptors to avoid duplicates
  axios.interceptors.request.eject(authService._requestInterceptor);
  axios.interceptors.response.eject(authService._responseInterceptor);
  
  // Setup request interceptor
  authService._requestInterceptor = axios.interceptors.request.use(
    (config) => {
      const token = authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Setup response interceptor
  authService._responseInterceptor = axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Only attempt refresh on 401 errors, not previously retried
      if (
        error.response?.status === 401 && 
        !originalRequest._retry && 
        authService._refreshAttempts < MAX_REFRESH_ATTEMPTS
      ) {
        originalRequest._retry = true;
        authService._refreshAttempts++;
        
        try {
          const refreshed = await authService.refreshToken();
          
          if (refreshed) {
            // Update token in request and retry
            const newToken = authService.getToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            authService._refreshAttempts = 0;
            return axios(originalRequest);
          } else {
            // Silent logout on failure
            authService.logout(false);
            return Promise.reject(error);
          }
        } catch (refreshError) {
          console.error("Token refresh error:", refreshError);
          authService.logout(false);
          return Promise.reject(refreshError);
        }
      }
      
      // If max attempts reached, logout silently
      if (authService._refreshAttempts >= MAX_REFRESH_ATTEMPTS && error.response?.status === 401) {
        console.warn("Max refresh attempts reached, logging out");
        authService.logout(false);
        authService._refreshAttempts = 0;
      }
      
      return Promise.reject(error);
    }
  );
},
};